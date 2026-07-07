-- Cirkle seed data: realistic Egypt-focused content + globally relevant samples
-- Idempotent via OR IGNORE where possible

-- Users
INSERT OR IGNORE INTO users (id, handle, matrix_id, display_name, email, bio, country, city, language, verified, verified_claim) VALUES
  (1, 'ahmed',   '@ahmed:matrix.cirkle.app',   'Ahmed Saleh',    'ahmed@cirkle.app',   'Civil engineer in Cairo. Tea + chess.',          'EG', 'Cairo',      'ar', 1, 'nationality_EG'),
  (2, 'layla',   '@layla:matrix.cirkle.app',   'Layla Mansour',  'layla@cirkle.app',   'Photographer. Sufi music lover.',                'EG', 'Cairo',      'ar', 1, 'over_18'),
  (3, 'omar',    '@omar:matrix.cirkle.app',    'Omar Khaled',    'omar@cirkle.app',    'Backend dev. Self-hosting evangelist.',          'EG', 'Alexandria', 'ar', 1, 'over_18'),
  (4, 'fatima',  '@fatima:matrix.cirkle.app',  'Fatima Hossam',  'fatima@cirkle.app',  'Med student at Cairo University.',               'EG', 'Cairo',      'ar', 1, 'over_18'),
  (5, 'youssef', '@youssef:matrix.cirkle.app', 'Youssef Adel',   'youssef@cirkle.app', 'Indie filmmaker.',                                'EG', 'Cairo',      'ar', 1, 'over_18'),
  (6, 'mei',     '@mei:matrix.cirkle.cn',      'Mei Lin',        'mei@cirkle.app',     '上海的产品经理。',                                  'CN', 'Shanghai',   'zh', 1, 'real_name'),
  (7, 'klaus',   '@klaus:matrix.cirkle.eu',    'Klaus Becker',   'klaus@cirkle.app',   'Berliner. Rust + Matrix contributor.',           'DE', 'Berlin',     'de', 1, 'over_18'),
  (8, 'sara',    '@sara:matrix.cirkle.app',    'Sara Al-Otaibi', 'sara@cirkle.app',    'UX designer in Riyadh.',                          'SA', 'Riyadh',     'ar', 1, 'over_18'),
  (9, 'jane',    '@jane:matrix.cirkle.app',    'Jane Doe',       'jane@cirkle.app',    'Open-source maintainer.',                         'US', 'Chicago',    'en', 0, NULL),
  (10,'cirkle_official', '@official:matrix.cirkle.app', 'Cirkle Official', 'team@cirkle.app', 'The Cirkle covenant in action.',          'EG', 'Cairo',      'ar', 1, 'organization');

-- Wallets
INSERT OR IGNORE INTO wallets (user_id, currency, balance) VALUES
  (1, 'EGP', 4250.50),
  (2, 'EGP', 1820.00),
  (3, 'EGP',  980.75),
  (4, 'EGP',  300.00),
  (5, 'EGP', 2100.00),
  (6, 'CNY',  650.00),
  (7, 'EUR',  420.00),
  (8, 'SAR',  890.00),
  (9, 'USD',  120.00);

-- Pro profiles
INSERT OR IGNORE INTO pro_profiles (user_id, headline, current_role, company, skills, experience, open_to_work) VALUES
  (1, 'Civil Engineer | Structural Design',          'Senior Engineer',   'Cairo Infra Co.', '["AutoCAD","Revit","Project Mgmt"]', '[{"role":"Senior Engineer","years":6}]', 0),
  (3, 'Backend & Self-Hosting Specialist',           'Staff Engineer',    'Jozour',          '["Rust","Matrix","Postgres","Docker"]', '[{"role":"Staff Engineer","years":4}]', 0),
  (4, 'Medical Student | Public Health',             'MS-3 Student',      'Cairo University','["Clinical","Arabic-English Translation"]', '[]', 1),
  (7, 'Distributed Systems Engineer',                'Principal Eng.',    'Federated Labs',  '["Rust","Synapse","Kubernetes"]', '[{"role":"Principal","years":3}]', 0),
  (8, 'Senior UX Designer',                          'Lead Designer',     'Tabby',           '["Figma","Design Systems","Arabic typography"]', '[]', 1);

-- Pro jobs
INSERT INTO pro_jobs (title, company, city, country, remote, description, apply_url, posted_by) VALUES
  ('Matrix Homeserver Engineer',     'Cirkle Foundation', 'Remote',     'EG', 1, 'Help us scale federated Synapse to 10M users.', 'https://cirkle.app/jobs/1', 10),
  ('Senior Arabic UX Designer',      'Tabby',             'Riyadh',     'SA', 0, 'Design fintech flows for Arabic-first users.',  'https://cirkle.app/jobs/2', 8),
  ('Junior Frontend (Flutter)',      'Jozour',            'Cairo',      'EG', 0, 'Build Wasl features. Remote-friendly.',         'https://cirkle.app/jobs/3', 3),
  ('PeerTube Federation Maintainer', 'Federated Labs',    'Berlin',     'DE', 1, 'Operate the EU public PeerTube instance.',      'https://cirkle.app/jobs/4', 7),
  ('Mobile Engineer (Rust + Dart)',  'Cirkle Foundation', 'Cairo',      'EG', 1, 'Work on the local mesh networking layer.',      'https://cirkle.app/jobs/5', 10);

-- Rooms (Wasl)
INSERT OR IGNORE INTO rooms (id, name, topic, room_type, created_by) VALUES
  ('!direct-ahmed-layla:matrix.cirkle.app', 'Ahmed & Layla',    'Direct',                            'direct',    1),
  ('!group-cairo-coffee:matrix.cirkle.app', 'Cairo Coffee Club','Where to find the best ahwa',      'group',     2),
  ('!group-jozour-eng:matrix.cirkle.app',   'Jozour Engineering','Internal: Backend team',           'workspace', 3),
  ('!broadcast-cairo-wx:matrix.cirkle.app', 'Cairo Weather',    'Daily updates from @cairo_weather','broadcast', 10),
  ('!group-bookcirkle:matrix.cirkle.app',   'Cairo Book Cirkle','Reading Naguib Mahfouz this month','group',     2);

INSERT OR IGNORE INTO room_members (room_id, user_id, role) VALUES
  ('!direct-ahmed-layla:matrix.cirkle.app', 1, 'member'),
  ('!direct-ahmed-layla:matrix.cirkle.app', 2, 'member'),
  ('!group-cairo-coffee:matrix.cirkle.app', 1, 'member'),
  ('!group-cairo-coffee:matrix.cirkle.app', 2, 'owner'),
  ('!group-cairo-coffee:matrix.cirkle.app', 4, 'member'),
  ('!group-jozour-eng:matrix.cirkle.app',   3, 'owner'),
  ('!group-jozour-eng:matrix.cirkle.app',   7, 'admin'),
  ('!group-bookcirkle:matrix.cirkle.app',   2, 'owner'),
  ('!group-bookcirkle:matrix.cirkle.app',   4, 'member'),
  ('!group-bookcirkle:matrix.cirkle.app',   5, 'member');

-- Messages
INSERT OR IGNORE INTO messages (id, room_id, sender_id, body, status) VALUES
  ('m1', '!direct-ahmed-layla:matrix.cirkle.app', 2, 'Did you try the new koshari place in Abdeen?', 3),
  ('m2', '!direct-ahmed-layla:matrix.cirkle.app', 1, 'Not yet, going on Friday inshallah 🙂',          3),
  ('m3', '!direct-ahmed-layla:matrix.cirkle.app', 2, 'Save me a portion!',                            3),
  ('m4', '!group-cairo-coffee:matrix.cirkle.app', 4, 'Sufi cafe in Zamalek tonight at 9pm.',          3),
  ('m5', '!group-cairo-coffee:matrix.cirkle.app', 1, 'Count me in.',                                   3),
  ('m6', '!group-jozour-eng:matrix.cirkle.app',   3, 'Synapse upgrade scheduled tomorrow 2am.',       3),
  ('m7', '!group-jozour-eng:matrix.cirkle.app',   7, 'Acknowledged. CI is green.',                    3),
  ('m8', '!broadcast-cairo-wx:matrix.cirkle.app', 10,'Cairo today: 27°C, dust storm warning until 4pm.', 3),
  ('m9', '!group-bookcirkle:matrix.cirkle.app',   2, 'Chapter 4 of Midaq Alley by Sunday 📖',          3),
  ('m10','!group-bookcirkle:matrix.cirkle.app',   5, 'Reading on the metro to Maadi right now.',      3);

-- Videos (Mashahd)
INSERT INTO videos (uploader_id, title, description, cid, thumbnail_cid, duration_sec, views, likes, city, language, nsfw) VALUES
  (5, 'Walking Khan El-Khalili at Sunset',      'A 4K stroll through Cairo''s oldest bazaar.',         'QmXoVid1', 'QmXoT1', 540, 12450, 980, 'Cairo',     'ar', 0),
  (2, 'Sufi Whirling Performance in Wikalat',   'Traditional ceremony, recorded live.',                 'QmXoVid2', 'QmXoT2', 720,  8200, 1240,'Cairo',     'ar', 0),
  (3, 'Self-hosting Matrix on a 5$ VPS',        'Step-by-step tutorial using Cirkle''s installer.',     'QmXoVid3', 'QmXoT3', 1200, 5100, 432, 'Alexandria','en', 0),
  (5, 'Pyramids by Drone at Dawn',              'Permit-cleared aerial shots.',                         'QmXoVid4', 'QmXoT4', 300, 32100, 2890,'Giza',      'ar', 0),
  (6, '上海外滩夜景 Shanghai Bund at Night',     'Walking timelapse along the Bund.',                    'QmXoVid5', 'QmXoT5', 480, 21300, 1820,'Shanghai',  'zh', 0),
  (7, 'Why ActivityPub matters',                'Berlin tech meetup talk.',                             'QmXoVid6', 'QmXoT6', 1860, 3400, 290, 'Berlin',    'en', 0),
  (1, 'How I built a bookshelf from scrap',     'DIY weekend project.',                                 'QmXoVid7', 'QmXoT7', 360,  980,  120,'Cairo',     'ar', 0),
  (4, 'Med-school study routine vlog',          'A typical day at Kasr Al-Aini hospital.',              'QmXoVid8', 'QmXoT8', 600, 4500,  410,'Cairo',     'ar', 0);

-- Photos (Lamahat)
INSERT INTO photos (uploader_id, caption, cid, city, likes, comments_count) VALUES
  (2, 'Morning light, Al-Azhar Park.',                 'QmPhoto1', 'Cairo',    340,  22),
  (2, 'Citadel silhouette.',                           'QmPhoto2', 'Cairo',    512,  31),
  (5, 'Crew lunch on set.',                            'QmPhoto3', 'Cairo',    180,  12),
  (4, 'Anatomy lab cadaver-day reflections.',          'QmPhoto4', 'Cairo',     90,   8),
  (1, 'New cantilever I designed (proud).',            'QmPhoto5', 'Cairo',    220,  18),
  (8, 'Riyadh Boulevard at midnight.',                 'QmPhoto6', 'Riyadh',   430,  27),
  (6, 'Shanghai jasmine tea house.',                   'QmPhoto7', 'Shanghai', 380,  19),
  (7, 'Berlin S-Bahn at dusk.',                        'QmPhoto8', 'Berlin',   200,  11);

-- Midan (Square) posts
INSERT INTO posts (author_id, content, hashtags, city, language, anonymous, reposts, likes, replies_count) VALUES
  (1, 'New metro line 4 makes my commute 25 min instead of 70. Big deal. #cairo #transport',                  '#cairo #transport',   'Cairo',     'ar', 0,  45, 320, 12),
  (2, 'Just had the best koshari in Abdeen. The secret is the dakka. #كشري #cairo',                          '#كشري #cairo',         'Cairo',     'ar', 0, 120, 890, 38),
  (3, 'Federation > centralization. We don''t need their cloud. We have peers. #selfhost',                     '#selfhost #matrix',   'Alexandria','en', 0,  78, 540, 22),
  (4, 'PSA: Free vaccination at Kasr Al-Aini all week, no appointment needed.',                                '#health #cairo',      'Cairo',     'ar', 0, 220,1100, 65),
  (5, 'Anyone interested in a short-film collective? DM me.',                                                   '#film #cairo',        'Cairo',     'ar', 0,  12,  98, 24),
  (10,'Today the Cirkle network reached 1 million federated accounts. Thank you to every node operator. 🌍',   '#milestone',          NULL,        'en', 0, 850,5400, 142),
  (6, '今天上海的天空特别蓝。 #上海 #blue',                                                                       '#上海',                'Shanghai',  'zh', 0,  30, 240, 9),
  (7, 'GDPR right-to-be-forgotten worked flawlessly in the EU data plane. Proud to be a tester.',              '#gdpr #privacy',      'Berlin',    'en', 0,  44, 310, 18),
  (2, 'Quiet morning thoughts, shared anonymously.',                                                           NULL,                  NULL,        'en', 1,  0,   3,   0);

-- Cirkles (groups)
INSERT INTO cirkles (slug, name, description, visibility, category, city, member_count, owner_id) VALUES
  ('cairo-book-cirkle', 'Cairo Book Cirkle',   'Monthly Arabic literature meetups.',           'public',  'books',   'Cairo',     1240, 2),
  ('cairo-coffee',      'Cairo Coffee Club',   'Sharing the best ahwa spots.',                 'public',  'food',    'Cairo',     3200, 2),
  ('jozour-eng',        'Jozour Engineering',  'Private workspace for the backend team.',      'private', 'tech',    NULL,         24,  3),
  ('arabic-typography', 'Arabic Typography',   'Designers obsessed with Cairo font.',          'public',  'design',  NULL,         580, 8),
  ('berlin-self-host',  'Berlin Self-Hosters', 'Run your own Matrix homeserver.',              'public',  'tech',    'Berlin',     310, 7),
  ('shanghai-runners',  'Shanghai Runners',    '6am Bund run, every Saturday.',                'public',  'sport',   'Shanghai',   145, 6);

-- Channels
INSERT INTO channels (slug, name, description, channel_type, category, verified, subscriber_count, owner_id, country) VALUES
  ('moh-egypt',       'Ministry of Health Egypt',  'Official health updates.',           'official',    'gov',       1, 245000, 10, 'EG'),
  ('cairo-traffic',   'Cairo Traffic Authority',   'Live road closures + advisories.',   'official',    'gov',       1, 180000, 10, 'EG'),
  ('cairo-uni',       'Cairo University',          'Academic announcements.',            'educational', 'edu',       1,  68000, 10, 'EG'),
  ('layla-photo',     'Layla Photography',         'Behind every shot.',                 'creator',     'art',       1,  32000,  2, 'EG'),
  ('youssef-films',   'Youssef Adel Films',        'Indie short-film releases.',         'creator',     'film',      1,  21000,  5, 'EG'),
  ('omar-dev',        'Omar Codes',                'Tutorials on self-hosting.',         'creator',     'tech',      1,  18500,  3, 'EG'),
  ('cairo-weather',   'Cairo Weather',             'Daily weather + dust alerts.',       'official',    'service',   1,  52000, 10, 'EG'),
  ('eu-matrix-news',  'Matrix EU News',            'Federation updates for EU users.',   'creator',     'tech',      1,   9800,  7, 'DE');

-- Channel posts
INSERT INTO channel_posts (channel_id, title, body) VALUES
  (1, 'Ramadan health tips',                  'Stay hydrated between Iftar and Suhoor. Avoid heavy fried foods.'),
  (1, 'Free measles boosters all April',      'Walk into any primary clinic with your ID.'),
  (2, 'Salah Salem closure',                  'Inbound from 11pm–4am Apr 18–19 for resurfacing.'),
  (3, 'Spring semester results',              'Available on the student portal April 20.'),
  (4, 'New series: People of Khan El-Khalili','Eight portraits, every Thursday.'),
  (5, 'Short film "Saqia" premieres May 3',   'Free screening at El Sawy Cultural Centre.'),
  (6, 'Tutorial: Deploy Synapse in 5 minutes','New video uploaded to Mashahd.'),
  (7, 'Dust storm advisory',                  'Cairo, Giza, Helwan: visibility under 800m until 4pm.'),
  (8, 'EU federation reaches 500k DAU',       'Berlin, Paris, Madrid leading adoption.');

-- Events
INSERT INTO events (title, description, city, venue, start_time, category, priority, image_cid, interested) VALUES
  ('Cairo Jazz Festival',              'Three nights of fusion jazz.',     'Cairo',    'Cairo Opera House',          datetime('now','+3 days'),  'music',    5, 'QmEv1', 1340),
  ('Dust storm advisory',              'Visibility <800m until 4pm.',      'Cairo',    'Citywide',                   datetime('now','+5 hours'), 'psa',      8, NULL,    0),
  ('Sufi Café Concert',                'Free traditional music night.',    'Cairo',    'El Sawy Cultural Centre',    datetime('now','+1 days'),  'culture',  3, 'QmEv2',  620),
  ('Open-Source Cairo Meetup',         'Lightning talks + pizza.',         'Cairo',    'GrEEK Campus',               datetime('now','+6 days'),  'tech',     3, 'QmEv3',  280),
  ('Riyadh Season Opening Night',      'Fireworks + concerts.',            'Riyadh',   'Boulevard',                  datetime('now','+10 days'), 'culture',  4, 'QmEv4',  4200),
  ('Berlin Matrix Conference',         'Annual federation conference.',    'Berlin',   'bcc Berlin',                 datetime('now','+30 days'), 'tech',     4, 'QmEv5',  890),
  ('Shanghai Bund 6am Run',            'Weekly community run.',            'Shanghai', 'Bund Pier',                  datetime('now','+2 days'),  'sport',    3, 'QmEv6',  240),
  ('Emergency: Heat Advisory',         'Stay indoors 12pm–4pm.',           'Cairo',    'Citywide',                   datetime('now','+1 days'),  'emergency',10, NULL,    0);

-- Travel itineraries
INSERT INTO travel_itineraries (user_id, city, days, interests, plan_json) VALUES
  (1, 'Istanbul', 3, 'history,food,sufi',
   '{"day1":{"morning":"Hagia Sophia + Blue Mosque","lunch":"Karaköy Lokantası","afternoon":"Topkapı Palace","dinner":"Çiya Sofrası"},"day2":{"morning":"Bosphorus ferry to Üsküdar","lunch":"Kanaat Lokantası","afternoon":"Çamlıca Hill","dinner":"Galata seafood"},"day3":{"morning":"Süleymaniye + Grand Bazaar","lunch":"Pandeli","afternoon":"Sufi ceremony at HodjaPasha","dinner":"Asitane Ottoman cuisine"}}'),
  (4, 'Madinah', 2, 'spiritual,family',
   '{"day1":{"morning":"Prophet''s Mosque","lunch":"Al-Baik","afternoon":"Quba Mosque","dinner":"Local mandi"},"day2":{"morning":"Mount Uhud","lunch":"Date market","afternoon":"Qiblatain Mosque","dinner":"Family return"}}');

-- Transactions
INSERT INTO transactions (from_user, to_user, amount, currency, method, status, note) VALUES
  (1, 2, 120.00, 'EGP', 'handle',         'completed', 'Koshari ❤️'),
  (2, 4,  80.00, 'EGP', 'qr',             'completed', 'Coffee'),
  (3, 1, 350.00, 'EGP', 'nfc',            'completed', 'Bookshelf wood'),
  (5, 2, 200.00, 'EGP', 'handle',         'completed', 'Photo licensing'),
  (1,NULL,500.00,'EGP', 'fawry_voucher',  'completed', 'Top-up'),
  (4, 1,  50.00, 'EGP', 'handle',         'completed', 'Lunch'),
  (8, 6, 100.00, 'CNY', 'handle',         'completed', 'WeChat-cross-border test'),
  (7, 3,  25.00, 'EUR', 'handle',         'completed', 'Snap support');

-- Mail
INSERT INTO mail_messages (user_id, folder, from_addr, to_addr, subject, body, read_flag) VALUES
  (1, 'inbox', 'team@cirkle.app',       'ahmed@cirkle.app',  'Welcome to Cirkle Mail',         'Your free @cirkle.app inbox is ready. 5 GB storage included.',                                       1),
  (1, 'inbox', 'noreply@cairo-uni.eg',  'ahmed@cirkle.app',  'Alumni newsletter — April',      'Civil-engineering class of 2017 reunion confirmed for May 5.',                                       0),
  (1, 'inbox', 'layla@cirkle.app',      'ahmed@cirkle.app',  'Saturday photo walk?',           'Bringing the Hasselblad. Meet at 6:30am, Al-Azhar Park gate?',                                        0),
  (2, 'inbox', 'team@cirkle.app',       'layla@cirkle.app',  'Your verified badge',            'Cirkle Verify approved your over-18 attestation.',                                                   1),
  (3, 'inbox', 'sysadmin@jozour.com',   'omar@cirkle.app',   'Synapse upgrade window',         'Maintenance scheduled 2am-4am Friday.',                                                              1),
  (7, 'inbox', 'eu-ops@cirkle.app',     'klaus@cirkle.app',  'EU data-plane SLA report',       'Uptime last 30 days: 99.97%. Storage cost: €0.014 per active user.',                                  1);

-- Governance proposals
INSERT INTO governance_proposals (title, body, proposer_id, status, votes_yes, votes_no) VALUES
  ('Increase ad revenue share to node operators from 70% to 80%',
   'Currently community node operators receive 70% of local ad revenue. Proposal raises it to 80% to encourage more independent nodes.',
   3, 'open',    4820, 612),
  ('Add Persian (Farsi) to the official language matrix',
   'Iranian users currently see English fallbacks. We propose adding Persian (with RTL) as a first-class language in the dynamic naming convention.',
   1, 'passed',  6210, 480),
  ('Hard-code ban on user-targeted advertising in the constitution',
   'Make the no-targeting promise part of the immutable on-chain governance contract.',
   7, 'open',    9100, 220);

-- Ad revenue ledger
INSERT INTO ad_revenue_ledger (month, advertiser, city, amount_usd, allocation) VALUES
  ('2026-04', 'El Sawy Cultural Centre', 'Cairo',    420.00, 'nodes'),
  ('2026-04', 'Etisalat Egypt',          'Cairo',   1200.00, 'nodes'),
  ('2026-04', 'Vodafone Egypt',          'Cairo',    980.00, 'development'),
  ('2026-04', 'Riyadh Season',           'Riyadh',  2100.00, 'nodes'),
  ('2026-04', 'BVG Berlin',              'Berlin',   340.00, 'grants'),
  ('2026-03', 'El Sawy Cultural Centre', 'Cairo',    380.00, 'nodes'),
  ('2026-03', 'Banque du Caire',         'Cairo',    760.00, 'development'),
  ('2026-03', 'Shanghai Metro',          'Shanghai', 540.00, 'nodes');

-- Mini apps
INSERT INTO mini_apps (slug, name, developer, category, description, install_count, verified) VALUES
  ('prayer-times',    'Prayer Times',      'Cirkle Foundation',    'religion',  'Accurate prayer times for any city, offline.',           412000, 1),
  ('quran-reader',    'Quran Reader',      'Open Quran Project',   'religion',  'Full Quran with translations + tajweed audio.',          380000, 1),
  ('cairo-metro',     'Cairo Metro',       'Cairo Transport Co.',  'transport', 'Offline schedules + live alerts.',                       198000, 1),
  ('fawry-pay',       'Fawry Voucher Pay', 'Fawry',                'finance',   'Generate Fawry vouchers without leaving Cirkle.',         95000, 1),
  ('habit-tracker',   'Habit Tracker',     'Indie Dev — Omar',     'lifestyle', '100% on-device habit tracking.',                           7200, 0),
  ('arabic-keyboard', 'Arabic Lite KB',    'Open Source',          'tools',     'Lightweight RTL keyboard with classical script.',         12500, 1),
  ('chess-club',      'Cirkle Chess',      'Community',            'games',     'Play chess over Matrix rooms.',                            4300, 0),
  ('translate-stub',  'Quick Translate',   'Cirkle Foundation',    'tools',     '7-language on-device translation.',                       82000, 1);
