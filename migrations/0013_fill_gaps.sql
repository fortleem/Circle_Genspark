-- 0013 — Fill data gaps: empty tables that make screens appear blank
-- Safe to re-run: INSERT OR IGNORE.

-- Ensure the base rooms referenced below exist (seed.sql owns them, but migrations run before seed.sql in local --local mode).
INSERT OR IGNORE INTO rooms (id, name, topic, room_type, is_encrypted, created_by) VALUES
  ('!direct-ahmed-layla:matrix.circle.app', 'Ahmed & Layla', 'Direct', 'direct', 1, 1),
  ('!group-cairo-coffee:matrix.circle.app', 'Cairo Coffee Club', 'Where to find the best ahwa', 'group', 1, 2),
  ('!group-jozour-eng:matrix.circle.app', 'Jozour Engineering', 'Internal: Backend team', 'workspace', 1, 3),
  ('!group-bookcircle:matrix.circle.app', 'Cairo Book Circle', 'Reading Naguib Mahfouz this month', 'group', 1, 2);

INSERT OR IGNORE INTO room_members (room_id, user_id, role) VALUES
  ('!direct-ahmed-layla:matrix.circle.app', 1, 'member'),
  ('!direct-ahmed-layla:matrix.circle.app', 2, 'member'),
  ('!group-cairo-coffee:matrix.circle.app', 1, 'member'),
  ('!group-cairo-coffee:matrix.circle.app', 2, 'owner'),
  ('!group-cairo-coffee:matrix.circle.app', 4, 'member'),
  ('!group-jozour-eng:matrix.circle.app', 3, 'owner'),
  ('!group-jozour-eng:matrix.circle.app', 7, 'admin'),
  ('!group-bookcircle:matrix.circle.app', 2, 'owner'),
  ('!group-bookcircle:matrix.circle.app', 4, 'member'),
  ('!group-bookcircle:matrix.circle.app', 5, 'member');

-- ───────────────── Self-host nodes ─────────────────
INSERT OR IGNORE INTO self_host_nodes (id, node_kind, domain, operator, region, users_served, uptime_pct) VALUES
  (1, 'matrix', 'cairo-node.circle.community', 'Cairo Tech Collective', 'global', 4200, 99.7),
  (2, 'matrix', 'beirut-sovereign.mesh', 'Lebanese Digital Rights', 'global', 1800, 98.3),
  (3, 'pinning', 'tunis-mesh.circle.tn', 'Tunis Free Internet', 'global', 920, 97.1),
  (4, 'matrix', 'riyadh-enterprise.circle.sa', 'Saudi Open Source Society', 'global', 6100, 99.9),
  (5, 'matrix', 'amman-family.local', 'Khoury Family NAS', 'global', 12, 95.4),
  (6, 'peertube', 'dubai-media-hub.ae', 'Dubai Press Club', 'global', 3400, 99.5),
  (7, 'pinning', 'paris-diaspora.fr', 'Maghreb Diaspora Network', 'eu', 740, 96.8),
  (8, 'matrix', 'istanbul-bridge.tr', 'Bosphorus Dev Guild', 'global', 2100, 98.9),
  (9, 'matrix', 'berlin-privacy.de', 'CCC Berlin Chapter', 'eu', 1500, 99.2),
  (10, 'maps', 'casablanca-hub.ma', 'Casablanca Innovation Lab', 'global', 610, 94.7);

-- ───────────────── Governance proposals ─────────────────
INSERT OR IGNORE INTO governance_proposals (id, title, body, proposer_id, status, votes_yes, votes_no) VALUES
  (1, 'Adopt Quadratic Voting for all major decisions', 'Replace 1-person-1-vote with quadratic voting. Each user gets 100 voice credits per quarter.', 1, 'open', 87, 14),
  (2, 'Mandatory 48h cool-down for content removal appeals', 'Before any moderation action is finalized, the author gets 48 hours to appeal via community jury.', 3, 'open', 124, 31),
  (3, 'Open-source the DRE plane routing logic', 'Make the Dynamic Regional Engine fully auditable on GitHub with an OSS license.', 2, 'passed', 201, 8),
  (4, 'Cap Pro subscription at $3/month for Global South', 'PPP-adjusted pricing for countries with GDP/capita below $10K.', 5, 'open', 156, 42),
  (5, 'Add Amazigh as a first-class language', 'Include Amazigh script and NLLB model pair in the base bundle. 25M+ speakers across North Africa.', 4, 'open', 93, 5),
  (6, 'Federation: require TLS 1.3+ for all node peering', 'Mandate minimum TLS 1.3 for joining the federation. Drop TLS 1.2 by Q4 2026.', 3, 'passed', 178, 12),
  (7, 'Introduce Community Contributor badge tier', 'Recognize non-financial contributions: translations, bug reports, node hosting, moderation.', 1, 'open', 211, 19);

-- ───────────────── Pro jobs ─────────────────
INSERT OR IGNORE INTO pro_jobs (id, title, company, city, country, remote, description, apply_url, posted_by) VALUES
  (1, 'Senior Flutter Developer', 'Circle Foundation', 'Cairo', 'EG', 1, 'Build the next-gen mobile client with E2EE, BLE mesh, ONNX runtime.', 'https://jobs.circle.app/flutter-senior', 1),
  (2, 'DevOps / SRE — Federation', 'Circle Foundation', 'Remote', NULL, 1, 'Operate 200+ federated Matrix+IPFS nodes across 6 DRE planes.', 'https://jobs.circle.app/sre-federation', 1),
  (3, 'AI/ML Engineer — On-device', 'Circle Foundation', 'Riyadh', 'SA', 1, 'Optimize ONNX models for mobile: Whisper, NLLB, DistilBERT.', 'https://jobs.circle.app/ml-ondevice', 4),
  (4, 'UX Designer — Arabic-first', 'TechnoScale MENA', 'Dubai', 'AE', 0, 'Design RTL-first interfaces for 400M Arabic speakers.', 'https://technoscale.ae/jobs/ux', 6),
  (5, 'Community Manager — Maghreb', 'Circle Foundation', 'Tunis', 'TN', 1, 'Grow Circle adoption across Morocco, Tunisia, Algeria, Libya.', 'https://jobs.circle.app/community-maghreb', 3),
  (6, 'Cryptography Engineer', 'Circle Foundation', 'Berlin', 'DE', 1, 'Implement and audit: Shamir backup, BLS verification, E2EE key rotation.', 'https://jobs.circle.app/crypto-eng', 1),
  (7, 'Product Manager — Payments', 'InstaPay Labs', 'Cairo', 'EG', 0, 'Lead Circle Pay integration with InstaPay, Vodafone Cash.', 'https://instapaylabs.eg/pm', 5),
  (8, 'Content Moderator Lead', 'Circle Foundation', 'Remote', NULL, 1, 'Train community jury panelists. Build moderation playbooks for 12+ languages.', 'https://jobs.circle.app/mod-lead', 2);

-- ───────────────── Constellation — extra messages in EXISTING rooms for graph ─────
INSERT OR IGNORE INTO messages (id, room_id, sender_id, body, status, is_encrypted) VALUES
  ('msg-const-01', '!direct-ahmed-layla:matrix.circle.app', 2, 'Hey Yousef, did you see the new governance proposal?', 1, 1),
  ('msg-const-02', '!direct-ahmed-layla:matrix.circle.app', 1, 'Yes! I voted yes on quadratic voting.', 1, 1),
  ('msg-const-03', '!group-cairo-coffee:matrix.circle.app', 3, 'The cairo meetup is confirmed for Friday', 1, 1),
  ('msg-const-04', '!group-cairo-coffee:matrix.circle.app', 4, 'Count me in. Bringing everyone.', 1, 1),
  ('msg-const-05', '!group-cairo-coffee:matrix.circle.app', 5, 'Can we do a virtual option for remote folks?', 1, 1),
  ('msg-const-06', '!direct-ahmed-layla:matrix.circle.app', 2, 'The new theater player is amazing btw', 1, 1),
  ('msg-const-07', '!group-cairo-coffee:matrix.circle.app', 1, 'Absolutely. Setting up a Wasl video room.', 1, 1),
  ('msg-const-08', '!group-cairo-coffee:matrix.circle.app', 6, 'I can drone-shoot the event if you want coverage', 1, 1),
  ('msg-const-09', '!direct-ahmed-layla:matrix.circle.app', 1, 'Tariq offered to drone-shoot! Epic.', 1, 1),
  ('msg-const-10', '!group-jozour-eng:matrix.circle.app', 7, 'I will live-translate to French for the Maghreb audience', 1, 1),
  ('msg-const-11', '!group-jozour-eng:matrix.circle.app', 2, 'Great idea! The Tunis community asked for it.', 1, 1),
  ('msg-const-12', '!group-bookcircle:matrix.circle.app', 3, 'This weeks book: Digital Minimalism by Cal Newport', 1, 1),
  ('msg-const-13', '!group-bookcircle:matrix.circle.app', 5, 'Perfect timing — just finished it yesterday!', 1, 1),
  ('msg-const-14', '!group-bookcircle:matrix.circle.app', 8, 'Can we discuss how it applies to Circle design?', 1, 1);

-- ───────────────── Pro certifications ─────────────────
CREATE TABLE IF NOT EXISTS pro_certifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  expires_at TEXT,
  verified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO pro_certifications (id, user_id, name, issuer, issued_at, verified) VALUES
  (1, 1, 'Cloudflare Workers Certified Developer', 'Cloudflare', '2025-03-15', 1),
  (2, 1, 'Matrix Protocol Contributor', 'Matrix.org Foundation', '2024-11-01', 1),
  (3, 3, 'Arabic NLP Specialist', 'QCRI', '2025-06-01', 1),
  (4, 4, 'Flutter GDE', 'Google', '2025-01-10', 1),
  (5, 6, 'Part 107 Drone Pilot', 'FAA', '2024-08-20', 1);

-- ───────────────── Moderation actions (for AISafety/Jury panels) ─────────────────
INSERT OR IGNORE INTO moderation_actions (id, content_kind, content_id, detector, action, score, reason, appealed, appeal_status) VALUES
  (1, 'post', '5', 'DistilBERT-v3', 'flag', 0.82, 'Potential misinformation — unverified mortality statistics', 1, 'pending'),
  (2, 'comment', 'cmt-v3-01', 'DistilBERT-v3', 'block', 0.91, 'Targeted harassment — directed insult at named individual', 0, NULL),
  (3, 'video', 'vid-007', 'MobileNet-NSFW', 'blur', 0.67, 'Borderline content — suggestive thumbnail; age-gate recommended', 1, 'overturned'),
  (4, 'post', '8', 'DistilBERT-v3', 'warn', 0.55, 'Low-confidence spam signal — repeated commercial links', 0, NULL),
  (5, 'photo', '3', 'MobileNet-NSFW', 'flag', 0.73, 'Artistic nudity — community standards edge case', 1, 'pending');

-- ───────────────── Jury votes ─────────────────
INSERT OR IGNORE INTO jury_votes (id, action_id, juror_id, vote, rationale, reputation_at_vote) VALUES
  (1, 1, 2, 'overturn', 'Statistics from WHO report — verifiable. Not misinformation.', 87),
  (2, 1, 4, 'overturn', 'Source is legitimate. AI false positive.', 92),
  (3, 1, 5, 'uphold', 'Numbers are out of context — misleading even if technically accurate.', 78),
  (4, 3, 2, 'overturn', 'Thumbnail is from art exhibition. Context matters.', 87),
  (5, 3, 3, 'overturn', 'Clearly artistic intent. No minors involved.', 85),
  (6, 3, 4, 'overturn', 'Art context is clear from caption.', 92),
  (7, 3, 5, 'uphold', 'Still inappropriate for default feed without age-gate.', 78),
  (8, 3, 6, 'overturn', 'The gallery is a renowned institution. Override.', 90),
  (9, 5, 3, 'uphold', 'Community standards are clear. Keep flagged.', 85),
  (10, 5, 4, 'uphold', 'Even artistic nudity needs consent tagging.', 92);

-- ───────────────── Jury panels ─────────────────
INSERT OR IGNORE INTO jury_panels (id, juror_id, cases_heard, status) VALUES
  (6, 7, 3, 'active'),
  (7, 8, 5, 'active'),
  (8, 10, 1, 'active');

-- ───────────────── Extra notifications for richer inbox ─────────────────
INSERT OR IGNORE INTO notifications (id, user_id, kind, title, body, link, unread, priority) VALUES
  (9, 1, 'gov', 'New proposal: Quadratic Voting', 'Community proposal #1 is open for voting', '/governance', 1, 2),
  (10, 1, 'verify', 'Badge renewed', 'Your Circle Developer badge was auto-renewed', '/verify', 0, 0),
  (11, 1, 'midan', 'Trending in Cairo', 'Your post about metro line 4 is trending #3', '/midan', 1, 1),
  (12, 1, 'mesh', 'New mesh peer', 'tariq_dxb joined your local mesh via BLE', '/mesh', 1, 1);

-- ───────────────── Additional mail ─────────────────
INSERT OR IGNORE INTO mail_messages (id, user_id, from_addr, to_addr, subject, body, folder, read_flag) VALUES
  (6, 1, 'governance@circle.app', 'yousef@circle.app', 'Weekly Governance Digest', 'This week: 3 new proposals, 2 passed. Your voting power: 94 credits remaining.', 'inbox', 0),
  (7, 1, 'security@circle.app', 'yousef@circle.app', 'Monthly Security Report', 'Zero breaches. 14 failed login attempts blocked. E2EE key rotation completed.', 'inbox', 1),
  (8, 1, 'yousef@circle.app', 'layla@circle.app', 'RE: Cairo meetup logistics', 'I booked the co-working space. Friday 6pm. Bringing projector for the demo.', 'sent', 1);

-- ───────────────── More photos for Lamahat ─────────────────
INSERT OR IGNORE INTO photos (id, uploader_id, caption, city, cid, likes) VALUES
  (9, 6, 'Dubai Marina at golden hour — drone shot at 120m', 'Dubai', 'ipfs://QmDubaiMarina', 342),
  (10, 3, 'Old medina doors — Tunis has the most beautiful blues', 'Tunis', 'ipfs://QmTunisDoors', 198),
  (11, 4, 'Riyadh Boulevard after the rain — rare moment', 'Riyadh', 'ipfs://QmRiyadhRain', 267),
  (12, 7, 'Amman citadel sunset — Temple of Hercules silhouette', 'Amman', 'ipfs://QmAmmanCitadel', 184);

-- ───────────────── More posts for Midan ─────────────────
INSERT OR IGNORE INTO posts (id, author_id, content, hashtags, city, anonymous) VALUES
  (10, 6, 'Just captured the most insane sunset over Dubai Frame. Drone footage dropping tomorrow. #dubai #drone #photography', '#dubai #drone #photography', 'Dubai', 0),
  (11, 3, 'Tunis medina restoration funded! 200 artisan workshops getting renovated. #tunis #heritage', '#tunis #heritage', 'Tunis', 0),
  (12, 7, 'Amman new public transport app is actually good? Circle Pay integration when? #amman #transit', '#amman #transit', 'Amman', 0),
  (13, 4, 'AlUla trip was life-changing. Hegra tombs at dawn, stars at night. #alula #travel', '#alula #travel', 'Riyadh', 0),
  (14, 2, 'Hot take: On-device AI is already better than cloud alternatives for Arabic. #ai #arabic', '#ai #arabic', 'Beirut', 0);

-- ───────────────── More videos for Mashahd ─────────────────
INSERT OR IGNORE INTO videos (id, title, description, uploader_id, thumbnail_cid, cid, views, likes, duration_sec) VALUES
  (100, 'Dubai Frame Sunset — 4K Drone Cinematic', 'Golden hour capture at 120m altitude.', 6, 'ipfs://QmThumbDubaiFrame', 'ipfs://QmVidDubaiFrame', 45200, 3100, 480),
  (101, 'How Circle E2EE Actually Works (Explainer)', 'Deep dive into X25519 + Olm protocol.', 1, 'ipfs://QmThumbE2EE', 'ipfs://QmVidE2EE', 28700, 4200, 1200),
  (102, 'Tunis Medina Walking Tour — Hidden Gems', '90 minutes through the UNESCO site.', 3, 'ipfs://QmThumbTunisTour', 'ipfs://QmVidTunisTour', 19800, 1800, 5400),
  (103, 'Building a Self-Hosted Circle Node (Tutorial)', 'From docker-compose to federation in 15 minutes.', 1, 'ipfs://QmThumbSelfHost', 'ipfs://QmVidSelfHost', 12400, 2100, 900);
