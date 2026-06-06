-- 0006 — Circle universal notifications + mail outbox
-- Adds the missing pieces for end-to-end UI wiring:
--   • notifications: cross-pillar inbox (Wasl, Mashahd tips, Midan reactions, Pay receipts, Mesh SOS, Verify, Gov)
--   • mail_outbox:   real Mail compose+send (Mail was read-only before)
--   • shares:        cross-pillar "Share-To" handoff (any pillar → Wasl/Midan/Mail)

-- ─────────────────────────── Notifications ───────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,             -- 'wasl' | 'mashahd' | 'midan' | 'pay' | 'mesh' | 'verify' | 'gov' | 'system'
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,                      -- in-app route like '/wasl' or '/mashahd' (optional deep-link)
  unread INTEGER NOT NULL DEFAULT 1,
  priority INTEGER NOT NULL DEFAULT 0,   -- 0=normal, 50=high, 90=emergency
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, unread);

-- ─────────────────────────── Mail outbox ───────────────────────────
CREATE TABLE IF NOT EXISTS mail_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user INTEGER NOT NULL,
  to_addr TEXT NOT NULL,           -- 'alice@circle.network' or external 'name@example.com'
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_encrypted INTEGER DEFAULT 1,
  is_anonymous INTEGER DEFAULT 0,  -- circle's anonymous re-mailer
  state TEXT DEFAULT 'queued',     -- queued | sent | failed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_mail_outbox_user ON mail_outbox(from_user, created_at DESC);

-- ─────────────────────────── Cross-pillar shares ───────────────────────────
CREATE TABLE IF NOT EXISTS shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user INTEGER NOT NULL,
  source_pillar TEXT NOT NULL,    -- 'mashahd' | 'lamahat' | 'midan' | ...
  source_id TEXT NOT NULL,        -- video_id / photo_id / post_id
  to_pillar TEXT NOT NULL,        -- 'wasl' | 'midan' | 'mail' | 'external'
  to_target TEXT,                 -- room_id or 'public' or to_addr
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_shares_user ON shares(from_user, created_at DESC);

-- ─────────────────────────── Seed (so the UI has visible data) ───────────────────────────
INSERT INTO notifications (user_id, kind, title, body, link, unread, priority) VALUES
  (1, 'wasl',    'New encrypted message',           'Sara: Are we still meeting at 7?',          '/wasl',     1, 0),
  (1, 'mashahd', 'You received a tip',              'Mohamed Hassan tipped you 25 EGP via Paymob','/mashahd',  1, 0),
  (1, 'midan',   'Your post is trending',           '#JeddahEats velocity rank #2 in Cairo',      '/midan',    1, 0),
  (1, 'pay',     'Wallet topped up',                '+ 100 EGP via Paymob webhook',              '/pay',      1, 0),
  (1, 'mesh',    'Offline mesh — 14 peers nearby',  'Bluetooth + Wi-Fi-Direct mesh active',      '/mesh',     1, 0),
  (1, 'verify',  'Device verified',                 'New iPhone 15 added to your verified set',  '/verify',   0, 0),
  (1, 'gov',     'Vote closes in 12h',              'Proposal: Add Pashto to UI languages',      '/governance',1, 50),
  (1, 'system',  'Welcome to Circle',               'Apache-2.0 · 100% free · zero ads',         '/',         0, 0);

-- A pre-existing mail draft so the Mail screen shows something even before user composes
INSERT INTO mail_outbox (from_user, to_addr, subject, body, is_encrypted, is_anonymous, state) VALUES
  (1, 'ahmed@circle.network', 'Coffee tomorrow?', 'Hey Ahmed, want to grab coffee at the new place near Tahrir?', 1, 0, 'sent'),
  (1, 'support@circle.network','Feature request', 'Could we get a dark-mode toggle in Maktab?', 1, 0, 'sent');
