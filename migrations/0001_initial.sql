CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY CHECK (length(token_hash) = 64),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires INTEGER NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires);
CREATE INDEX sessions_user ON sessions(user_id);

-- gzip keeps the complete 7,000-word snapshot below D1's 2 MB row limit.
CREATE TABLE progress (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  snapshot BLOB NOT NULL CHECK (length(snapshot) <= 1800000),
  learned_count INTEGER NOT NULL CHECK (learned_count >= 0 AND learned_count <= 7000),
  revision INTEGER NOT NULL CHECK (revision > 0),
  updated_at INTEGER NOT NULL
);
