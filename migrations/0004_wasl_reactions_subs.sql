-- Wasl §6 follow-up: reactions, channel subscriptions, message media (GIFs)

-- Channel subscriptions (broadcast / channel followers)
CREATE TABLE IF NOT EXISTS wasl_subscriptions (
  room_id        TEXT NOT NULL,
  user_id        INTEGER NOT NULL,
  subscribed_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wasl_subs_user ON wasl_subscriptions(user_id);

-- Per-message reactions (emoji ratchet) — works for broadcast (subscribers can react) and groups
CREATE TABLE IF NOT EXISTS wasl_reactions (
  message_id   TEXT NOT NULL,
  user_id      INTEGER NOT NULL,
  emoji        TEXT NOT NULL,
  reacted_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_wasl_reactions_msg ON wasl_reactions(message_id);

-- Auth method preference (per blueprint §6.2 — Email / Telegram / Carrier OTP)
CREATE TABLE IF NOT EXISTS wasl_auth_method (
  user_id        INTEGER PRIMARY KEY,
  method         TEXT NOT NULL DEFAULT 'email',  -- email | telegram | sms
  identifier     TEXT,                            -- email addr, telegram handle, hashed phone
  verified       INTEGER DEFAULT 0,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default email auth for existing users
INSERT OR IGNORE INTO wasl_auth_method (user_id, method, verified)
SELECT id, 'email', 1 FROM users;

-- Seed broadcast subscriptions for existing channels (one user follows a sample channel)
INSERT OR IGNORE INTO wasl_subscriptions (room_id, user_id)
SELECT r.id, u.id
FROM rooms r CROSS JOIN users u
WHERE r.room_type = 'broadcast' AND u.id <= 3;
