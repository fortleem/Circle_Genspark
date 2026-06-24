-- 0011 — Rich mock data for production-feel demo across all 4 pillars
-- Adds: Madrasa demo rooms (Wasl), bulk videos (Mashahd), bulk photos (Lamahat),
--       bulk posts + replies (Midan), additional channels, additional users.
-- Safe to re-run: INSERT OR IGNORE pattern + idempotent IDs.

-- Ensure base seed users exist before rich mocks reference them (idempotent).
INSERT OR IGNORE INTO users (id, handle, matrix_id, display_name, email, bio, country, city, language, verified, verified_claim) VALUES
  (1, 'ahmed',   '@ahmed:matrix.circle.app',   'Ahmed Saleh',    'ahmed@circle.app',   'Civil engineer in Cairo. Tea + chess.',          'EG', 'Cairo',      'ar', 1, 'nationality_EG'),
  (2, 'layla',   '@layla:matrix.circle.app',   'Layla Mansour',  'layla@circle.app',   'Photographer. Sufi music lover.',                'EG', 'Cairo',      'ar', 1, 'over_18'),
  (3, 'omar',    '@omar:matrix.circle.app',    'Omar Khaled',    'omar@circle.app',    'Backend dev. Self-hosting evangelist.',          'EG', 'Alexandria', 'ar', 1, 'over_18'),
  (4, 'fatima',  '@fatima:matrix.circle.app',  'Fatima Hossam',  'fatima@circle.app',  'Med student at Cairo University.',               'EG', 'Cairo',      'ar', 1, 'over_18'),
  (5, 'youssef', '@youssef:matrix.circle.app', 'Youssef Adel',   'youssef@circle.app', 'Indie filmmaker.',                                'EG', 'Cairo',      'ar', 1, 'over_18'),
  (6, 'mei',     '@mei:matrix.circle.cn',      'Mei Lin',        'mei@circle.app',     '上海的产品经理。',                                  'CN', 'Shanghai',   'zh', 1, 'real_name'),
  (7, 'klaus',   '@klaus:matrix.circle.eu',    'Klaus Becker',   'klaus@circle.app',   'Berliner. Rust + Matrix contributor.',           'DE', 'Berlin',     'de', 1, 'over_18'),
  (8, 'sara',    '@sara:matrix.circle.app',    'Sara Al-Otaibi', 'sara@circle.app',    'UX designer in Riyadh.',                          'SA', 'Riyadh',     'ar', 1, 'over_18'),
  (9, 'jane',    '@jane:matrix.circle.app',    'Jane Doe',       'jane@circle.app',    'Open-source maintainer.',                         'US', 'Chicago',    'en', 0, NULL),
  (10,'circle_official', '@official:matrix.circle.app', 'Circle Official', 'team@circle.app', 'The Circle covenant in action.',          'EG', 'Cairo',      'ar', 1, 'organization');

-- ───────────────── Extra users (mix of regions / languages) ─────────────────
INSERT OR IGNORE INTO users (id, handle, matrix_id, display_name, email, avatar_cid, bio, country, city, language, verified) VALUES
  (11, 'fatima_zahra',  '@fatima_z:matrix.circle.app','Fatima Zahra',   'fatima.z@circle.app','ipfs://QmF1', 'Math teacher · Cairo Modern School', 'EG', 'Cairo',     'ar', 1),
  (12, 'omar_lebanon',  '@omar_lb:matrix.circle.app', 'Omar Habib',     'omar.lb@circle.app', 'ipfs://QmO2', 'Beirut food vlogger · 500K subs',    'LB', 'Beirut',    'ar', 1),
  (13, 'nadia_tunis',   '@nadia:matrix.circle.app',   'Nadia Ben Ali',  'nadia@circle.app',   'ipfs://QmN3', 'Photographer · old medinas',         'TN', 'Tunis',     'ar', 0),
  (14, 'yusuf_riyadh',  '@yusuf:matrix.circle.app',   'Yusuf Al-Saud',  'yusuf@circle.app',   'ipfs://QmY4', 'Riyadh F1 fan · car detailing',     'SA', 'Riyadh',    'ar', 1),
  (15, 'leila_paris',   '@leila:matrix.circle.app',   'Leila Mansour',  'leila@circle.app',   'ipfs://QmL5', 'EG-FR · UX designer · Sorbonne',     'FR', 'Paris',     'fr', 0),
  (16, 'tariq_dxb',     '@tariq:matrix.circle.app',   'Tariq Hassan',   'tariq@circle.app',   'ipfs://QmT6', 'Drone pilot Dubai · cinematic',      'AE', 'Dubai',     'ar', 1),
  (17, 'mariam_amman',  '@mariam:matrix.circle.app',  'Mariam Khoury',  'mariam@circle.app',  'ipfs://QmM7', 'Civic-tech engineer · Amman',        'JO', 'Amman',     'ar', 0),
  (18, 'salah_cairo',   '@salah:matrix.circle.app',   'Salah El-Din',   'salah@circle.app',   'ipfs://QmS8', 'Principal · Cairo Modern School',    'EG', 'Cairo',     'ar', 1),
  (19, 'amina_ksa',     '@amina:matrix.circle.app',   'Amina Bint Said','amina@circle.app',   'ipfs://QmA9', 'Computer-science teacher · Al-Azhar','SA', 'Jeddah',    'ar', 1),
  (20, 'kareem_dad',    '@kareem:matrix.circle.app',  'Kareem (Dad)',   'kareem@circle.app',  'ipfs://QmK0', 'Parent of Yara (Grade 7)',           'EG', 'Cairo',     'ar', 0);

-- ───────────────── Madrasa demo rooms (Wasl workspace kind) ─────────────────
INSERT OR IGNORE INTO rooms (id, name, topic, room_type, is_encrypted, created_by) VALUES
  ('maktab_demo_cairo',    'Cairo Modern School',      'Sovereign learning OS · K-12 · 1,240 students',         'workspace', 1, 18),
  ('maktab_demo_alazhar',  'Al-Azhar Academy',         'Faculty of Engineering · 3,400 students · multi-campus','workspace', 1, 19),
  ('maktab_demo_riyadh',   'Riyadh STEM Academy',      'STEM-focused · grades 6-12 · 820 students',             'workspace', 1, 14);

-- Members for Madrasa workspaces
INSERT OR IGNORE INTO room_members (room_id, user_id, role) VALUES
  ('maktab_demo_cairo', 18, 'owner'),
  ('maktab_demo_cairo', 11, 'admin'),
  ('maktab_demo_cairo', 20, 'member'),
  ('maktab_demo_cairo',  1, 'member'),
  ('maktab_demo_alazhar', 19, 'owner'),
  ('maktab_demo_alazhar', 11, 'admin'),
  ('maktab_demo_alazhar',  2, 'member'),
  ('maktab_demo_riyadh', 14, 'owner'),
  ('maktab_demo_riyadh', 19, 'admin');

-- A handful of starter messages
INSERT OR IGNORE INTO messages (id, room_id, sender_id, body, status, is_encrypted) VALUES
  ('$evt_mk_1', 'maktab_demo_cairo',   18, 'Welcome to Cairo Modern School on Circle! Term begins Sunday.',    3, 1),
  ('$evt_mk_2', 'maktab_demo_cairo',   11, 'Grade 7 Math syllabus has been published in Resources.',           3, 1),
  ('$evt_mk_3', 'maktab_demo_cairo',   20, 'Thank you. Will the Friday parent-teacher slot be on Wasl video?', 2, 1),
  ('$evt_mk_4', 'maktab_demo_alazhar', 19, 'Faculty meeting Wed 10:00 — agenda in shared Drive.',              3, 1),
  ('$evt_mk_5', 'maktab_demo_riyadh',  14, 'STEM lab refurbishment complete — open house this Saturday.',      3, 1);

-- ─────────────────────── Wasl — extra DMs / groups / channels ───────────────────────
INSERT OR IGNORE INTO rooms (id, name, topic, room_type, is_encrypted, created_by) VALUES
  ('!dm_omar_leila',         'Omar ↔ Leila',                 NULL,                                                 'direct',    1, 12),
  ('!dm_tariq_nadia',        'Tariq ↔ Nadia',                NULL,                                                 'direct',    1, 16),
  ('!grp_arabicdevs',        'Arabic Devs',                  'Open Arabic-speaking engineers · 2,300 members',     'group',     1, 17),
  ('!grp_beirutfoodies',     'Beirut Foodies',               'Best of Beirut food · weekly meet-ups',              'group',     1, 12),
  ('!grp_madinacollectors',  'Old Medina Collectors',        'Architecture · doors · tilework · north Africa',     'group',     1, 13),
  ('!ch_circle_news',        'Circle News',                  'Official product updates · monthly recap',           'broadcast', 0, 1),
  ('!ch_gov_egypt',          'Egypt Civic Channel',          'Public service updates · ministry of education',     'broadcast', 0, 18);

INSERT OR IGNORE INTO room_members (room_id, user_id, role) VALUES
  ('!dm_omar_leila',        12, 'owner'), ('!dm_omar_leila',        15, 'member'),
  ('!dm_tariq_nadia',       16, 'owner'), ('!dm_tariq_nadia',       13, 'member'),
  ('!grp_arabicdevs',       17, 'owner'), ('!grp_arabicdevs',       11, 'admin'),  ('!grp_arabicdevs',       19, 'member'),
  ('!grp_beirutfoodies',    12, 'owner'), ('!grp_beirutfoodies',    13, 'member'),
  ('!grp_madinacollectors', 13, 'owner'), ('!grp_madinacollectors', 12, 'member'),
  ('!ch_circle_news',        1, 'owner'),
  ('!ch_gov_egypt',         18, 'owner');

INSERT OR IGNORE INTO messages (id, room_id, sender_id, body, status, is_encrypted) VALUES
  ('$msg_a1','!dm_omar_leila',         12, 'Hey Leila — that UX teardown of the Beirut delivery app was 🔥', 3, 1),
  ('$msg_a2','!dm_omar_leila',         15, 'Thanks! I will publish part 2 on Midan tomorrow.',                3, 1),
  ('$msg_a3','!dm_tariq_nadia',        16, 'I uploaded the Marina sunset 4K to your Drive folder.',           2, 1),
  ('$msg_a4','!grp_arabicdevs',        17, 'Anyone going to FOSDEM Tunis next month?',                        3, 1),
  ('$msg_a5','!grp_arabicdevs',        11, 'I am — bringing a workshop on D1 + Hono.',                        3, 1),
  ('$msg_a6','!grp_beirutfoodies',     12, 'Tonight: Bourj Hammoud food crawl, RSVP in the Rihla itinerary.', 3, 1),
  ('$msg_a7','!grp_madinacollectors',  13, 'New album: 47 doors of Sidi Bou Said. See Lamahat 🎨',            3, 1),
  ('$msg_a8','!ch_circle_news',         1, 'Wave 3 ships today: Theater Player, Jury Panel, AI Sage.',        3, 0),
  ('$msg_a9','!ch_gov_egypt',          18, 'Thanawiya Amma 2026 exam schedule published. Tap to download.',   3, 0);

-- ───────────────────────────── Mashahd — bulk videos ─────────────────────────────
INSERT OR IGNORE INTO videos (id, uploader_id, title, description, cid, thumbnail_cid, duration_sec, views, likes, city, language, nsfw, published_at) VALUES
  (101, 12, 'Beirut Street Food — 24 hours, 18 dishes',          'From manakish at dawn to knafeh at midnight.',    'bafyVid101', 'bafyThumb101',  742,  84321,  6210, 'Beirut',  'ar', 0, datetime('now','-1 days')),
  (102, 13, 'Sidi Bou Said in Blue — 4K walking tour',           'Tilework, doors, jasmine.',                       'bafyVid102', 'bafyThumb102', 1023, 110450,  9874, 'Tunis',   'ar', 0, datetime('now','-2 days')),
  (103, 14, 'How I detail my F1 wheels (Riyadh GP edition)',     'Step-by-step pro detail with eco products.',      'bafyVid103', 'bafyThumb103',  612,  42091,  3120, 'Riyadh',  'ar', 0, datetime('now','-3 days')),
  (104, 15, 'UX teardown — Beirut delivery apps (FR/AR)',        'Why one beats the other 9× on conversion.',       'bafyVid104', 'bafyThumb104', 1180,  21305,  2840, 'Paris',   'fr', 0, datetime('now','-4 days')),
  (105, 16, 'Dubai Marina at 4K · drone cinematic',              'Burj Khalifa sunset · golden hour drone shoot.',  'bafyVid105', 'bafyThumb105',  205, 305820, 41250, 'Dubai',   'ar', 0, datetime('now','-5 days')),
  (106, 17, 'How Amman is using civic-tech to fix water bills',  'Open-source dashboard for citizens.',             'bafyVid106', 'bafyThumb106',  900,  17822,   1450, 'Amman',  'ar', 0, datetime('now','-6 days')),
  (107, 11, 'Quadratic formula explained in Arabic · Grade 9',   'Cairo Modern School maths series.',               'bafyVid107', 'bafyThumb107',  540,   8910,    980, 'Cairo',  'ar', 0, datetime('now','-7 days')),
  (108, 19, 'Intro to LLMs · Faculty of Engineering · Al-Azhar', 'Open lecture · Arabic · slides included.',        'bafyVid108', 'bafyThumb108', 2700,  12340,   1820, 'Jeddah', 'ar', 0, datetime('now','-8 days')),
  (109,  1, 'Circle product walkthrough · v12.0',                'Every pillar, every feature, in 12 minutes.',     'bafyVid109', 'bafyThumb109',  720, 152100,  18900, 'Cairo',  'en', 0, datetime('now','-9 days')),
  (110, 12, 'Knafeh battle — Tripoli vs Nablus · live taste',    'Two old men, one phone, one knafeh tray.',        'bafyVid110', 'bafyThumb110',  610,  98712,   8123, 'Beirut', 'ar', 0, datetime('now','-10 days')),
  (111, 13, 'Carthage ruins at golden hour · timelapse',         'No music · only wind and stone.',                 'bafyVid111', 'bafyThumb111',  180,  74500,   6230, 'Tunis',  'ar', 0, datetime('now','-12 days')),
  (112, 14, 'F1 simulator setup tour — Riyadh edition',          'Building the rig that runs the Saudi GP livery.', 'bafyVid112', 'bafyThumb112',  840,  29010,   2400, 'Riyadh', 'ar', 0, datetime('now','-14 days')),
  (113, 16, 'Drone over Palm Jumeirah · 3 min cinematic',        'A 3-minute meditation in 4K.',                    'bafyVid113', 'bafyThumb113',  175, 211003,  29800, 'Dubai',  'ar', 0, datetime('now','-16 days')),
  (114, 17, 'Citizens, code, and water · Amman case study',      'How 4 engineers fixed a city utility in 3 mo.',   'bafyVid114', 'bafyThumb114', 1320,  16320,   2110, 'Amman',  'ar', 0, datetime('now','-18 days')),
  (115, 11, 'Probability puzzles · 5 brain-teasers (Arabic)',    'Try them with your students.',                    'bafyVid115', 'bafyThumb115',  480,   7301,    610, 'Cairo',  'ar', 0, datetime('now','-20 days')),
  (116, 15, 'Type design for Arabic on the web · talk @ Sorbonne','Bilingual · slides in EN+AR.',                   'bafyVid116', 'bafyThumb116', 2100,   9412,   1240, 'Paris',  'en', 0, datetime('now','-22 days'));

-- ───────────────────────────── Lamahat — bulk photos ─────────────────────────────
INSERT OR IGNORE INTO photos (id, uploader_id, caption, cid, city, likes, comments_count, published_at) VALUES
  (201, 13, 'Door No.34, Sidi Bou Said · #blue #tunisia',                       'bafyPhoto201', 'Tunis',  4210,  82, datetime('now','-1 days')),
  (202, 16, 'Dubai sandstorm rolling over the Marina · iPhone 17 Pro',          'bafyPhoto202', 'Dubai',  9120, 213, datetime('now','-1 days')),
  (203, 12, 'Knafeh at Hallab · still my favorite #beirut #foodie',             'bafyPhoto203', 'Beirut', 3120,  64, datetime('now','-2 days')),
  (204, 14, 'Sunset at King Khalid Park · 28°C and perfect',                    'bafyPhoto204', 'Riyadh', 2410,  41, datetime('now','-2 days')),
  (205, 15, 'Pont des Arts · early Sunday before the tourists',                 'bafyPhoto205', 'Paris',  6240, 132, datetime('now','-3 days')),
  (206, 11, 'My maths classroom got a new whiteboard. Tiny joys. #teacherlife', 'bafyPhoto206', 'Cairo',  1120,  28, datetime('now','-3 days')),
  (207, 17, 'Amman rooftops at golden hour · drone shot · stitched 3 frames',   'bafyPhoto207', 'Amman',  5840, 102, datetime('now','-4 days')),
  (208, 19, 'Jeddah corniche · the only city where the sea kisses neon',        'bafyPhoto208', 'Jeddah', 4120,  78, datetime('now','-4 days')),
  (209, 16, 'Burj sunrise · 5:43 AM · totally worth the wake-up call',          'bafyPhoto209', 'Dubai', 11230, 312, datetime('now','-5 days')),
  (210, 13, 'Carthage ruins · a single arch left standing',                     'bafyPhoto210', 'Tunis',  3680,  71, datetime('now','-6 days')),
  (211,  2, 'Cairo souk · the spice merchant who let me photograph his hands',  'bafyPhoto211', 'Cairo',  7920, 184, datetime('now','-7 days')),
  (212, 12, 'Bourj Hammoud at 11pm · neon and falafel',                         'bafyPhoto212', 'Beirut', 2410,  42, datetime('now','-8 days')),
  (213, 15, 'Sorbonne library · 3 hours before my talk on Arabic type',         'bafyPhoto213', 'Paris',   910,  18, datetime('now','-9 days')),
  (214, 14, 'F1 trophies cabinet · grand prix collection 2010-2025',            'bafyPhoto214', 'Riyadh', 1830,  37, datetime('now','-10 days'));

-- ───────────────────────────── Midan — bulk posts + replies ─────────────────────────────
INSERT OR IGNORE INTO posts (id, author_id, content, hashtags, city, language, anonymous, reposts, likes, replies_count) VALUES
  (301, 17, 'Amman just open-sourced their water-bill backend. Wild that any city would. Now everyone can audit it.', '#civictech #amman #opengov',  'Amman',  'ar', 0, 412, 1820,  18),
  (302, 12, 'Hot take: best knafeh is NOT in Nablus. It is in Tripoli. Fight me 😅 #knafeh',                            '#food #lebanon',              'Beirut', 'ar', 0, 210,  982,  62),
  (303, 15, 'Working on Arabic type for the web — kerning is killing me. Anyone shipping good RTL ligature shaping?',  '#typography #rtl',            'Paris',  'en', 0,  62,  340,  14),
  (304, 16, 'Why are drone permits so painful in EG? Took me 6 weeks for a 10-min Cairo sunset shot 🚁',                '#drone #egypt',               'Cairo',  'ar', 0,  78,  290,  21),
  (305, 19, 'Just published lecture 4 of the LLM course. Free, in Arabic, no paywall — link in profile.',              '#ai #education #arabic',      'Jeddah', 'ar', 0, 121,  680,   9),
  (306,  1, 'Circle Wave 3 is LIVE — Theater Player, Jury Panel, Translate v2, AI Sage. Read the changelog.',          '#circle #release',            'Cairo',  'en', 0, 312, 1421,  44),
  (307, 11, 'Tip for math teachers in Egypt: Geogebra now works offline in Madrasa. Saves me 2 hrs/week.',             '#teacherlife #math #madrasa', 'Cairo',  'ar', 0,  41,  182,   7),
  (308, 14, 'Saudi GP qualifying race in Jeddah next week — anyone going? Drop a 🏎️ if yes.',                          '#f1 #saudigp',                'Riyadh', 'ar', 0,  18,  402,  29),
  (309, 13, 'Old medinas of the Maghreb deserve a UNESCO joint listing. Same architectural DNA, same craftsmen.',      '#heritage #maghreb',          'Tunis',  'ar', 0,  92,  410,   8),
  (310, 17, 'Anonymous: I tried to report a bug to a ministry. The form asked for my national ID. We are not OK.',     '#civictech',                  'Amman',  'ar', 1,  18,  118,  12);

INSERT OR IGNORE INTO post_replies (post_id, author_id, content) VALUES
  (301, 11, 'This is exactly what I show my students when teaching civic engineering.'),
  (301, 15, 'Bookmarking — wish Paris would do the same.'),
  (302, 13, 'Wrong. Best knafeh is in Tunis. Eastern Mediterranean monopoly is over 😉'),
  (302, 19, 'Both are wrong. Damascus.'),
  (303, 17, 'Look at Tarteel — they shipped solid harakat shaping last month.'),
  (304, 12, 'Drone permits in Lebanon are a nightmare too. Solidarity 🚁'),
  (305, 11, 'Sharing with the Cairo Modern School senior class. Thank you.'),
  (306, 14, 'Theater Player is wild. Full-screen with knowledge graph + scene polls. Game-changer.'),
  (307, 18, 'As principal — confirming, just rolled out to all 12 of our maths classrooms.'),
  (308, 16, '🏎️🏎️ Bringing the drone.'),
  (309, 12, 'Co-sign. The doors of Tripoli (LB) and Sidi Bou Said share a craftsman family lineage.'),
  (310, 17, 'Update: the bug was that the form leaks your national ID via the URL query string. Reported responsibly.');

-- ───────────────────────────── Extra channels (Mashahd Channels tab) ─────────────────────────────
INSERT OR IGNORE INTO channels (id, slug, name, description, channel_type, category, verified, subscriber_count, owner_id, avatar_cid, country) VALUES
  (51, 'omarfood',     'Omar Eats Beirut', '24-hour food crawls across the Levant',           'creator',   'food',  1, 512000, 12, 'ipfs://QmO2', 'LB'),
  (52, 'tariqair',     'Tariq From Above', 'Drone cinematic of the Gulf',                     'creator',   'travel',1, 380000, 16, 'ipfs://QmT6', 'AE'),
  (53, 'nadiamedina',  'Nadia · Medinas',  'Old medinas of North Africa, one door at a time', 'creator',   'art',   0, 142000, 13, 'ipfs://QmN3', 'TN'),
  (54, 'azhar_edu',    'Al-Azhar Open Edu','Free university lectures in Arabic',              'educational','edu',  1,  92000, 19, 'ipfs://QmA9', 'SA'),
  (55, 'cairoModern',  'Cairo Modern School','Sovereign learning OS demo school',             'educational','edu',  1,  18000, 18, 'ipfs://QmS8', 'EG'),
  (56, 'civic_amman',  'Civic Amman',      'Open data + civic-tech for Jordanian citizens',   'official',  'gov',   1,  61000, 17, 'ipfs://QmM7', 'JO');

INSERT OR IGNORE INTO channel_posts (channel_id, title, body) VALUES
  (51, 'New episode tonight 8pm', 'Manakish ↔ Knafeh — 24 hrs in Tripoli'),
  (52, 'Behind the scenes',       'How I plan a 3-minute drone short over the Marina'),
  (53, 'Album drop',              '47 doors of Sidi Bou Said — all CC-BY'),
  (54, 'Lecture 5 published',     'Attention mechanism in transformers — slides + Arabic captions'),
  (55, 'School newsletter',       'Term 2 schedule, parent-teacher dates, and the Geogebra rollout'),
  (56, 'Open data',               'Water-bill backend now on GitHub — citizens, audit away');

-- ───────────────────────────── Extra circles (groups) ─────────────────────────────
INSERT OR IGNORE INTO circles (slug, name, description, visibility, category, city, member_count, owner_id) VALUES
  ('arabicdevs',      'Arabic Devs',          'Engineering in Arabic',         'public',  'tech',    'Cairo',  2310, 17),
  ('beirutfoodies',   'Beirut Foodies',       'Weekly meet-ups',               'public',  'food',    'Beirut',  840, 12),
  ('madinacollectors','Old Medina Collectors','Doors · tile · arches',         'public',  'art',     'Tunis',   612, 13),
  ('cairoteachers',   'Cairo Teachers',       'K-12 teachers across districts','public',  'edu',     'Cairo',  1410, 11),
  ('riyadhf1',        'Riyadh F1',            'Saudi GP season fans',          'public',  'sports',  'Riyadh',  920, 14),
  ('amman_civic',     'Amman Civic Lab',      'Civic-tech for Jordan',         'private', 'gov',     'Amman',   210, 17);
