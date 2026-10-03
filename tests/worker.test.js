import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } from 'jose';
import worker, { createWorker, createGoogleVerifier } from '../worker.mjs';
import { createState, loadState, startSession, learnNext, answer } from '../engine.js';
import { stages } from '../data.js';

const origin = 'https://word-odyssey.example.com';
const migration = await readFile(new URL('../migrations/0001_initial.sql', import.meta.url), 'utf8');
// Exercise real SQLite constraints and RETURNING/CAS SQL behind the D1 interface.
class D1Database {
  constructor() { this.sqlite = new DatabaseSync(':memory:'); this.sqlite.exec(migration); }
  prepare(sql) {
    const statement = this.sqlite.prepare(sql);
    let args = [];
    const wrapper = {
      bind(...values) { args = values.map(value => value instanceof ArrayBuffer ? new Uint8Array(value) : value); return wrapper; },
      async first() { return statement.get(...args) ?? null; },
      async run() { const result = statement.run(...args); return { success: true, meta: { changes: Number(result.changes) } }; },
    };
    return wrapper;
  }
  async batch(statements) {
    this.sqlite.exec('BEGIN');
    try { const results = []; for (const statement of statements) results.push(await statement.run()); this.sqlite.exec('COMMIT'); return results; }
    catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
}
async function fixture(run, { configured = true, verifyToken, now } = {}) {
  const db = new D1Database();
  const api = createWorker({ now, verifyToken: verifyToken ?? (async token => {
    if (!['alice', 'bob'].includes(token)) throw Error('invalid');
    return { sub: token, name: token, email: `${token}@example.com`, email_verified: true };
  }) });
  const env = { DB: db, GOOGLE_CLIENT_ID: configured ? 'test-client' : '', APP_ORIGIN: origin };
  const request = async (path, { method = 'GET', cookie, body, raw, requestOrigin = origin, contentType = 'application/json' } = {}) => {
    const response = await api.fetch(new Request(origin + path, {
      method, headers: { Origin: requestOrigin, 'Content-Type': contentType, ...(cookie ? { Cookie: cookie } : {}) },
      ...(body !== undefined || raw !== undefined ? { body: raw ?? JSON.stringify(body) } : {}),
    }), env);
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { data = text; }
    return { status: response.status, data, headers: response.headers, cookie: response.headers.get('Set-Cookie')?.split(';')[0] };
  };
  try { await run({ request, db, env }); } finally { db.sqlite.close(); }
}
function snapshot(progress = createState()) {
  return { progress, adventure: { version: 1, seed: 123, role: 'scholar', choices: {} }, locale: 'en' };
}
function earnedState() {
  const state = createState(), session = startSession(state, 1);
  while (session.phase !== 'complete') {
    if (session.phase === 'learn') learnNext(state, session);
    else answer(state, session, true);
  }
  return state;
}
const login = (request, credential = 'alice') => request('/api/auth/google', { method: 'POST', body: { credential } });
const save = (request, account, revision, value = snapshot(), expectedAccountId = 'alice') => request('/api/progress', {
  method: 'PUT', cookie: account.cookie, body: { expectedAccountId, revision, snapshot: value },
});

test('Google verification checks RS256 signature, Google issuers, audience, expiration and verified identity', async () => {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = { ...await exportJWK(publicKey), kid: 'fixture', alg: 'RS256' };
  const verify = createGoogleVerifier(createLocalJWKSet({ keys: [jwk] }));
  const claims = { sub: 'alice', email_verified: true, iss: 'https://accounts.google.com', aud: 'test-client', exp: Math.floor(Date.now() / 1000) + 3600 };
  const sign = (overrides = {}, key = privateKey) => new SignJWT({ ...claims, ...overrides }).setProtectedHeader({ alg: 'RS256', kid: 'fixture' }).sign(key);
  assert.equal((await verify(await sign(), 'test-client')).sub, 'alice');
  assert.equal((await verify(await sign({ iss: 'accounts.google.com' }), 'test-client')).sub, 'alice');
  for (const overrides of [{ iss: 'https://attacker.example' }, { aud: 'other-client' }, { exp: 1 }, { exp: undefined }, { sub: '' }, { sub: undefined }, { email_verified: false }, { email_verified: 'true' }]) {
    await assert.rejects(verify(await sign(overrides), 'test-client'));
  }
  const other = await generateKeyPair('RS256');
  await assert.rejects(verify(await sign({}, other.privateKey), 'test-client'));
  const hmac = await new SignJWT(claims).setProtectedHeader({ alg: 'HS256' }).sign(new Uint8Array(32));
  await assert.rejects(verify(hmac, 'test-client'));
});

test('production handler rejects test credentials and endpoints enforce origin, JSON, auth and route allowlist', async () => {
  await fixture(async ({ request, env }) => {
    const production = await worker.fetch(new Request(origin + '/api/auth/google', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: 'alice' }) }), { ...env, TEST_TOKEN: 'alice', verifyToken: () => ({ sub: 'alice' }) });
    assert.equal(production.status, 401);
    assert.equal((await login(request, 'forged')).status, 401);
    assert.equal((await request('/api/progress')).status, 401);
    for (const bad of [{ requestOrigin: 'https://attacker.example' }, { requestOrigin: 'null' }, { contentType: 'text/plain' }, { contentType: 'application/json-bogus' }]) {
      assert.equal((await request('/api/auth/google', { method: 'POST', body: { credential: 'alice' }, ...bad })).status, 403);
    }
    for (const path of ['/api/unknown', '/.env', '/data/progress.sqlite', '/sources/source.csv', '/scripts/build-site.mjs', '/tests/worker.test.js', '/worker.mjs']) assert.equal((await request(path)).status, 404);
    assert.equal((await request('/api/progress', { method: 'DELETE' })).status, 405);
    assert.equal((await request('/api/auth/google', { method: 'POST', raw: '{' })).status, 400);
    assert.equal((await request('/api/auth/google', { method: 'POST', raw: 'null' })).status, 400);
  });
  await fixture(async ({ request }) => assert.equal((await login(request)).status, 503), { configured: false });
});

test('sessions store only a hash and use Secure/HttpOnly cookie; account data and logout are isolated', async () => {
  await fixture(async ({ request, db }) => {
    const a = await login(request), b = await login(request, 'bob');
    const setCookie = a.headers.get('Set-Cookie');
    for (const part of ['Secure', 'HttpOnly', 'SameSite=Lax', 'Path=/']) assert.ok(setCookie.includes(part));
    const raw = a.cookie.split('=')[1];
    const stored = db.sqlite.prepare('SELECT token_hash FROM sessions WHERE user_id=?').get('alice').token_hash;
    assert.notEqual(stored, raw);
    assert.equal(stored, createHash('sha256').update(raw).digest('hex'));
    const value = snapshot(earnedState());
    assert.equal((await save(request, a, 0, value)).data.revision, 1);
    assert.deepEqual((await request('/api/progress', { cookie: a.cookie })).data.snapshot, value);
    assert.equal((await request('/api/progress', { cookie: b.cookie })).data.snapshot, null);
    for (const expectedAccountId of ['alice', undefined]) {
      assert.equal((await save(request, b, 0, value, expectedAccountId)).status, 409);
      const logout = await request('/api/logout', { method: 'POST', cookie: b.cookie, body: { expectedAccountId } });
      assert.equal(logout.status, 409); assert.equal(logout.cookie, undefined);
    }
    const logout = await request('/api/logout', { method: 'POST', cookie: a.cookie, body: { expectedAccountId: 'alice' } });
    assert.equal(logout.status, 200); assert.equal(logout.cookie, undefined);
    assert.equal((await request('/api/progress', { cookie: a.cookie })).status, 401);
    assert.equal((await request('/api/session', { cookie: b.cookie })).data.user.id, 'bob');
  });
});

test('concurrent first writes and revision updates have exactly one winner; stale and regressive writes cannot overwrite', async () => {
  await fixture(async ({ request }) => {
    const a = await login(request), first = snapshot(earnedState());
    const initial = await Promise.all([save(request, a, 0, first), save(request, a, 0, { ...first, locale: 'zh' })]);
    assert.deepEqual(initial.map(result => result.status).sort(), [200, 409]);
    const next = await Promise.all([save(request, a, 1, first), save(request, a, 1, { ...first, locale: 'zh' })]);
    assert.deepEqual(next.map(result => result.status).sort(), [200, 409]);
    const persisted = (await request('/api/progress', { cookie: a.cookie })).data;
    assert.equal(persisted.revision, 2);
    assert.equal((await save(request, a, 1, first)).data.error, 'revision_conflict');
    assert.equal((await save(request, a, 2, snapshot())).data.error, 'newer_progress_exists');
    assert.deepEqual((await request('/api/progress', { cookie: a.cookie })).data, persisted);
    const b = await login(request, 'bob');
    assert.equal((await save(request, b, 4, snapshot(), 'bob')).status, 409);
    assert.equal((await request('/api/progress', { cookie: b.cookie })).data.revision, 0);
  });
});

test('invalid progress, adventure and oversized JSON never advance the revision', async () => {
  await fixture(async ({ request }) => {
    const a = await login(request);
    assert.equal((await save(request, a, 0, { ...snapshot(), progress: { version: 2, words: {} } })).data.error, 'invalid_progress');
    for (const adventure of [null, undefined, { version: 1 }, { ...snapshot().adventure, seed: -1 }, { ...snapshot().adventure, choices: { '101:1': { action: 'courage', role: 'scout' } } }]) {
      assert.equal((await save(request, a, 0, { ...snapshot(), adventure })).data.error, 'invalid_adventure');
    }
    assert.equal((await request('/api/progress', { method: 'PUT', cookie: a.cookie, raw: 'x'.repeat(4_000_001) })).status, 413);
    assert.equal((await request('/api/progress', { cookie: a.cookie })).data.revision, 0);
  });
});

test('expired sessions are rejected and malformed cookies cannot become identities', async () => {
  let time = 1_700_000_000_000;
  await fixture(async ({ request }) => {
    const a = await login(request);
    time += 7 * 86400 * 1000;
    assert.equal((await request('/api/progress', { cookie: a.cookie })).status, 401);
    assert.equal((await request('/api/session', { cookie: 'word_odyssey_session=alice' })).data.user, null);
  }, { now: () => time });
});

test('a complete 7,000-word snapshot round-trips below the D1 row limit', async () => {
  const state = createState(), time = 1_700_000_000_000;
  for (const stage of stages) for (const word of stage.words) state.words[word.id] = {
    stageId: stage.id, learnedAt: time, lastReviewed: time, correct: 10,
    incorrect: 0, streak: 10, reviewCount: 9, mastery: 5, recallCount: 5,
    nextReviewMode: 'recall', nextDue: time + 86400000,
  };
  const complete = loadState(state), value = snapshot(complete);
  assert.equal(Object.keys(complete.words).length, 7000);
  assert.doesNotThrow(() => loadState(complete, { strict: true }));
  await fixture(async ({ request, db }) => {
    const account = await login(request), result = await save(request, account, 0, value);
    assert.equal(result.status, 200);
    const bytes = db.sqlite.prepare('SELECT length(snapshot) AS bytes FROM progress').get().bytes;
    assert.ok(bytes < 1_800_000);
    assert.deepEqual((await request('/api/progress', { cookie: account.cookie })).data.snapshot, value);
  });
});
test('short batches and separate learning records roundtrip through account API without leaking to another account',()=>fixture(async({request})=>{
 const progress=createState(),q=startSession(progress,1,Date.now(),{size:3});
 while(q.phase!=='complete'){if(q.phase==='learn')learnNext(progress,q);else answer(progress,q,true);}
 const value=snapshot(progress);value.adventure.learning={batchSize:3,draft:null,activities:[{id:'transfer:home:test',kind:'transfer',stageId:1,response:'I went home.',evidence:'Home is the destination.',result:'needs-review',at:new Date().toISOString()}]};
 const a=await login(request);const result=await save(request,a,0,value);assert.equal(result.status,200);
 const loaded=await request('/api/session',{cookie:a.cookie});assert.equal(loaded.status,200);assert.equal(loaded.data.snapshot.progress.xp,30);assert.deepEqual(loaded.data.snapshot.adventure.learning,value.adventure.learning);
 const b=await login(request,'bob');const other=await request('/api/session',{cookie:b.cookie});assert.equal(other.data.snapshot,null);
}));
