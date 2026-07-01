-- Citizen Shield (National Civic Intelligence Services) tables
-- Part 37 of CIRCLE BLUEPRINT v12.0

CREATE TABLE IF NOT EXISTS citizen_reports (
  id              TEXT PRIMARY KEY,                       -- public case ID, e.g. CS-ABCDEFG
  user_id         INTEGER NOT NULL,
  category        TEXT NOT NULL,                        -- police | passport | municipal | health | transport | tax | education | other
  description     TEXT NOT NULL,
  privacy_mode    TEXT DEFAULT 'identified',            -- identified | protected | anonymous
  lat             REAL,
  lng             REAL,
  accuracy        REAL,
  city            TEXT,
  routing         TEXT,                                 -- assigned authority/office
  status          TEXT DEFAULT 'pending',                -- pending | underReview | responded | resolved | appealed | closed
  estimated_minutes INTEGER DEFAULT 60,
  response_minutes  INTEGER,                              -- actual first-response time
  sla_deadline    DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS citizen_evidence (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id       TEXT NOT NULL,
  kind            TEXT NOT NULL,                        -- photo | video | audio | document
  cid             TEXT,                                 -- content-addressed hash (IPFS/SHA-256 placeholder)
  hash_sha256     TEXT,
  uploaded_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES citizen_reports(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS citizen_witnesses (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id       TEXT NOT NULL,
  user_id         INTEGER,
  display_name    TEXT,
  proximity_m     INTEGER DEFAULT 100,                   -- distance from incident
  verified        INTEGER DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES citizen_reports(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS citizen_report_updates (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id       TEXT NOT NULL,
  status          TEXT,
  note            TEXT,
  actor           TEXT DEFAULT 'system',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES citizen_reports(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS citizen_office_index (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT UNIQUE NOT NULL,
  category        TEXT,
  city            TEXT,
  score           INTEGER DEFAULT 50,                   -- public service index 0-100
  response_minutes_avg INTEGER,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_citizen_reports_user ON citizen_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status ON citizen_reports(status);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_city ON citizen_reports(city);
CREATE INDEX IF NOT EXISTS idx_citizen_evidence_report ON citizen_evidence(report_id);
CREATE INDEX IF NOT EXISTS idx_citizen_witnesses_report ON citizen_witnesses(report_id);
CREATE INDEX IF NOT EXISTS idx_citizen_updates_report ON citizen_report_updates(report_id);

-- Seed demo offices
INSERT OR IGNORE INTO citizen_office_index (name, category, city, score, response_minutes_avg) VALUES
  ('Passport Office - Cairo', 'passport', 'Cairo', 82, 90),
  ('Police Station - Maadi', 'police', 'Cairo', 64, 22),
  ('Municipality - Giza', 'municipal', 'Giza', 45, 180),
  ('Health Clinic - Alexandria', 'health', 'Alexandria', 91, 15),
  ('Traffic Authority - Downtown', 'transport', 'Cairo', 58, 55),
  ('Tax Authority - Nasr City', 'tax', 'Cairo', 70, 140),
  ('Education Directorate - Cairo', 'education', 'Cairo', 76, 160);

-- Seed demo reports for preview
INSERT OR IGNORE INTO citizen_reports (id, user_id, category, description, privacy_mode, lat, lng, city, routing, status, estimated_minutes, response_minutes, created_at, updated_at) VALUES
  ('CS-DEMO01', 1, 'police', 'Officer refused to file a complaint at Maadi station.', 'identified', 29.96, 31.25, 'Cairo', 'Police Station - Maadi', 'resolved', 15, 12, '2026-06-28 10:00:00', '2026-06-28 10:30:00'),
  ('CS-DEMO02', 1, 'passport', 'Passport renewal queue took 4 hours with no seating.', 'protected', 30.04, 31.23, 'Cairo', 'Passport Office - Cairo', 'responded', 120, 90, '2026-06-29 09:00:00', '2026-06-29 11:00:00'),
  ('CS-DEMO03', 1, 'municipal', 'Uncollected garbage in front of the clinic for 5 days.', 'anonymous', 30.01, 31.21, 'Giza', 'Municipality - Giza', 'underReview', 240, NULL, '2026-06-30 08:00:00', '2026-06-30 08:00:00');

INSERT OR IGNORE INTO citizen_evidence (report_id, kind, cid) VALUES
  ('CS-DEMO01', 'photo', 'ipfs://QmDemoEvidence1'),
  ('CS-DEMO02', 'photo', 'ipfs://QmDemoEvidence2');

INSERT OR IGNORE INTO citizen_witnesses (report_id, user_id, display_name, proximity_m, verified) VALUES
  ('CS-DEMO01', 2, 'Layla M.', 45, 1),
  ('CS-DEMO01', 3, 'Omar K.', 120, 0),
  ('CS-DEMO02', 4, 'Fatima H.', 30, 1);

INSERT OR IGNORE INTO citizen_report_updates (report_id, status, note) VALUES
  ('CS-DEMO01', 'resolved', 'Station supervisor contacted complainant and logged the report.'),
  ('CS-DEMO02', 'responded', 'Passport office added seating and extended appointment hours.');
