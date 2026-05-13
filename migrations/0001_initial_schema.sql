-- Circle (دواير) Production Schema v1
-- Privacy-first AI-native super app. All persistent state for the web companion.

-- ============================================================================
-- USERS & IDENTITY (Circle ID + Circle Verify)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  handle        TEXT UNIQUE NOT NULL,                -- @ahmed
  matrix_id     TEXT UNIQUE NOT NULL,                -- @ahmed:matrix.circle.app
  display_name  TEXT NOT NULL,
  email         TEXT,                                -- ahmed@circle.app (Circle Mail)
  avatar_cid    TEXT,                                -- ipfs://Qm...
  bio           TEXT,
  country       TEXT DEFAULT 'EG',                   -- ISO-3166-1 alpha-2
  city          TEXT,
  language      TEXT DEFAULT 'ar',                   -- preferred UI language
  brand_names   INTEGER DEFAULT 0,                   -- 0=US English (Connect), 1=Brand (Wasl)
  verified      INTEGER DEFAULT 0,                   -- Circle Verify status
  verified_claim TEXT,                               -- "over_18", "nationality_EG", etc.
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_handle  ON users(handle);

-- ============================================================================
-- WASL (Chat) — rooms + messages (E2EE payloads opaque to server)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id           TEXT PRIMARY KEY,                     -- !room:matrix.circle.app
  name         TEXT NOT NULL,
  topic        TEXT,
  room_type    TEXT NOT NULL DEFAULT 'direct',       -- direct | group | broadcast | workspace
  is_encrypted INTEGER DEFAULT 1,
  created_by   INTEGER REFERENCES users(id),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_members (
  room_id   TEXT NOT NULL REFERENCES rooms(id),
  user_id   INTEGER NOT NULL REFERENCES users(id),
  role      TEXT DEFAULT 'member',                   -- owner | admin | member
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id            TEXT PRIMARY KEY,                    -- event id
  room_id       TEXT NOT NULL REFERENCES rooms(id),
  sender_id     INTEGER NOT NULL REFERENCES users(id),
  body          TEXT,                                -- plaintext preview only (E2EE in real client)
  attachment_cid TEXT,
  status        INTEGER DEFAULT 1,                   -- 0=pending,1=sent,2=delivered,3=read
  is_encrypted  INTEGER DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, created_at);

-- ============================================================================
-- MASHAHD (Video) — federated public videos
-- ============================================================================
CREATE TABLE IF NOT EXISTS videos (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  uploader_id    INTEGER NOT NULL REFERENCES users(id),
  title          TEXT NOT NULL,
  description    TEXT,
  cid            TEXT NOT NULL,                      -- ipfs CID
  thumbnail_cid  TEXT,
  duration_sec   INTEGER DEFAULT 0,
  views          INTEGER DEFAULT 0,
  likes          INTEGER DEFAULT 0,
  city           TEXT,
  language       TEXT DEFAULT 'ar',
  nsfw           INTEGER DEFAULT 0,
  published_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_city ON videos(city);

-- ============================================================================
-- LAMAHAT (Photos / Glimpses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS photos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  uploader_id  INTEGER NOT NULL REFERENCES users(id),
  caption      TEXT,
  cid          TEXT NOT NULL,
  city         TEXT,
  likes        INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_photos_published ON photos(published_at DESC);

-- ============================================================================
-- MIDAN (Square) — ActivityPub-style posts
-- ============================================================================
CREATE TABLE IF NOT EXISTS posts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id     INTEGER NOT NULL REFERENCES users(id),
  content       TEXT NOT NULL,
  hashtags      TEXT,                                -- space separated
  city          TEXT,
  language      TEXT DEFAULT 'ar',
  anonymous     INTEGER DEFAULT 0,
  reposts       INTEGER DEFAULT 0,
  likes         INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_city ON posts(city);

CREATE TABLE IF NOT EXISTS post_replies (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id   INTEGER NOT NULL REFERENCES posts(id),
  author_id INTEGER NOT NULL REFERENCES users(id),
  content   TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- THE CIRCLE (Groups), CHANNELS, WORKSPACES
-- ============================================================================
CREATE TABLE IF NOT EXISTS circles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  visibility  TEXT NOT NULL DEFAULT 'public',        -- public | private | secret
  category    TEXT,                                  -- books, food, tech, etc.
  city        TEXT,
  member_count INTEGER DEFAULT 0,
  owner_id    INTEGER REFERENCES users(id),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS channels (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  channel_type TEXT NOT NULL,                        -- official | creator | educational
  category    TEXT,
  verified    INTEGER DEFAULT 0,
  subscriber_count INTEGER DEFAULT 0,
  owner_id    INTEGER REFERENCES users(id),
  avatar_cid  TEXT,
  country     TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS channel_posts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER NOT NULL REFERENCES channels(id),
  title      TEXT,
  body       TEXT NOT NULL,
  media_cid  TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_channel_posts ON channel_posts(channel_id, created_at DESC);

-- ============================================================================
-- PROFESSIONAL NETWORK (Pro / LinkedIn replacement)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pro_profiles (
  user_id      INTEGER PRIMARY KEY REFERENCES users(id),
  headline     TEXT,
  current_role TEXT,
  company      TEXT,
  skills       TEXT,                                 -- json array
  experience   TEXT,                                 -- json array
  open_to_work INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pro_jobs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  company     TEXT NOT NULL,
  city        TEXT,
  country     TEXT,
  remote      INTEGER DEFAULT 0,
  description TEXT,
  apply_url   TEXT,
  posted_by   INTEGER REFERENCES users(id),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CIRCLE TRAVEL (Rihla)
-- ============================================================================
CREATE TABLE IF NOT EXISTS travel_itineraries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id),
  city        TEXT NOT NULL,
  days        INTEGER NOT NULL,
  interests   TEXT,
  plan_json   TEXT NOT NULL,                         -- AI-generated itinerary
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CIRCLE PAYMENTS (Nat) — fee-free federated transfers
-- ============================================================================
CREATE TABLE IF NOT EXISTS wallets (
  user_id  INTEGER PRIMARY KEY REFERENCES users(id),
  currency TEXT NOT NULL DEFAULT 'EGP',
  balance  REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user   INTEGER REFERENCES users(id),
  to_user     INTEGER REFERENCES users(id),
  amount      REAL NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'EGP',
  method      TEXT NOT NULL,                         -- nfc | qr | handle | fawry_voucher | vodafone_cash
  status      TEXT NOT NULL DEFAULT 'completed',     -- pending | completed | failed
  note        TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tx_from ON transactions(from_user, created_at DESC);

-- ============================================================================
-- CIRCLE MAIL (mailboxes mirror)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mail_messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  folder      TEXT NOT NULL DEFAULT 'inbox',         -- inbox | sent | drafts | spam
  from_addr   TEXT NOT NULL,
  to_addr     TEXT NOT NULL,
  subject     TEXT,
  body        TEXT,
  read_flag   INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_mail_user ON mail_messages(user_id, folder, created_at DESC);

-- ============================================================================
-- EVENTS (for Home Dashboard "Happening Nearby")
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  city        TEXT NOT NULL,
  venue       TEXT,
  start_time  DATETIME NOT NULL,
  category    TEXT,                                  -- music | culture | tech | sport | psa | emergency
  priority    INTEGER DEFAULT 0,                     -- emergency=10, psa=8, featured=5
  image_cid   TEXT,
  interested  INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_events_city_time ON events(city, start_time);

-- ============================================================================
-- GOVERNANCE & TRANSPARENCY (DAO votes, ad revenue)
-- ============================================================================
CREATE TABLE IF NOT EXISTS governance_proposals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  proposer_id INTEGER REFERENCES users(id),
  status      TEXT DEFAULT 'open',                   -- open | passed | rejected
  votes_yes   INTEGER DEFAULT 0,
  votes_no    INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ad_revenue_ledger (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  month        TEXT NOT NULL,                        -- 2026-04
  advertiser   TEXT NOT NULL,
  city         TEXT NOT NULL,
  amount_usd   REAL NOT NULL,
  allocation   TEXT NOT NULL                         -- nodes | development | grants
);

-- ============================================================================
-- MINI APPS HUB
-- ============================================================================
CREATE TABLE IF NOT EXISTS mini_apps (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  developer   TEXT,
  category    TEXT,
  description TEXT,
  icon_cid    TEXT,
  install_count INTEGER DEFAULT 0,
  verified    INTEGER DEFAULT 0
);
