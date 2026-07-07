-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  Migration 0007 — Cirkle-unique futuristic features              ║
-- ║                                                                  ║
-- ║  These tables back capabilities NO competitor has:               ║
-- ║   • time_capsules — posts sealed until a future date             ║
-- ║   • whispers      — ephemeral self-destruct messages             ║
-- ║   • presence      — live mesh-status / region / encryption       ║
-- ║   • pulse_events  — per-pillar real-time activity stream         ║
-- ║   • echoes        — AI-summarized conversation playback markers  ║
-- ║   • constellations— orbital connection graph (sourced from rels) ║
-- ║   • reality_lens  — geo-anchored Lamahat photos for AR overlay   ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Time-capsule posts: sealed content released at unseal_at
CREATE TABLE IF NOT EXISTS time_capsules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NOT NULL,
  pillar TEXT NOT NULL,           -- 'midan' | 'wasl' | 'lamahat' | 'mail'
  target_id TEXT,                 -- room/channel/recipient when applicable
  payload TEXT NOT NULL,          -- the sealed content (plaintext for now; client-encrypted in prod)
  anchor_hash TEXT,               -- SHA-256 of payload at seal time (proof-of-time)
  sealed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unseal_at DATETIME NOT NULL,    -- when this becomes visible
  unsealed INTEGER DEFAULT 0,     -- 1 once released
  visibility TEXT DEFAULT 'public', -- 'public' | 'recipients' | 'self'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_capsules_unseal ON time_capsules(unseal_at, unsealed);
CREATE INDEX IF NOT EXISTS idx_capsules_author ON time_capsules(author_id, sealed_at DESC);

-- Whispers: self-destruct messages with countdown
CREATE TABLE IF NOT EXISTS whispers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user INTEGER NOT NULL,
  to_user INTEGER,
  room_id TEXT,
  body TEXT NOT NULL,
  ttl_seconds INTEGER NOT NULL,   -- lifespan after first view
  view_count INTEGER DEFAULT 0,
  max_views INTEGER DEFAULT 1,
  burned INTEGER DEFAULT 0,       -- 1 once destroyed
  burns_screenshot INTEGER DEFAULT 1, -- prevents native screenshot (client-side hint)
  first_viewed_at DATETIME,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_whispers_to ON whispers(to_user, burned);
CREATE INDEX IF NOT EXISTS idx_whispers_expires ON whispers(expires_at, burned);

-- Presence: live mesh-status per user
CREATE TABLE IF NOT EXISTS presence (
  user_id INTEGER PRIMARY KEY,
  state TEXT DEFAULT 'online',    -- 'online' | 'mesh' | 'away' | 'invisible'
  region TEXT,                    -- 'Cairo' | 'Beirut' | etc
  mesh_node TEXT,                 -- 'reticulum:abc' | null
  encrypted_channels INTEGER DEFAULT 0,
  device TEXT,                    -- 'mobile' | 'desktop' | 'mesh-only'
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pulse events: real-time per-pillar activity heat
CREATE TABLE IF NOT EXISTS pulse_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pillar TEXT NOT NULL,           -- 'wasl' | 'midan' | 'mashahd' | 'lamahat' | 'mail' | 'pay' | ...
  kind TEXT NOT NULL,             -- 'message' | 'post' | 'view' | 'mint' | 'join' | ...
  weight INTEGER DEFAULT 1,
  city TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pulse_recent ON pulse_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pulse_pillar ON pulse_events(pillar, created_at DESC);

-- Echoes: AI-summarized playback markers for long conversations
CREATE TABLE IF NOT EXISTS echoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id TEXT NOT NULL,
  span_start INTEGER,             -- message id range
  span_end INTEGER,
  summary TEXT NOT NULL,
  sentiment TEXT,                 -- 'positive' | 'neutral' | 'tense' | 'celebratory'
  key_actors TEXT,                -- JSON array of user_ids
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_echoes_room ON echoes(room_id, created_at DESC);

-- Reality Lens: geo-anchored Lamahat photos for AR/map overlay
CREATE TABLE IF NOT EXISTS reality_lens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id INTEGER,
  user_id INTEGER NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  bearing REAL,                   -- compass bearing in degrees
  altitude REAL,
  city TEXT,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_lens_geo ON reality_lens(lat, lng);
CREATE INDEX IF NOT EXISTS idx_lens_city ON reality_lens(city);

-- ─────────────── Seed visible data ───────────────

-- Presence — diverse mix so the chip shows life
INSERT OR IGNORE INTO presence (user_id, state, region, mesh_node, encrypted_channels, device, last_seen) VALUES
  (1, 'online',  'Cairo',   NULL,             3, 'desktop',   CURRENT_TIMESTAMP),
  (2, 'mesh',    'Beirut',  'reticulum:n4f7', 2, 'mesh-only', CURRENT_TIMESTAMP),
  (3, 'online',  'Tunis',   NULL,             1, 'mobile',    CURRENT_TIMESTAMP),
  (4, 'away',    'Amman',   NULL,             0, 'mobile',    CURRENT_TIMESTAMP),
  (5, 'invisible','Riyadh', NULL,             4, 'desktop',   CURRENT_TIMESTAMP),
  (6, 'mesh',    'Dubai',   'reticulum:m2c1', 1, 'mesh-only', CURRENT_TIMESTAMP),
  (7, 'online',  'Casablanca', NULL,          2, 'desktop',   CURRENT_TIMESTAMP);

-- Pulse — recent activity across pillars
INSERT INTO pulse_events (pillar, kind, weight, city) VALUES
  ('wasl',    'message', 1, 'Cairo'),
  ('wasl',    'message', 1, 'Beirut'),
  ('midan',   'post',    2, 'Cairo'),
  ('mashahd', 'view',    1, 'Tunis'),
  ('mashahd', 'view',    1, 'Cairo'),
  ('lamahat', 'post',    1, 'Amman'),
  ('pay',     'mint',    3, 'Dubai'),
  ('mail',    'send',    1, 'Riyadh'),
  ('wasl',    'message', 1, 'Casablanca'),
  ('midan',   'post',    1, 'Beirut');

-- Time-capsules: one already-unsealed sample, one future
INSERT INTO time_capsules (author_id, pillar, payload, anchor_hash, unseal_at, unsealed, visibility) VALUES
  (1, 'midan',  'A note to my future self: keep building the open network.', 'sha256:demo-anchor-001', datetime('now', '+30 days'), 0, 'self'),
  (2, 'midan',  'Letter to the community circa 2026: the mesh worked.',     'sha256:demo-anchor-002', datetime('now', '-1 day'),    1, 'public');

-- Whispers: one fresh, one already burned
INSERT INTO whispers (from_user, to_user, body, ttl_seconds, max_views, burned, expires_at) VALUES
  (2, 1, 'See you at Tahrir at 7 — bring the printout.', 60, 1, 0, datetime('now', '+10 minutes')),
  (3, 1, '[burned]', 30, 1, 1, datetime('now', '-1 hour'));

-- Echoes: AI summary marker for a Cairo coffee room
INSERT INTO echoes (room_id, span_start, span_end, summary, sentiment, key_actors) VALUES
  ('!group-cairo-coffee:matrix.cirkle.app', 1, 24, 'Group discussed best coffee spots downtown; consensus on El Fishawy. Plans for Friday meet-up at 5pm.', 'positive', '[1,2,3]'),
  ('!group-cairo-coffee:matrix.cirkle.app', 25, 41, 'Debated whether to support a new bean roaster; tense, no resolution.', 'tense', '[1,4]');

-- Reality lens: geo-anchored Lamahat photos in Cairo
INSERT INTO reality_lens (photo_id, user_id, lat, lng, bearing, city, caption) VALUES
  (NULL, 1, 30.0444, 31.2357, 90,  'Cairo', 'Sunset on the Nile'),
  (NULL, 3, 30.0626, 31.2497, 120, 'Cairo', 'Khan el-Khalili lanterns'),
  (NULL, 2, 33.8938, 35.5018, 200, 'Beirut','Sea promenade at dusk'),
  (NULL, 4, 36.8065, 10.1815, 45,  'Tunis', 'Medina rooftops');
