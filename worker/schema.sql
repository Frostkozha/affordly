CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  restore_code TEXT UNIQUE,
  created_at TEXT,
  updated_at TEXT,
  state TEXT
);
