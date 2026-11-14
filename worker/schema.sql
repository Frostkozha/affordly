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

CREATE TABLE IF NOT EXISTS creator_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT,
  name TEXT,
  platform TEXT,
  handle TEXT,
  followers TEXT,
  note TEXT,
  ip_hash TEXT
);
CREATE INDEX IF NOT EXISTS creator_applications_ip_hash ON creator_applications(ip_hash);
