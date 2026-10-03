import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createSqliteStore } from '../sqlite-store.js';
import { STORE_SCHEMA } from '../store-schema.js';

function fixture() {
  const native = new DatabaseSync(':memory:');
  native.exec(STORE_SCHEMA);
  const storage = {
    sql: { exec(query, ...values) {
      const stmt = native.prepare(query);
      const rows = stmt.all(...values);
      return { toArray: () => rows, rowsWritten: native.prepare('SELECT changes() AS n').get().n };
    } },
    transactionSync(fn) {
      native.exec('BEGIN');
      try { const value = fn(); native.exec('COMMIT'); return value; }
      catch (error) { native.exec('ROLLBACK'); throw error; }
    },
  };
  return { db: createSqliteStore(storage), native };
}

test('SQLite adapter consumes rows and atomically rolls back failed login batches', async () => {
  const { db, native } = fixture();
  try {
    await assert.rejects(db.batch([
      db.prepare('INSERT INTO users VALUES(?,?,?)').bind('one', 'Traveller', 'one@example.test'),
      db.prepare('INSERT INTO users VALUES(?,?,?)').bind('one', 'Duplicate', 'duplicate@example.test'),
    ]));
    assert.equal(await db.prepare('SELECT * FROM users').first(), null);
    await db.prepare('INSERT INTO users VALUES(?,?,?)').bind('one', 'Traveller', 'one@example.test').run();
    assert.equal((await db.prepare('SELECT * FROM users WHERE id=?').bind('one').first()).name, 'Traveller');
  } finally { native.close(); }
});

test('SQLite adapter preserves binary snapshots and revision compare-and-swap', async () => {
  const { db, native } = fixture();
  try {
    await db.prepare('INSERT INTO users VALUES(?,?,?)').bind('one', 'Traveller', 'one@example.test').run();
    const bytes = new Uint8Array([31,139,8,0,250,255]);
    await db.prepare('INSERT INTO progress VALUES(?,?,?,?,?)').bind('one', bytes, 10, 1, 100).run();
    const update = () => db.prepare('UPDATE progress SET revision=revision+1 WHERE user_id=? AND revision=? RETURNING revision').bind('one', 1).first();
    const result = await Promise.all([update(), update()]);
    assert.equal(result.filter(Boolean).length, 1);
    const saved = await db.prepare('SELECT * FROM progress WHERE user_id=?').bind('one').first();
    assert.deepEqual(saved.snapshot, bytes);
    assert.equal(saved.revision, 2);
  } finally { native.close(); }
});
