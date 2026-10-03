import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngine } from '../engine.js';

const NOW = 1_800_000_000_000;
const DAY = 86_400_000;
const fixtures = quotas => quotas.map((quota, index) => ({
  id: index + 1, quota,
  words: Array.from({ length: quota }, (_, i) => ({ id: `s${index + 1}w${i + 1}`, word: `word-${index + 1}-${i + 1}` })),
}));
const ids = stage => stage.words.map(word => word.id);
function finish(engine, state, session, now = NOW) {
  let steps = 0;
  while (session.phase !== 'complete') {
    if (++steps > 20_000) throw new Error('Session did not terminate');
    if (session.phase === 'learn') engine.learnNext(state, session, now);
    else engine.answer(state, session, true, now);
  }
  return session;
}
function learnCards(engine, state, session) {
  while (session.phase === 'learn') engine.learnNext(state, session, NOW);
}

test('quests cap new words at ten, commit atomically, and unlock only complete stages', () => {
  const stages = fixtures([23, 4]);
  const engine = createEngine(stages);
  let state = engine.createState();
  for (const stageId of [0, 2, 3, NaN, '1']) assert.throws(() => engine.startSession(state, stageId), RangeError);
  const first = engine.startSession(state, 1, NOW);
  assert.equal(first.phase, 'learn');
  assert.equal(first.newWords.length, 10);
  learnCards(engine, state, first);
  for (let i = 0; i < 9; i++) engine.answer(state, first, true, NOW);
  assert.deepEqual(state, engine.createState());
  engine.answer(state, first, true, NOW);
  assert.equal(first.stageComplete, false);
  assert.equal(first.earnedXp, 100);
  assert.deepEqual(state.completed, []);
  state = engine.loadState(JSON.stringify(state), { strict: true });
  assert.equal(engine.getStats(state).learned, 10);
  assert.throws(() => engine.startSession(state, 2), RangeError);
  const second = engine.startSession(state, 1, NOW);
  assert.equal(second.phase, 'review');
  assert.deepEqual(second.queue, ids(stages[0]).slice(0, 10));
  assert.deepEqual(second.newWords, ids(stages[0]).slice(10, 20));
  finish(engine, state, second);
  const third = engine.startSession(state, 1, NOW);
  assert.deepEqual(third.queue, ids(stages[0]).slice(10, 20));
  assert.equal(third.newWords.length, 3);
  finish(engine, state, third);
  assert.equal(third.stageComplete, true);
  assert.equal(third.earnedXp, 30);
  assert.deepEqual(state.completed, [1]);
  assert.equal(state.xp, 230);
  assert.equal(state.history.length, 3);
  assert.throws(() => engine.startSession(state, 1), RangeError);
  assert.equal(engine.startSession(state, 2, NOW).phase, 'review');
});

test('due old words plus the last quest are deduplicated before any new learning', () => {
  const stages = fixtures([40]);
  const engine = createEngine(stages);
  const state = engine.createState();
  finish(engine, state, engine.startSession(state, 1, NOW));
  finish(engine, state, engine.startSession(state, 1, NOW));
  const session = engine.startSession(state, 1, NOW + DAY);
  assert.equal(session.phase, 'review');
  assert.equal(session.queue.length, 20);
  assert.equal(new Set(session.queue).size, 20);
  engine.learnNext(state, session);
  assert.equal(session.phase, 'review');
  for (let i = 0; i < 19; i++) engine.answer(state, session, true, NOW + DAY);
  assert.equal(session.phase, 'review');
  engine.answer(state, session, true, NOW + DAY);
  assert.equal(session.phase, 'learn');
  assert.deepEqual(session.queue, ids(stages[0]).slice(20, 30));
  const restarted = engine.startSession(state, 1, NOW + DAY);
  assert.equal(restarted.phase, 'review');
  assert.deepEqual(restarted.newWords, session.newWords);
  assert.equal(engine.getStats(state).learned, 20);
});

test('every wrong challenge answer requeues and blocks completion until corrected', () => {
  const engine = createEngine(fixtures([2]));
  const state = engine.createState();
  const session = engine.startSession(state, 1, NOW);
  learnCards(engine, state, session);
  const wrongId = session.queue[0];
  engine.answer(state, session, false, NOW);
  engine.answer(state, session, true, NOW);
  assert.equal(session.phase, 'challenge');
  assert.equal(session.queue[session.index], wrongId);
  engine.answer(state, session, false, NOW);
  assert.equal(state.xp, 0);
  engine.answer(state, session, true, NOW);
  assert.equal(session.phase, 'complete');
  assert.equal(state.words[wrongId].incorrect, 2);
  assert.equal(state.words[wrongId].mastery, 0);
  assert.equal(state.xp, 20);
});

test('review mistakes lower mastery and immediate retries never recover it', () => {
  const engine = createEngine(fixtures([2, 2]));
  const state = engine.createState();
  finish(engine, state, engine.startSession(state, 1, NOW));
  finish(engine, state, engine.reviewSession(state, NOW + DAY), NOW + DAY);
  const session = engine.startSession(state, 2, NOW + 3 * DAY);
  const wrongId = session.queue[0];
  assert.equal(state.words[wrongId].mastery, 1);
  engine.answer(state, session, false, NOW + 3 * DAY);
  assert.equal(state.words[wrongId].mastery, 0);
  engine.answer(state, session, true, NOW + 3 * DAY);
  assert.equal(session.phase, 'review');
  engine.answer(state, session, false, NOW + 3 * DAY);
  engine.answer(state, session, true, NOW + 3 * DAY);
  assert.equal(session.phase, 'learn');
  assert.equal(state.words[wrongId].mastery, 0);
  assert.equal(state.words[wrongId].reviewCount, 1);
  assert.equal(state.words[wrongId].incorrect, 2);
  assert.equal(state.words[wrongId].nextDue, NOW + 3 * DAY + 600_000);
});

test('mastery requires three independently spaced successful reviews, not immediate practice', () => {
  const engine = createEngine(fixtures([2]));
  const state = engine.createState();
  assert.equal(engine.reviewSession(state, NOW).phase, 'complete');
  finish(engine, state, engine.startSession(state, 1, NOW));
  for (let i = 0; i < 5; i++) finish(engine, state, engine.reviewSession(state, NOW), NOW);
  assert.equal(engine.getStats(state, NOW).mastered, 0);
  let time = NOW;
  for (let i = 1; i <= 3; i++) {
    time = state.words.s1w1.nextDue;
    const first = engine.reviewSession(state, time);
    const duplicate = engine.reviewSession(state, time);
    finish(engine, state, first, time);
    finish(engine, state, duplicate, time);
    assert.equal(state.words.s1w1.mastery, i);
    assert.equal(engine.getStats(state, time).mastered, i === 3 ? 2 : 0);
  }
  assert.equal(state.xp, 20);
  assert.equal(state.history.length, 1);
  assert.deepEqual(state.completed, [1]);
  assert.equal(engine.getStats(state, time + 40 * DAY).due, 2);
});

test('duplicate quests and repeated completion do not award XP or history twice', () => {
  const engine = createEngine(fixtures([11, 1]));
  const state = engine.createState();
  const first = engine.startSession(state, 1, NOW);
  const duplicate = engine.startSession(state, 1, NOW);
  finish(engine, state, first);
  finish(engine, state, duplicate);
  assert.equal(duplicate.earnedXp, 0);
  assert.equal(state.xp, 100);
  assert.equal(state.history.length, 1);
  const final = engine.startSession(state, 1, NOW);
  const stale = engine.startSession(state, 1, NOW);
  finish(engine, state, final);
  finish(engine, state, engine.startSession(state, 2, NOW));
  finish(engine, state, stale);
  engine.answer(state, final, true, NOW);
  engine.learnNext(state, final);
  assert.equal(stale.earnedXp, 0);
  assert.equal(stale.stageComplete, true);
  assert.equal(state.xp, 120);
  assert.equal(state.history.length, 3);
  assert.deepEqual(state.completed, [1, 2]);
});

test('loadState restores partial quests, derives credit, and discards malformed or out-of-order words', () => {
  const engine = createEngine(fixtures([21, 2]));
  const state = engine.createState();
  finish(engine, state, engine.startSession(state, 1, NOW));
  finish(engine, state, engine.startSession(state, 1, NOW));
  assert.deepEqual(engine.loadState(JSON.stringify(state), { strict: true }), state);
  for (const raw of ['bad json', 'null', '[]', '{}', '{"version":1,"words":{}}', '{"version":99,"words":{}}']) {
    assert.deepEqual(engine.loadState(raw), engine.createState());
    assert.throws(() => engine.loadState(raw, { strict: true }), TypeError);
  }
  const tampered = structuredClone(state);
  tampered.xp = 999_999;
  tampered.completed = [1, 2, 2, 100];
  tampered.words.unknown = structuredClone(state.words.s1w1);
  tampered.words.s2w1 = { ...state.words.s1w1, stageId: 2 };
  tampered.words.s1w1.mastery = 99;
  tampered.words.s1w1.correct = 101;
  tampered.words.s1w1.reviewCount = 100;
  tampered.words.s1w1.nextDue = 'tomorrow';
  const repaired = engine.loadState(tampered);
  assert.equal(repaired.xp, 200);
  assert.deepEqual(repaired.completed, []);
  assert.equal(repaired.words.unknown, undefined);
  assert.equal(repaired.words.s2w1, undefined);
  assert.equal(repaired.words.s1w1.mastery, 0);
  assert.equal(repaired.words.s1w1.nextDue, NOW);
  assert.throws(() => engine.loadState(tampered, { strict: true }), TypeError);
  delete tampered.words.s1w15;
  const truncated = engine.loadState(tampered);
  assert.equal(Object.keys(truncated.words).length, 10);
  assert.equal(truncated.xp, 100);
  tampered.words.s1w1.learnedAt = 'yesterday';
  assert.deepEqual(engine.loadState(tampered), engine.createState());
  assert.deepEqual(engine.loadState({ version: 2, completed: [1], xp: 210, words: {}, history: [] }), engine.createState());
});

test('incomplete source data cannot become a shorter stage or grant completion', () => {
  const [stage] = fixtures([2]);
  stage.quota = 60;
  const engine = createEngine([stage]);
  assert.throws(() => engine.startSession(engine.createState(), 1, NOW), /尚未完整/);
  assert.throws(() => createEngine([{ ...stage, words: [stage.words[0], stage.words[0]] }]), /識別碼/);
  assert.throws(() => createEngine([{ ...stage, words: [stage.words[0], { id: 'different', word: 'WORD-1-1' }] }]), /不重複/);
});

test('word IDs matching inherited object keys cannot corrupt attempts', () => {
  const engine = createEngine([{ id: 1, words: [{ id: 'toString', word: 'example' }] }]);
  const state = engine.createState();
  finish(engine, state, engine.startSession(state, 1, NOW));
  finish(engine, state, engine.reviewSession(state, NOW + DAY), NOW + DAY);
  assert.equal(state.words.toString.correct, 2);
  assert.equal(state.words.toString.mastery, 1);
  assert.deepEqual(engine.loadState(JSON.stringify(state), { strict: true }), state);
});

test('100 stages reach exactly 1200, 2000 and 7000 unique words without replay credit', () => {
  const quotas = Array.from({ length: 100 }, (_, i) => i < 20 ? 60 : i < 40 ? 40 : i < 80 ? 83 : 84);
  const stages = fixtures(quotas);
  const engine = createEngine(stages);
  let state = engine.createState();
  let quests = 0;
  for (const stage of stages) {
    while (!state.completed.includes(stage.id)) {
      const session = engine.startSession(state, stage.id, NOW);
      assert.ok(session.newWords.length > 0 && session.newWords.length <= 10);
      assert.equal(new Set(session.newWords).size, session.newWords.length);
      if (quests) assert.equal(session.phase, 'review');
      finish(engine, state, session);
      quests++;
    }
    state = engine.loadState(JSON.stringify(state), { strict: true });
    if (stage.id === 20) assert.equal(engine.getStats(state, NOW).learned, 1200);
    if (stage.id === 40) assert.equal(engine.getStats(state, NOW).learned, 2000);
  }
  assert.equal(new Set(Object.keys(state.words)).size, 7000);
  assert.deepEqual(engine.getStats(state, NOW), { learned: 7000, mastered: 0, due: 0, xp: 70000, level: 71, completed: 100 });
  assert.equal(state.history.length, 740);
  assert.equal(quests, 740);
  const legacy = structuredClone(state);
  delete legacy.reviewHistory;
  for (const entry of Object.values(legacy.words)) { delete entry.recallCount; delete entry.nextReviewMode; }
  const migrated = engine.loadState(legacy, { strict: true });
  assert.deepEqual(Object.keys(migrated.words), Object.keys(state.words));
  assert.equal(migrated.xp, 70000);
  assert.deepEqual(migrated.completed, state.completed);
  assert.throws(() => engine.startSession(state, 101), RangeError);
});

test('2000 due words form bounded rounds while preserving the latest quest and oldest backlog', () => {
  const stages = fixtures([2000, 10]);
  const engine = createEngine(stages), state = engine.createState();
  while (!state.completed.includes(1)) finish(engine, state, engine.startSession(state, 1, NOW));
  const learned = ids(stages[0]);
  learned.forEach((id, i) => { state.words[id].nextDue = NOW + 600_000 + i; });
  const time = NOW + DAY, next = engine.startSession(state, 2, time);
  assert.equal(next.queue.length, 20);
  assert.deepEqual(next.queue, [...learned.slice(-10), ...learned.slice(0, 10)]);
  assert.equal(engine.getStats(state, time).due, 2000);
  while (next.phase === 'review') engine.answer(state, next, true, time);
  assert.equal(next.phase, 'learn');
  assert.equal(engine.getStats(state, time).due, 1980);
  assert.equal(Object.keys(state.words).length, 2000, 'review cannot acquire new words');
  const more = engine.reviewSession(state, time);
  assert.deepEqual(more.queue, learned.slice(10, 30));
  finish(engine, state, more, time);
  assert.equal(engine.getStats(state, time).due, 1960);
  assert.equal(state.xp, 20000);
});

test('each word alternates recall and recognition across fixed-order rounds, including retries', () => {
  const engine = createEngine(fixtures([4])), state = engine.createState();
  finish(engine, state, engine.startSession(state, 1, NOW));
  const seen = Object.fromEntries(Object.keys(state.words).map(id => [id, []]));
  for (let round = 0; round < 3; round++) {
    const time = Math.max(...Object.values(state.words).map(word => word.nextDue));
    const session = engine.reviewSession(state, time);
    while (session.phase === 'review') {
      const id = session.queue[session.index];
      seen[id].push(engine.questionType(state, session));
      engine.answer(state, session, true, time);
    }
  }
  for (const modes of Object.values(seen)) assert.deepEqual(modes, ['recall', 'recognition', 'recall']);
  assert.equal(engine.getStats(state).mastered, 4);
  const time = state.words.s1w1.nextDue, session = engine.reviewSession(state, time);
  const mode = engine.questionType(state, session), id = session.queue[0];
  engine.answer(state, session, false, time);
  while (session.queue[session.index] !== id) engine.answer(state, session, true, time);
  assert.equal(engine.questionType(state, session), mode, 'retry retains the original question type');
});

test('recognition-only and visible-copy answers cannot supply spaced recall mastery', () => {
  const engine = createEngine(fixtures([1])), state = engine.createState();
  finish(engine, state, engine.startSession(state, 1, NOW));
  for (let round = 0; round < 3; round++) {
    const time = state.words.s1w1.nextDue, session = engine.reviewSession(state, time);
    engine.answer(state, session, true, time, { type: 'recognition' });
  }
  assert.equal(state.words.s1w1.reviewCount, 3);
  assert.equal(state.words.s1w1.recallCount, 0);
  assert.equal(engine.getStats(state).mastered, 0);
  const time = state.words.s1w1.nextDue, session = engine.reviewSession(state, time);
  engine.answer(state, session, true, time, { type: 'copy' });
  assert.equal(state.words.s1w1.reviewCount, 3);
  assert.equal(state.words.s1w1.recallCount, 0);
  assert.equal(engine.getStats(state).mastered, 0);
  const retry = engine.reviewSession(state, time);
  engine.answer(state, retry, false, time, { type: 'recall' });
  engine.answer(state, retry, true, time, { type: 'recall' });
  assert.equal(state.words.s1w1.recallCount, 0, 'successful retry is not first-attempt recall');
  finish(engine, state, engine.reviewSession(state, state.words.s1w1.nextDue), state.words.s1w1.nextDue);
  assert.equal(engine.getStats(state).mastered, 0, 'recognition after a failed recall still needs a future recall');
  const recallDue = state.words.s1w1.nextDue;
  finish(engine, state, engine.reviewSession(state, recallDue), recallDue);
  assert.equal(engine.getStats(state).mastered, 1);
});

test('three mistakes in the same round lower mastery once but record all three errors', () => {
  const engine = createEngine(fixtures([1])), state = engine.createState();
  finish(engine, state, engine.startSession(state, 1, NOW));
  for (let round = 0; round < 3; round++) {
    const time = state.words.s1w1.nextDue;
    finish(engine, state, engine.reviewSession(state, time), time);
  }
  const before = structuredClone(state.words.s1w1), time = before.nextDue, session = engine.reviewSession(state, time);
  for (let attempt = 0; attempt < 3; attempt++) engine.answer(state, session, false, time);
  assert.equal(state.words.s1w1.mastery, before.mastery - 1);
  assert.equal(state.words.s1w1.incorrect, before.incorrect + 3);
  engine.answer(state, session, true, time);
  assert.equal(state.words.s1w1.mastery, before.mastery - 1);
  assert.equal(state.words.s1w1.recallCount, before.recallCount);
  assert.equal(state.words.s1w1.reviewCount, before.reviewCount);
});

test('review activity survives interrupted rounds and strict loading, is bounded, and adds no XP', () => {
  const engine = createEngine(fixtures([2])), state = engine.createState();
  finish(engine, state, engine.startSession(state, 1, NOW));
  const time = NOW + DAY, session = engine.reviewSession(state, time);
  engine.answer(state, session, false, time);
  assert.deepEqual(engine.loadState(JSON.stringify(state), { strict: true }), state);
  assert.deepEqual(state.reviewHistory[0], { id: session.reviewSummary.id, startedAt: time, date: time, count: 2, firstAttempts: 1, firstCorrect: 0, retries: 0, completed: false });
  engine.answer(state, session, true, time);
  engine.answer(state, session, false, time);
  engine.answer(state, session, true, time);
  assert.deepEqual(state.reviewHistory[0], { id: session.reviewSummary.id, startedAt: time, date: time, count: 2, firstAttempts: 2, firstCorrect: 1, retries: 2, completed: true });
  for (let round = 0; round < 105; round++) finish(engine, state, engine.reviewSession(state, time), time);
  assert.equal(state.reviewHistory.length, 100);
  assert.equal(state.xp, 20);
  assert.equal(state.history.length, 1);
  assert.deepEqual(engine.loadState(JSON.stringify(state), { strict: true }), state);
  for (const patch of [{ id: '' }, { count: 21 }, { firstAttempts: 3 }, { firstCorrect: 3 }, { retries: -1 }, { date: 'today' }, { xp: 100 }]) {
    const invalid = structuredClone(state);
    Object.assign(invalid.reviewHistory[0], patch);
    assert.throws(() => engine.loadState(invalid, { strict: true }), TypeError);
  }
});

test('legacy backups retain acquisition credit without inventing recall evidence', () => {
  const engine = createEngine(fixtures([10])), state = engine.createState();
  finish(engine, state, engine.startSession(state, 1, NOW));
  for (let round = 0; round < 3; round++) {
    const time = state.words.s1w1.nextDue;
    finish(engine, state, engine.reviewSession(state, time), time);
  }
  const legacy = structuredClone(state);
  delete legacy.reviewHistory;
  for (const entry of Object.values(legacy.words)) { delete entry.recallCount; delete entry.nextReviewMode; }
  const restored = engine.loadState(legacy, { strict: true });
  assert.deepEqual(Object.keys(restored.words), Object.keys(legacy.words));
  assert.equal(restored.xp, legacy.xp);
  assert.deepEqual(restored.completed, legacy.completed);
  assert.deepEqual(restored.history, legacy.history);
  assert.equal(engine.getStats(restored).mastered, 0);
  assert.equal(restored.words.s1w1.recallCount, 0);
  assert.equal(restored.words.s1w1.reviewCount, 3);
  assert.deepEqual(restored.reviewHistory, []);
  const time = restored.words.s1w1.nextDue;
  finish(engine, restored, engine.reviewSession(restored, time), time);
  assert.equal(engine.getStats(restored).mastered, 10);
  const invalid = structuredClone(restored);
  invalid.words.s1w1.recallCount = 999;
  assert.throws(() => engine.loadState(invalid, { strict: true }), TypeError);
});
