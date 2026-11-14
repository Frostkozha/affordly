CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  restore_code TEXT UNIQUE,
  created_at TEXT,
  updated_at TEXT,
  state TEXT
);
CREATE TABLE IF NOT EXISTS usage (
  account_id TEXT,
  day TEXT,
  count INTEGER,
  PRIMARY KEY(account_id, day)
);
