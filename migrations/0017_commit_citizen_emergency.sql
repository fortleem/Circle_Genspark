-- 0017 — Wasl Commit Service + Citizen Emergency Witness
-- ────────────────────────────────────────────────────────────────────────
-- Part A: COMMIT SERVICE (Wasl)
-- Two parties agree on a price / trade / agreement inside a chat.
-- Either presses "Commit" → creates a pending agreement → other party
-- confirms → agreement is sealed (immutable, hash-chained), can be added
-- to calendar (ICS) or forwarded to email.
-- ────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wasl_commits (
  id TEXT PRIMARY KEY,                      -- cmt_<ts>_<rand>
  room_id TEXT NOT NULL,
  proposer_id INTEGER NOT NULL,             -- who pressed Commit
  counterparty_id INTEGER,                  -- who must confirm (NULL = anyone in room)
  kind TEXT NOT NULL DEFAULT 'agreement',   -- price | trade | agreement | service | rental
  title TEXT NOT NULL,                      -- "Sell iPhone 13 128GB"
  terms TEXT NOT NULL,                      -- full agreement text
  amount REAL,                              -- optional price
  currency TEXT DEFAULT 'EGP',
  due_at DATETIME,                          -- optional deadline / delivery date
  status TEXT NOT NULL DEFAULT 'proposed',  -- proposed | committed | declined | cancelled | fulfilled
  source_message_id TEXT,                   -- message that triggered the commit
  seal_hash TEXT,                           -- SHA-256 of (title|terms|amount|parties|committed_at) — immutable proof
  proposed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  committed_at DATETIME,
  fulfilled_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_wasl_commits_room ON wasl_commits(room_id, status);
CREATE INDEX IF NOT EXISTS idx_wasl_commits_user ON wasl_commits(proposer_id);

-- Immutable audit trail of every state change (append-only)
CREATE TABLE IF NOT EXISTS wasl_commit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  commit_id TEXT NOT NULL,
  actor_id INTEGER NOT NULL,
  action TEXT NOT NULL,                     -- proposed | confirmed | declined | cancelled | fulfilled | forwarded_email | added_calendar
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_commit_events ON wasl_commit_events(commit_id);

-- ────────────────────────────────────────────────────────────────────────
-- Part B: CITIZEN EMERGENCY WITNESS
-- One-press emergency: fire / medical / crime / rights-violation.
-- • Starts tamper-evident live recording (video or audio) — hash-chained
--   segments, cannot be edited after capture.
-- • Notifies people nearby (same city) to confirm the incident.
-- • Rights-violation recordings route to the government oversight channel
--   and can optionally be shared to Midan.
-- • Medical emergencies can target a special circle (e.g. family).
-- ────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emergency_incidents (
  id TEXT PRIMARY KEY,                      -- emg_<ts>_<rand>
  reporter_id INTEGER NOT NULL,
  kind TEXT NOT NULL,                       -- fire | medical | crime | rights_violation
  mode TEXT NOT NULL DEFAULT 'video',       -- video | audio
  scope TEXT NOT NULL DEFAULT 'public',     -- public (area alert) | circle (family/private circle) | gov (oversight channel)
  circle_id INTEGER,                        -- target circle when scope='circle' (e.g. family)
  lat REAL, lng REAL, city TEXT,
  status TEXT NOT NULL DEFAULT 'live',      -- live | ended | confirmed | resolved | false_alarm
  gov_channel_routed INTEGER DEFAULT 0,     -- 1 = delivered to government oversight channel
  shared_midan_post_id INTEGER,             -- set when shared to Midan
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_emergency_city ON emergency_incidents(city, status);
CREATE INDEX IF NOT EXISTS idx_emergency_reporter ON emergency_incidents(reporter_id);

-- Tamper-evident recording segments: each segment's hash includes the
-- previous segment's hash (hash chain) → any edit breaks the chain.
CREATE TABLE IF NOT EXISTS emergency_segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id TEXT NOT NULL,
  seq INTEGER NOT NULL,                     -- 0,1,2… capture order
  media_cid TEXT NOT NULL,                  -- IPFS CID of the raw segment
  duration_ms INTEGER NOT NULL DEFAULT 4000,
  prev_hash TEXT NOT NULL DEFAULT 'GENESIS',
  seg_hash TEXT NOT NULL,                   -- SHA-256(prev_hash + media_cid + seq + captured_at)
  captured_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_emergency_seg ON emergency_segments(incident_id, seq);

-- Nearby-citizen confirmations ("I can see/hear it too")
CREATE TABLE IF NOT EXISTS emergency_confirmations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  verdict TEXT NOT NULL DEFAULT 'confirm',  -- confirm | cannot_see | dispute
  distance_m INTEGER,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(incident_id, user_id)
);

-- Cirkle membership (was missing from 0001 — cirkles only had member_count).
-- Needed for circle-scoped emergency notifications (family emergency).
CREATE TABLE IF NOT EXISTS cirkle_members (
  cirkle_id INTEGER NOT NULL,               -- FK cirkles.id
  user_id   INTEGER NOT NULL,               -- FK users.id
  role      TEXT DEFAULT 'member',          -- owner | admin | member
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cirkle_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_cirkle_members_user ON cirkle_members(user_id);

-- Seed membership for cirkle 1 (demo family circle)
INSERT OR IGNORE INTO cirkle_members (cirkle_id, user_id, role) VALUES
  (1, 1, 'owner'), (1, 2, 'member'), (1, 3, 'member');

-- Special emergency circles (e.g. Family Emergency) — reuse cirkles,
-- this table marks which of a user's circles are emergency-enabled.
CREATE TABLE IF NOT EXISTS emergency_circles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  circle_id INTEGER NOT NULL,               -- FK cirkles.id
  label TEXT NOT NULL DEFAULT 'Family Emergency',
  auto_notify INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, circle_id)
);

-- Seed: mark cirkle 1 as user 1's family emergency circle (demo)
INSERT OR IGNORE INTO emergency_circles (user_id, circle_id, label) VALUES (1, 1, 'Family Emergency — العائلة');
