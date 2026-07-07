-- 0010_maktab_education.sql — Full educational workspace (Blueprint §12)
-- Maktab is NOT just for orgs/schools — covers classrooms, attendance, grading,
-- timetables, assignments, parents, resources. Self-hosted Matrix HQ school suite.

-- ─────────────────────────── Classes ───────────────────────────
CREATE TABLE IF NOT EXISTS maktab_classes (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id  TEXT NOT NULL,
  name          TEXT NOT NULL,          -- "Grade 7B · Mathematics"
  subject       TEXT,                   -- "Mathematics", "English", "Quran"
  grade_level   TEXT,                   -- "G7", "G12", "Year-2", "Hifz-I"
  teacher_id    INTEGER,
  room_id       TEXT,                   -- optional Wasl room for chat
  schedule      TEXT,                   -- JSON: [{day:"mon",start:"09:00",end:"10:00"}]
  capacity      INTEGER DEFAULT 30,
  archived      INTEGER DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maktab_classes_ws ON maktab_classes(workspace_id);

-- ─────────────────────────── People (roster) ───────────────────────────
CREATE TABLE IF NOT EXISTS maktab_people (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id  TEXT NOT NULL,
  user_id       INTEGER,                -- may be null for parents/staff w/o accounts yet
  role          TEXT NOT NULL,          -- 'student' | 'teacher' | 'parent' | 'principal' | 'staff'
  display_name  TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  meta          TEXT,                   -- JSON: {parent_of: [student_id, ...], homeroom: 'G7B', employee_no:'T-031'}
  status        TEXT DEFAULT 'active',  -- 'active' | 'invited' | 'suspended' | 'graduated'
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maktab_people_ws_role ON maktab_people(workspace_id, role);

-- ─────────────────────────── Class enrollment ───────────────────────────
CREATE TABLE IF NOT EXISTS maktab_enrollments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id      INTEGER NOT NULL,
  person_id     INTEGER NOT NULL,
  role          TEXT NOT NULL,          -- 'student' | 'teacher' | 'ta' | 'observer'
  enrolled_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, person_id, role)
);
CREATE INDEX IF NOT EXISTS idx_maktab_enroll_class ON maktab_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_maktab_enroll_person ON maktab_enrollments(person_id);

-- ─────────────────────────── Attendance ───────────────────────────
CREATE TABLE IF NOT EXISTS maktab_attendance (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id      INTEGER NOT NULL,
  person_id     INTEGER NOT NULL,
  date          TEXT NOT NULL,          -- 'YYYY-MM-DD'
  status        TEXT NOT NULL,          -- 'present' | 'absent' | 'late' | 'excused'
  note          TEXT,
  marked_by     INTEGER,
  marked_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(class_id, person_id, date)
);
CREATE INDEX IF NOT EXISTS idx_maktab_att_class_date ON maktab_attendance(class_id, date);

-- ─────────────────────────── Assignments ───────────────────────────
CREATE TABLE IF NOT EXISTS maktab_assignments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id      INTEGER NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  kind          TEXT DEFAULT 'homework', -- 'homework' | 'quiz' | 'exam' | 'project' | 'reading'
  due_at        DATETIME,
  max_points    INTEGER DEFAULT 100,
  rubric        TEXT,                   -- JSON
  resource_ipfs TEXT,                   -- IPFS CID for handout
  created_by    INTEGER,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maktab_assign_class ON maktab_assignments(class_id);

-- ─────────────────────────── Grades ───────────────────────────
CREATE TABLE IF NOT EXISTS maktab_grades (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL,
  person_id     INTEGER NOT NULL,
  score         REAL,
  comment       TEXT,
  submitted_at  DATETIME,
  graded_by     INTEGER,
  graded_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assignment_id, person_id)
);
CREATE INDEX IF NOT EXISTS idx_maktab_grades_person ON maktab_grades(person_id);

-- ─────────────────────────── Resources (course library) ───────────────────────────
CREATE TABLE IF NOT EXISTS maktab_resources (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id  TEXT NOT NULL,
  class_id      INTEGER,                -- nullable for workspace-wide
  title         TEXT NOT NULL,
  kind          TEXT NOT NULL,          -- 'pdf' | 'video' | 'slide' | 'doc' | 'link' | 'audio'
  ipfs_cid      TEXT,
  url           TEXT,
  tags          TEXT,                   -- comma-separated
  uploaded_by   INTEGER,
  uploaded_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maktab_res_ws ON maktab_resources(workspace_id);

-- ─────────────────────────── Announcements (parents + students) ─────────────────
CREATE TABLE IF NOT EXISTS maktab_announcements (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id  TEXT NOT NULL,
  class_id      INTEGER,                -- null = all workspace
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  audience      TEXT NOT NULL,          -- 'all' | 'students' | 'parents' | 'teachers'
  posted_by     INTEGER,
  posted_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maktab_ann_ws ON maktab_announcements(workspace_id);

-- ─────────────────────────── Seed: Cairo demo Maktab ───────────────────────────
-- Use a stable workspace id matching the maktab room in 0003 seed data if any
INSERT OR IGNORE INTO maktab_classes (workspace_id, name, subject, grade_level, teacher_id, capacity, schedule)
VALUES
  ('maktab_demo_cairo', 'Grade 7B · Mathematics',     'Mathematics', 'G7',  2, 28, '[{"day":"sun","start":"08:30","end":"09:30"},{"day":"tue","start":"08:30","end":"09:30"},{"day":"thu","start":"08:30","end":"09:30"}]'),
  ('maktab_demo_cairo', 'Grade 7B · Arabic Literature','Arabic',      'G7',  3, 28, '[{"day":"mon","start":"10:00","end":"11:00"},{"day":"wed","start":"10:00","end":"11:00"}]'),
  ('maktab_demo_cairo', 'Grade 7B · Science',          'Science',     'G7',  4, 28, '[{"day":"sun","start":"11:00","end":"12:00"},{"day":"tue","start":"11:00","end":"12:00"}]'),
  ('maktab_demo_cairo', 'Quran · Hifz Cirkle I',       'Quran',       'Hifz-I', 5, 12, '[{"day":"sat","start":"17:00","end":"18:30"},{"day":"mon","start":"17:00","end":"18:30"}]'),
  ('maktab_demo_cairo', 'Grade 12 · Calculus AP',      'Mathematics', 'G12', 2, 22, '[{"day":"sun","start":"13:00","end":"14:30"},{"day":"wed","start":"13:00","end":"14:30"}]');

INSERT OR IGNORE INTO maktab_people (workspace_id, user_id, role, display_name, email, meta) VALUES
  ('maktab_demo_cairo', 2,    'principal', 'Dr. Hala Mahmoud',  'hala@maktab.demo',   '{"office":"Bldg A · 201"}'),
  ('maktab_demo_cairo', 3,    'teacher',   'Ustadh Karim Sayed','karim@maktab.demo',  '{"subjects":["Mathematics"]}'),
  ('maktab_demo_cairo', 4,    'teacher',   'Mrs. Nour Hassan',  'nour@maktab.demo',   '{"subjects":["Arabic"]}'),
  ('maktab_demo_cairo', 5,    'teacher',   'Mr. Tarek Adel',    'tarek@maktab.demo',  '{"subjects":["Science"]}'),
  ('maktab_demo_cairo', 6,    'student',   'Yara Sami',         NULL,                 '{"homeroom":"G7B","student_no":"S-712"}'),
  ('maktab_demo_cairo', 7,    'student',   'Omar Khaled',       NULL,                 '{"homeroom":"G7B","student_no":"S-713"}'),
  ('maktab_demo_cairo', 8,    'student',   'Lina Mostafa',      NULL,                 '{"homeroom":"G7B","student_no":"S-714"}'),
  ('maktab_demo_cairo', 9,    'student',   'Amr Tarek',         NULL,                 '{"homeroom":"G7B","student_no":"S-715"}'),
  ('maktab_demo_cairo', 10,   'student',   'Salma Walid',       NULL,                 '{"homeroom":"G12","student_no":"S-201"}'),
  ('maktab_demo_cairo', NULL, 'parent',    'Sami Aboulela',     'sami@example.com',   '{"parent_of":["Yara Sami"]}'),
  ('maktab_demo_cairo', NULL, 'parent',    'Khaled Magdy',      'khaled@example.com', '{"parent_of":["Omar Khaled"]}'),
  ('maktab_demo_cairo', NULL, 'staff',     'Hany (IT)',         'it@maktab.demo',     '{"team":"IT Support"}');

-- Seed enrollments for class 1 (Math G7B): 4 students + 1 teacher
INSERT OR IGNORE INTO maktab_enrollments (class_id, person_id, role) VALUES
  (1, 2, 'teacher'),  -- principal as observer not real; mapping by demo seq
  (1, 5, 'student'), (1, 6, 'student'), (1, 7, 'student'), (1, 8, 'student');

-- Seed today's attendance for class 1
INSERT OR IGNORE INTO maktab_attendance (class_id, person_id, date, status, marked_by) VALUES
  (1, 5, date('now'), 'present', 2),
  (1, 6, date('now'), 'present', 2),
  (1, 7, date('now'), 'late', 2),
  (1, 8, date('now'), 'absent', 2);

-- Seed assignments
INSERT OR IGNORE INTO maktab_assignments (class_id, title, description, kind, due_at, max_points, created_by) VALUES
  (1, 'HW · Chapter 4 Exercises 1-15', 'Solve and show your working', 'homework', datetime('now', '+2 days'), 30, 2),
  (1, 'Quiz · Fractions',              'In-class · 20 min',           'quiz',     datetime('now', '+7 days'), 20, 2),
  (2, 'Read · Naguib Mahfouz excerpt', 'Pages 12-24 · prepare summary','reading',  datetime('now', '+3 days'), 10, 3),
  (4, 'Memorise · Surah Yaseen 1-12',  'With tajweed',                 'homework', datetime('now', '+5 days'), 20, 5);

-- Seed a grade
INSERT OR IGNORE INTO maktab_grades (assignment_id, person_id, score, comment, graded_by) VALUES
  (1, 5, 28, 'Excellent — clear working', 2),
  (1, 6, 24, 'Good — show steps for Q9',  2),
  (1, 7, 22, 'Improve labeling',          2);

-- Seed resources
INSERT OR IGNORE INTO maktab_resources (workspace_id, class_id, title, kind, ipfs_cid, tags, uploaded_by) VALUES
  ('maktab_demo_cairo', 1, 'Chapter 4 Slides',   'slide', 'bafyMathCh4Demo123',  'math,g7,fractions', 2),
  ('maktab_demo_cairo', 1, 'Practice Worksheet', 'pdf',   'bafyWorksheetCh4',    'math,g7,worksheet', 2),
  ('maktab_demo_cairo', 4, 'Tajweed Audio Lib',  'audio', 'bafyTajweedAudio',    'quran,tajweed',     5),
  ('maktab_demo_cairo', NULL, 'School Handbook', 'pdf',   'bafySchoolHandbook',  'policy,handbook',   2);

-- Seed announcements
INSERT OR IGNORE INTO maktab_announcements (workspace_id, class_id, title, body, audience, posted_by) VALUES
  ('maktab_demo_cairo', NULL, 'Mid-term begins next week',   'Mid-term exams start Sunday. Best of luck!',           'all',      2),
  ('maktab_demo_cairo', 1,    'Math tutoring · Wed 2pm',     'Extra session for Chapter 4 questions.',                'students', 2),
  ('maktab_demo_cairo', NULL, 'Parent-teacher conference',   'Saturday 10am-1pm. Sign up via the portal.',           'parents',  2);
