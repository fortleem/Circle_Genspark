-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Migration 0008 — Wave 2 of Cirkle-unique futuristic features    ║
-- ║                                                                  ║
-- ║   F10 family_vault      — M-of-N inheritance vault (§27)         ║
-- ║   F12 tickets           — Decentralized event passes (§26)       ║
-- ║   F15 privacy_sim_runs  — "What Can X See?" simulation (§28)     ║
-- ║   F16 ai_consents       — granular per-pillar AI consent (§18)   ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ── F10  FAMILY VAULT — Shamir-style M-of-N inheritance recovery ──
CREATE TABLE IF NOT EXISTS family_vaults (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  threshold_m INTEGER NOT NULL,    -- shares needed to unlock (e.g. 3)
  total_n INTEGER NOT NULL,        -- total shares issued (e.g. 5)
  vault_hash TEXT NOT NULL,        -- SHA-256 of full encrypted vault payload
  payload TEXT,                    -- encrypted blob (client-side AES-256-GCM)
  status TEXT DEFAULT 'active',    -- 'active' | 'recovering' | 'recovered' | 'archived'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unlocked_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_vaults_owner ON family_vaults(owner_id, status);

CREATE TABLE IF NOT EXISTS family_vault_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vault_id INTEGER NOT NULL,
  holder_id INTEGER NOT NULL,
  share_hash TEXT NOT NULL,        -- SHA-256 fingerprint of the Shamir share
  consented INTEGER DEFAULT 0,     -- holder accepted custodianship
  used_in_recovery INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vault_shares ON family_vault_shares(vault_id, holder_id);

-- ── F12  DECENTRALIZED TICKETS — Event passes anchored to vault ──
CREATE TABLE IF NOT EXISTS event_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER,                -- references city_events.id (optional)
  event_title TEXT NOT NULL,
  event_city TEXT,
  event_at DATETIME,
  issuer_id INTEGER NOT NULL,
  holder_id INTEGER NOT NULL,
  tier TEXT DEFAULT 'general',     -- 'general' | 'vip' | 'press' | 'free'
  qr_payload TEXT NOT NULL,        -- signed pass payload (Ed25519 in prod)
  anchor_hash TEXT NOT NULL,       -- SHA-256 of (event_id|holder|tier|nonce)
  state TEXT DEFAULT 'issued',     -- 'issued' | 'validated' | 'used' | 'revoked' | 'transferred'
  transferred_from INTEGER,
  validated_at DATETIME,
  used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tickets_holder ON event_tickets(holder_id, state, event_at);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON event_tickets(event_id);

-- ── F15  PRIVACY SIM — "What Can X See?" run log (§28) ──
CREATE TABLE IF NOT EXISTS privacy_sim_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  viewer_kind TEXT NOT NULL,       -- 'stranger' | 'friend' | 'employer' | 'state' | 'advertiser'
  visible_score INTEGER NOT NULL,  -- 0–100; lower=more private
  visible_fields TEXT,             -- JSON array of fields visible to viewer
  recommendations TEXT,            -- JSON array of privacy improvements
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_privacy_user ON privacy_sim_runs(user_id, created_at DESC);

-- ── F16  GRANULAR AI CONSENTS (§18 self-learning core) ──
CREATE TABLE IF NOT EXISTS ai_consents (
  user_id INTEGER NOT NULL,
  pillar TEXT NOT NULL,            -- 'wasl' | 'midan' | 'mashahd' | 'all'
  on_device INTEGER DEFAULT 1,     -- 1 if local-only training allowed
  federated INTEGER DEFAULT 0,     -- 1 if differential-privacy contributions allowed
  cloud INTEGER DEFAULT 0,         -- 1 if any cloud inference allowed
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, pillar)
);

-- ─────────────── Seed ───────────────
INSERT INTO family_vaults (owner_id, name, description, threshold_m, total_n, vault_hash, status) VALUES
  (1, 'Family heirlooms', 'Recovery keys for Cirkle ID + Pay wallet · M=3 of N=5', 3, 5, 'sha256:demo-vault-001', 'active'),
  (1, 'Travel docs vault',  'Passport, visas, insurance · M=2 of N=3',             2, 3, 'sha256:demo-vault-002', 'active');

INSERT INTO family_vault_shares (vault_id, holder_id, share_hash, consented) VALUES
  (1, 2, 'sha256:share-001-a', 1),
  (1, 3, 'sha256:share-001-b', 1),
  (1, 4, 'sha256:share-001-c', 1),
  (1, 5, 'sha256:share-001-d', 0),
  (1, 6, 'sha256:share-001-e', 1),
  (2, 2, 'sha256:share-002-a', 1),
  (2, 3, 'sha256:share-002-b', 1),
  (2, 7, 'sha256:share-002-c', 1);

-- A few sample tickets
INSERT INTO event_tickets (event_title, event_city, event_at, issuer_id, holder_id, tier, qr_payload, anchor_hash, state) VALUES
  ('Cairo Jazz Festival',     'Cairo',  datetime('now','+10 days'), 2, 1, 'general', 'CIRCLE-PASS-CJF-001', 'sha256:tkt-001', 'issued'),
  ('Beirut Tech Summit',      'Beirut', datetime('now','+25 days'), 3, 1, 'vip',     'CIRCLE-PASS-BTS-001', 'sha256:tkt-002', 'issued'),
  ('Tunis Mediterranean Cup', 'Tunis',  datetime('now','-3 days'),  4, 1, 'general', 'CIRCLE-PASS-TMC-001', 'sha256:tkt-003', 'used');

-- Sample privacy sim runs
INSERT INTO privacy_sim_runs (user_id, viewer_kind, visible_score, visible_fields, recommendations) VALUES
  (1, 'stranger',   18, '["@handle","display_name","city"]',                           '["Hide city from public profile","Enable Ghost mode in Wasl"]'),
  (1, 'friend',     62, '["@handle","display_name","city","posts","photos","stories"]','["Restrict Lamahat stories to inner cirkle"]'),
  (1, 'employer',   34, '["@handle","display_name","pro_profile","public_posts"]',     '["Separate professional persona via Dual Identity"]'),
  (1, 'advertiser',  4, '["city_level_geohash5"]',                                     '["Already opted out of ad targeting · zero tracking"]'),
  (1, 'state',      28, '["@handle","display_name","city","public_posts","kyc_hash"]', '["DRE compliance is read-only · no further mitigation needed"]');

-- Default AI consents — on-device only for everything, nothing federated/cloud
INSERT OR IGNORE INTO ai_consents (user_id, pillar, on_device, federated, cloud) VALUES
  (1, 'all',     1, 0, 0),
  (1, 'wasl',    1, 0, 0),
  (1, 'midan',   1, 0, 0),
  (1, 'mashahd', 1, 0, 0);
