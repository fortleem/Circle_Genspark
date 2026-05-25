-- Wasl module — full feature support tables.

-- Per-user Wasl privacy settings (Ghost mode, screenshot block, forwarding consent, disappearing TTL, etc.)
CREATE TABLE IF NOT EXISTS wasl_privacy (
  user_id              INTEGER PRIMARY KEY,
  ghost_mode           INTEGER DEFAULT 0,   -- 0=off, 1=on (hide last-seen/read/typing)
  screenshot_block     INTEGER DEFAULT 1,   -- 1=on by default
  forwarding_consent   INTEGER DEFAULT 1,   -- recipient must approve forwards
  disappearing_default INTEGER DEFAULT 0,   -- TTL in seconds for new rooms (0 = none, 86400 = 1d, 604800 = 7d, 2592000 = 30d)
  read_receipts        INTEGER DEFAULT 1,
  last_seen_visible    INTEGER DEFAULT 1,
  typing_indicator     INTEGER DEFAULT 1,
  auto_download_media  INTEGER DEFAULT 1,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wasl per-room overrides (only differing from user defaults are stored)
CREATE TABLE IF NOT EXISTS wasl_room_overrides (
  room_id            TEXT NOT NULL,
  user_id            INTEGER NOT NULL,
  disappearing_ttl   INTEGER,             -- override TTL for this room
  notifications      TEXT DEFAULT 'all',  -- all | mentions | none
  pinned             INTEGER DEFAULT 0,
  muted_until        DATETIME,
  PRIMARY KEY (room_id, user_id)
);

-- Broadcast channel meta (for channels created via Wasl §6.7 / §6.10)
CREATE TABLE IF NOT EXISTS wasl_broadcasts (
  room_id           TEXT PRIMARY KEY,
  owner_id          INTEGER NOT NULL,
  subscriber_count  INTEGER DEFAULT 0,
  reach_estimate    INTEGER DEFAULT 0,
  reactions_total   INTEGER DEFAULT 0,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wasl call signaling (WebRTC offer/answer/ICE) — Matrix m.call.* event log
CREATE TABLE IF NOT EXISTS wasl_calls (
  id            TEXT PRIMARY KEY,
  room_id       TEXT NOT NULL,
  caller_id     INTEGER NOT NULL,
  callee_id     INTEGER,
  call_type     TEXT NOT NULL,         -- 'voice' | 'video'
  status        TEXT DEFAULT 'ringing', -- ringing | active | ended | missed | rejected
  is_p2p        INTEGER DEFAULT 1,     -- 1 if direct P2P, 0 if SFU
  started_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at      DATETIME,
  duration_sec  INTEGER
);

-- Wasl message queue (offline + mesh pending)
CREATE TABLE IF NOT EXISTS wasl_outbox (
  id          TEXT PRIMARY KEY,
  room_id     TEXT NOT NULL,
  sender_id   INTEGER NOT NULL,
  body        TEXT NOT NULL,
  status      TEXT DEFAULT 'queued',   -- queued | sent_via_mesh | sent | failed
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wasl Maktab admin audit log (workspace events)
CREATE TABLE IF NOT EXISTS wasl_maktab_audit (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id TEXT NOT NULL,         -- room_id of workspace root
  actor_id     INTEGER NOT NULL,
  action       TEXT NOT NULL,         -- 'invite' | 'set_visibility' | 'set_retention' | 'export' | 'remove'
  target       TEXT,                  -- email, room name, etc.
  details      TEXT,                  -- JSON
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wasl device verification (Olm SAS / QR cross-sign)
CREATE TABLE IF NOT EXISTS wasl_device_verifications (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  device_id    TEXT NOT NULL,
  verified_by  INTEGER NOT NULL,      -- another user_id who verified them
  method       TEXT NOT NULL,         -- 'qr' | 'sas' | 'manual'
  fingerprint  TEXT,                  -- ed25519 fingerprint
  verified_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default privacy row for each existing user (seed)
INSERT OR IGNORE INTO wasl_privacy (user_id) SELECT id FROM users;
