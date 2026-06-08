-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  0009 Community Jury Appeals — real DB ops for moderation override
-- ║                                                                  ║
-- ║   Adds jury_votes (per-juror choice on a moderation action's     ║
-- ║   appeal) and jury_panels (rotating roster).                     ║
-- ║                                                                  ║
-- ║   Lets §16 AI Safety / Community Jury escape "UI only" — every   ║
-- ║   vote is now persistent and tallied.                            ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Per-juror vote on a moderation action
CREATE TABLE IF NOT EXISTS jury_votes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  action_id       INTEGER NOT NULL,         -- references moderation_actions.id
  juror_id        INTEGER NOT NULL,         -- references users.id
  vote            TEXT NOT NULL,            -- 'overturn' | 'uphold' | 'abstain'
  rationale       TEXT,
  reputation_at_vote INTEGER DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(action_id, juror_id)
);
CREATE INDEX IF NOT EXISTS idx_jury_action ON jury_votes(action_id);
CREATE INDEX IF NOT EXISTS idx_jury_juror ON jury_votes(juror_id);

-- Rotating jury roster — who is currently empanelled
CREATE TABLE IF NOT EXISTS jury_panels (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  juror_id        INTEGER NOT NULL,
  empanelled_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  retired_at      DATETIME,
  cases_heard     INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active'     -- 'active' | 'retired' | 'recused'
);
CREATE INDEX IF NOT EXISTS idx_jury_panel_juror ON jury_panels(juror_id);

-- Seed: empanel a few of our existing users
INSERT OR IGNORE INTO jury_panels (juror_id, cases_heard, status)
VALUES (2, 4, 'active'), (3, 7, 'active'), (4, 2, 'active'), (6, 11, 'active'), (9, 0, 'active');

-- Seed: one open appeal with two initial votes
UPDATE moderation_actions SET appealed = 1, appeal_status = 'pending' WHERE id = 1;
INSERT OR IGNORE INTO jury_votes (action_id, juror_id, vote, rationale, reputation_at_vote)
VALUES
  (1, 2, 'overturn', 'Image is artistic, not gratuitous — model false-positive.', 145),
  (1, 3, 'uphold',   'Borderline; default to original action until clearer guidelines.', 88);
