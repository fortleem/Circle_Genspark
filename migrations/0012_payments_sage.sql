-- 0012 — Egyptian payments + Sage AI conversation log + DRE country preference

-- ── Payment intents (server keeps intent record, wallet apps handle auth) ──
CREATE TABLE IF NOT EXISTS pay_intents (
  id            TEXT PRIMARY KEY,                   -- nanoid-style local
  user_id       INTEGER NOT NULL REFERENCES users(id),
  country       TEXT NOT NULL,                      -- ISO-3166-1 alpha-2 from DRE
  method_id     TEXT NOT NULL,                      -- e.g. 'vodafone_cash' | 'instapay'
  amount        REAL NOT NULL,
  currency      TEXT NOT NULL,
  recipient_handle TEXT,                            -- @recipient or phone for non-Cirkle
  recipient_user_id INTEGER REFERENCES users(id),
  note          TEXT,
  deeplink      TEXT,                               -- generated deeplink (e.g. vfcash://pay?...)
  status        TEXT NOT NULL DEFAULT 'pending',    -- pending | initiated | confirmed | failed | cancelled
  external_ref  TEXT,                               -- provider txn id when confirmed
  metadata      TEXT,                               -- JSON blob
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmed_at  DATETIME
);
CREATE INDEX IF NOT EXISTS idx_pay_intents_user ON pay_intents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pay_intents_status ON pay_intents(status);

-- ── User country preference (overrides cf-ipcountry header) ──
CREATE TABLE IF NOT EXISTS user_region_pref (
  user_id   INTEGER PRIMARY KEY REFERENCES users(id),
  country   TEXT NOT NULL,
  set_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Sage AI conversation log (per-user, ephemeral by default) ──
CREATE TABLE IF NOT EXISTS sage_conversations (
  id           TEXT PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  pillar       TEXT,                                -- 'wasl' | 'mashahd' | 'lamahat' | 'midan' | 'madrasa' | 'rihla' | 'pay' | 'home'
  title        TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sage_messages (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL REFERENCES sage_conversations(id),
  role            TEXT NOT NULL,                    -- 'user' | 'assistant' | 'system'
  content         TEXT NOT NULL,
  model           TEXT,                             -- 'groq:llama-3.3-70b' etc.
  tokens          INTEGER DEFAULT 0,
  latency_ms      INTEGER,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sage_msgs_conv ON sage_messages(conversation_id, created_at);

-- ── Demo seed: a couple of pay intents to show in Activity ──
INSERT OR IGNORE INTO wallets (user_id, currency, balance) VALUES
  (11, 'EGP', 1450.00),
  (12, 'EGP', 8230.50),
  (18, 'EGP', 42000.00),
  (20, 'EGP',  680.25);

INSERT OR IGNORE INTO pay_intents (id, user_id, country, method_id, amount, currency, recipient_handle, note, status, created_at, confirmed_at) VALUES
  ('pi_demo_001', 1, 'EG', 'instapay',      250.00,  'EGP', '@layla.mansour', 'Lunch split',                    'confirmed', datetime('now','-1 days'),  datetime('now','-1 days')),
  ('pi_demo_002', 1, 'EG', 'vodafone_cash', 75.00,   'EGP', '@omar',          'Coffee',                         'confirmed', datetime('now','-2 days'),  datetime('now','-2 days')),
  ('pi_demo_003', 1, 'EG', 'orange_money',  500.00,  'EGP', '@fatima_zahra',  'Books for Yara',                 'confirmed', datetime('now','-3 days'),  datetime('now','-3 days')),
  ('pi_demo_004', 1, 'EG', 'fawry',         1200.00, 'EGP', NULL,             'Electricity bill (Fawry voucher)','confirmed',datetime('now','-5 days'),  datetime('now','-5 days')),
  ('pi_demo_005', 1, 'EG', 'meeza',         3000.00, 'EGP', '@kareem_dad',    'Tuition deposit · Madrasa',      'pending',   datetime('now','-1 hours'), NULL);
