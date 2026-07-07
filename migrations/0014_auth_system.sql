-- Auth system: sessions, multi-method auth, identity verification (Haweya/InstaPay)
-- Supports: email, phone (SMS), Telegram, and verified identity

CREATE TABLE IF NOT EXISTS auth_sessions (
  id              TEXT PRIMARY KEY,
  user_id         INTEGER,
  method          TEXT NOT NULL,        -- 'email' | 'phone' | 'telegram' | 'haweya' | 'instapay'
  status          TEXT DEFAULT 'pending', -- 'pending' | 'otp_sent' | 'active' | 'expired'
  otp_hash        TEXT,                 -- hashed OTP for verification
  otp_expires_at  DATETIME,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at      DATETIME,
  last_active     DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_methods (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL,
  method          TEXT NOT NULL,        -- 'email' | 'phone' | 'telegram'
  identifier      TEXT NOT NULL,        -- email, phone number, or telegram handle
  verified        INTEGER DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(method, identifier)
);

CREATE TABLE IF NOT EXISTS identity_verifications (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL,
  provider        TEXT NOT NULL,        -- 'haweya' | 'instapay'
  status          TEXT DEFAULT 'pending', -- 'pending' | 'submitted' | 'verified' | 'rejected'
  national_id_hash TEXT,                -- hashed national ID (never stored raw)
  verification_ref TEXT,                -- provider reference number
  verified_name   TEXT,                 -- name returned by the provider
  verified_at     DATETIME,
  submitted_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at      DATETIME,            -- verification validity period
  metadata        TEXT                  -- JSON: { governorate, dob_year, tier }
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_methods_user ON auth_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_user ON identity_verifications(user_id);

-- Seed auth methods for existing demo users
INSERT OR IGNORE INTO auth_methods (user_id, method, identifier, verified) VALUES
  (1, 'email', 'ahmed@cirkle.eg', 1),
  (1, 'phone', '+20-1001234567', 1),
  (1, 'telegram', '@ahmed_cirkle', 1),
  (2, 'email', 'layla@cirkle.eg', 1),
  (2, 'phone', '+20-1112345678', 1),
  (3, 'email', 'omar@cirkle.eg', 1),
  (3, 'telegram', '@omar_dev', 1),
  (4, 'email', 'fatima@cirkle.eg', 1),
  (5, 'phone', '+20-1223456789', 1),
  (6, 'email', 'mei@cirkle.cn', 1),
  (7, 'email', 'carlos@cirkle.br', 1),
  (8, 'email', 'anna@cirkle.de', 1),
  (9, 'phone', '+91-9876543210', 1),
  (10, 'email', 'sarah@cirkle.uk', 1);

-- Seed identity verifications
INSERT OR IGNORE INTO identity_verifications (user_id, provider, status, national_id_hash, verification_ref, verified_name, verified_at, metadata) VALUES
  (1, 'haweya', 'verified', 'sha256:a1b2c3d4e5f6...', 'HWY-2026-001234', 'Ahmed Saleh Mohamed', '2026-01-15 10:30:00', '{"governorate":"Cairo","dob_year":1992,"tier":"full"}'),
  (1, 'instapay', 'verified', NULL, 'IP-2026-005678', 'Ahmed S. Mohamed', '2026-02-01 14:00:00', '{"bank":"CIB","account_status":"active"}'),
  (2, 'haweya', 'verified', 'sha256:f6e5d4c3b2a1...', 'HWY-2026-001235', 'Layla Mansour Ali', '2026-01-20 09:15:00', '{"governorate":"Alexandria","dob_year":1995,"tier":"full"}'),
  (3, 'haweya', 'submitted', 'sha256:1a2b3c4d5e6f...', 'HWY-2026-001236', NULL, NULL, '{"governorate":"Giza","tier":"pending"}'),
  (4, 'instapay', 'verified', NULL, 'IP-2026-005679', 'Fatima Hassan', '2026-03-01 11:00:00', '{"bank":"Banque Misr","account_status":"active"}');

-- Seed an active session for demo user
INSERT OR IGNORE INTO auth_sessions (id, user_id, method, status, created_at, expires_at, last_active) VALUES
  ('sess_demo_ahmed_001', 1, 'email', 'active', '2026-06-15 08:00:00', '2026-07-15 08:00:00', '2026-06-16 10:30:00');
