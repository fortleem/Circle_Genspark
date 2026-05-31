-- §7 Mashahd / §8 Lamahat / §9 Midan — close all blueprint gaps

-- §7.1 Video formats (long/short/live/watch-party)
ALTER TABLE videos ADD COLUMN format TEXT DEFAULT 'long';  -- long | short | live | watchparty
ALTER TABLE videos ADD COLUMN is_live INTEGER DEFAULT 0;
ALTER TABLE videos ADD COLUMN live_viewer_count INTEGER DEFAULT 0;

-- §7.1 Bullet comments (Bilibili-style danmaku) + standard comments
CREATE TABLE IF NOT EXISTS video_comments (
  id           TEXT PRIMARY KEY,
  video_id     TEXT NOT NULL,
  user_id      INTEGER NOT NULL,
  body         TEXT NOT NULL,
  is_bullet    INTEGER DEFAULT 0,         -- 1 = floating danmaku
  time_offset  INTEGER,                    -- seconds into video (for bullet)
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vidcomm_video ON video_comments(video_id);

-- §7.3.1 / §7.3.5 Sponsored hashtags / city-level ads
CREATE TABLE IF NOT EXISTS sponsored_hashtags (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  hashtag      TEXT NOT NULL,
  city         TEXT,
  advertiser   TEXT,
  starts_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  ends_at      DATETIME,
  budget       INTEGER DEFAULT 0
);

-- §7.4 Tip transactions (non-custodial — Circle only logs intent + referral)
CREATE TABLE IF NOT EXISTS tip_transactions (
  id             TEXT PRIMARY KEY,
  from_user      INTEGER NOT NULL,
  to_user        INTEGER NOT NULL,
  video_id       TEXT,
  amount         INTEGER NOT NULL,        -- in viewer-currency minor units
  currency       TEXT NOT NULL,
  widget         TEXT NOT NULL,           -- moonpay | ramp | transak | paymob | wechange
  status         TEXT DEFAULT 'pending',  -- pending | confirmed | failed
  webhook_ref    TEXT,                    -- widget transaction ID
  circle_fee_bp  INTEGER DEFAULT 150,     -- basis points (1.5%)
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmed_at   DATETIME
);
CREATE INDEX IF NOT EXISTS idx_tip_creator ON tip_transactions(to_user);

-- §7.3.9 Channel memberships
CREATE TABLE IF NOT EXISTS channel_memberships (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id   TEXT NOT NULL,             -- creator user_id or room_id
  member_id    INTEGER NOT NULL,
  tier         TEXT DEFAULT 'standard',   -- standard | gold | platinum
  monthly_amt  INTEGER NOT NULL,
  processor    TEXT NOT NULL,             -- stripe | paymob | crypto
  status       TEXT DEFAULT 'active',     -- active | cancelled | past_due
  started_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  ends_at      DATETIME
);

-- §7 + §13 Creator analytics aggregates
CREATE TABLE IF NOT EXISTS creator_analytics (
  user_id           INTEGER PRIMARY KEY,
  total_views       INTEGER DEFAULT 0,
  total_likes       INTEGER DEFAULT 0,
  total_subscribers INTEGER DEFAULT 0,
  total_tips_minor  INTEGER DEFAULT 0,      -- aggregated
  avg_watch_secs    INTEGER DEFAULT 0,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- §8.1 Lamahat: anonymous posting + stories TTL + CLIP visual search
ALTER TABLE photos ADD COLUMN is_anonymous INTEGER DEFAULT 0;
ALTER TABLE photos ADD COLUMN is_story INTEGER DEFAULT 0;
ALTER TABLE photos ADD COLUMN expires_at DATETIME;
ALTER TABLE photos ADD COLUMN clip_embedding TEXT;  -- base64 CLIP vec (truncated for D1)

-- §8 Photo comments (separate from video comments)
CREATE TABLE IF NOT EXISTS photo_comments (
  id          TEXT PRIMARY KEY,
  photo_id    TEXT NOT NULL,
  user_id     INTEGER NOT NULL,
  body        TEXT NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- §9 Midan: posts already have anonymous column; add federation marker
ALTER TABLE posts ADD COLUMN federated_at DATETIME;
ALTER TABLE posts ADD COLUMN ap_actor TEXT;  -- ActivityPub actor URI if federated

-- Generic follows table (creators / channels / users) — needed by §13 + §14
CREATE TABLE IF NOT EXISTS follows (
  follower_id   INTEGER NOT NULL,
  followed_id   INTEGER NOT NULL,
  followed_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followed_id)
);

-- Seed sponsored hashtags (1 per major city)
INSERT INTO sponsored_hashtags (hashtag, city, advertiser, budget) VALUES
  ('BestCoffeeAlex', 'Alexandria', 'Stella Coffee Co.', 700),
  ('NewMallCairo', 'Cairo', 'Mall of Egypt', 1200),
  ('JeddahEats', 'Jeddah', 'Albaik Express', 900);

-- Seed live + short videos for demo
UPDATE videos SET format = 'short', is_live = 0 WHERE duration_sec <= 60;
UPDATE videos SET format = 'live', is_live = 1, live_viewer_count = 234 WHERE id = (SELECT id FROM videos ORDER BY published_at DESC LIMIT 1);

-- Seed a couple of bullet comments for demo
INSERT OR IGNORE INTO video_comments (id, video_id, user_id, body, is_bullet, time_offset)
SELECT
  'bc' || ROWID,
  id,
  ((ROWID - 1) % 3) + 1,
  CASE (ROWID % 4) WHEN 0 THEN 'حلو جدا 🔥' WHEN 1 THEN 'amazing!' WHEN 2 THEN 'first!' ELSE 'لا تنسوا الإعجاب' END,
  1,
  (ROWID * 7) % 60
FROM videos LIMIT 8;

-- Seed creator analytics
INSERT OR IGNORE INTO creator_analytics (user_id, total_views, total_likes, avg_watch_secs)
SELECT u.id,
  COALESCE((SELECT SUM(views) FROM videos WHERE uploader_id = u.id), 0),
  COALESCE((SELECT SUM(likes) FROM videos WHERE uploader_id = u.id), 0),
  42
FROM users u;
