-- Circle v12 — supplemental seed for gap-section tables.
-- Run after 0001 + 0002 migrations + seed.sql.

-- ── §15 Local Mesh peers (around Cairo Metro) ─────────────────────────────
INSERT INTO mesh_peers (peer_id, user_id, display_name, transport, distance_m, rssi_dbm, city, is_relaying) VALUES
  ('12D3KooW...A1', 2, 'Omar Hassan',         'ble',         15, -62, 'Cairo', 1),
  ('12D3KooW...B2', 3, 'Layla Mahmoud',       'wifi-direct', 22, -55, 'Cairo', 0),
  ('12D3KooW...C3', NULL, 'mawazib_F8E2 (anon)', 'ble',     38, -71, 'Cairo', 1),
  ('12D3KooW...D4', 4, 'Sara El-Sayed',       'libp2p',     85, -78, 'Cairo', 0),
  ('12D3KooW...E5', NULL, 'Metro Relay #14',  'ble',         60, -68, 'Cairo', 1),
  ('12D3KooW...F6', 5, 'Ahmed Fawzy',         'wifi-direct', 12, -50, 'Cairo', 0),
  ('12D3KooW...G7', NULL, 'unidentified peer','lora',      450, -89, 'Cairo', 1),
  ('12D3KooW...H8', 6, 'Marwa Said',          'ble',         28, -65, 'Cairo', 0);

INSERT INTO sos_alerts (user_id, message, severity, city, peers_reached, resolved) VALUES
  (3, 'Wallet lost — need help finding metro exit (demo)',  'sos',     'Cairo', 12, 1),
  (5, 'Medical assistance requested near Sufi Café',         'medical', 'Cairo', 6,  1),
  (2, 'Fire alarm at Sadat station — verify with locals',    'fire',    'Cairo', 24, 0);

-- ── §17 Moderation log (recent automated + appeal decisions) ──────────────
INSERT INTO moderation_actions (content_kind, content_id, detector, action, score, age_group, reason, appealed, appeal_status) VALUES
  ('photo',   'photo-12', 'nsfw_onnx',      'blur',  0.84, 'adult',   'NSFW probability above 0.7 threshold', 0, NULL),
  ('post',    'post-7',   'toxic_bert',     'flag',  0.71, NULL,      'High toxicity score on public post',   1, 'pending'),
  ('video',   'video-3',  'koala_violence', 'warn',  0.55, NULL,      'Mild violence detected — viewer warning shown', 0, NULL),
  ('photo',   'photo-5',  'nsfw_onnx',      'block', 0.93, 'under18', 'Under-18 NSFW block (no unblur)',      1, 'upheld'),
  ('post',    'post-12',  'human_report',   'remove',NULL, NULL,      'Reported by 14 users; jury voted remove', 0, NULL),
  ('message', 'msg-99',   'toxic_bert',     'warn',  0.64, NULL,      'Public room toxicity warning',         0, NULL),
  ('video',   'video-8',  'jury',           'remove',NULL, NULL,      'Community jury 3/3 voted remove',      0, NULL);

-- ── §18 AI training stats ─────────────────────────────────────────────────
INSERT INTO ai_training_stats (user_id, model_name, samples_local, rounds_done, last_loss, battery_pct, charging, fed_opt_in, epsilon, delta) VALUES
  (1, 'matrix_factor', 1842, 23, 0.082, 87, 1, 1, 1.0, 1e-5),
  (1, 'distilgpt2',     412, 14, 0.314, 87, 1, 1, 1.0, 1e-5),
  (1, 'smolln2-360m',   180,  6, 0.487, 87, 1, 0, 1.0, 1e-5),
  (2, 'matrix_factor', 2105, 31, 0.071, 92, 1, 1, 1.0, 1e-5),
  (3, 'matrix_factor',  920, 11, 0.124, 64, 0, 0, 1.0, 1e-5);

INSERT INTO federated_rounds (round_no, model_name, participants, aggregator_node, noise_added, finished_at, notes) VALUES
  (1, 'matrix_factor', 1240, 'aggregator.eu.circle.app',   0.012, '2025-04-08 03:14:00', 'First federated round on EU plane'),
  (2, 'matrix_factor', 1683, 'aggregator.eu.circle.app',   0.011, '2025-04-15 03:22:00', 'Loss dropped 12% over round 1'),
  (3, 'distilgpt2',     487, 'aggregator.global.circle.app',0.018,'2025-04-22 03:09:00', 'Smart-reply quality improved'),
  (4, 'matrix_factor', 2104, 'aggregator.eu.circle.app',   0.010, '2025-04-29 03:18:00', 'EU + ME participants combined'),
  (5, 'matrix_factor', 2410, 'aggregator.global.circle.app',0.009,'2025-05-06 03:24:00', 'Cross-plane federation (anon)');

-- ── §23 Maps — offline region packs ───────────────────────────────────────
INSERT INTO map_regions (region_name, country, size_mb, tile_cid, osrm_cid, nominatim_cid, downloaded, pinned_by) VALUES
  ('Cairo Metro Area',     'EG', 520, 'QmCairoTile...',     'QmCairoOSRM...', 'QmCairoGeo...', 1, 14),
  ('Alexandria',           'EG', 180, 'QmAlexTile...',      'QmAlexOSRM...',  'QmAlexGeo...',  0, 8),
  ('Shanghai',             'CN', 1240,'QmShanghaiTile...',  'QmShanghaiOSRM...','QmShanghaiGeo...', 0, 22),
  ('Berlin',               'DE', 410, 'QmBerlinTile...',    'QmBerlinOSRM...','QmBerlinGeo...',1, 18),
  ('Paris',                'FR', 480, 'QmParisTile...',     'QmParisOSRM...', 'QmParisGeo...', 0, 16),
  ('Greater Riyadh',       'SA', 360, 'QmRiyadhTile...',    'QmRiyadhOSRM...','QmRiyadhGeo...',0, 9),
  ('Egypt (country)',      'EG', 2300,'QmEgyptTile...',     'QmEgyptOSRM...', 'QmEgyptGeo...', 0, 31),
  ('Hanoi',                'VN', 220, 'QmHanoiTile...',     'QmHanoiOSRM...', 'QmHanoiGeo...', 0, 5);

-- ── §27 Backups ────────────────────────────────────────────────────────────
INSERT INTO backups (user_id, method, size_mb, cid, shards_total, shards_threshold, encrypted) VALUES
  (1, 'matrix_keys',     0.02,  NULL,            NULL, NULL, 1),
  (1, 'ipfs',            12.4,  'QmAhmedBak...', NULL, NULL, 1),
  (1, 'trusted_circle',  12.4,  'QmAhmedBak...', 5,    3,    1),
  (2, 'local_file',      8.7,   NULL,            NULL, NULL, 1),
  (3, 'matrix_keys',     0.02,  NULL,            NULL, NULL, 1),
  (4, 'ipfs',            18.3,  'QmSaraBak...',  NULL, NULL, 1);

-- ── §28 Privacy consent registry (sample) ─────────────────────────────────
INSERT INTO privacy_consent (user_id, scope, granted_to, decision) VALUES
  (1, 'camera',         'app:uber-mini',       'allow_while_using'),
  (1, 'location',       'app:uber-mini',       'allow_while_using'),
  (1, 'location',       'app:didi-mini',       'deny'),
  (1, 'mic',            'system',              'allow_once'),
  (1, 'contacts',       'system',              'deny'),
  (1, 'notifications',  'system',              'always_allow'),
  (1, 'read_receipts',  'contact:@ali',        'allow_while_using'),
  (1, 'typing',         'contact:@ali',        'deny'),
  (1, 'presence',       'system',              'deny'),
  (2, 'camera',         'app:meituan-mini',    'allow_while_using');

-- ── §32 AI Model Catalogue ────────────────────────────────────────────────
INSERT INTO ai_models (slug, name, task, size_mb, format, license, source, description, required, on_device, category) VALUES
  ('nllb-200-distilled-600m', 'NLLB-200 Distilled 600M',         'translate',     1500, 'onnx-int8',  'Apache 2.0',     'Hugging Face', 'Translation across 200 languages — Egyptian Arabic to Yoruba to Javanese.',         0, 1, 'translation'),
  ('whisper-tiny',            'Whisper Tiny',                    'asr',           150,  'gguf',       'MIT',            'OpenAI',       'On-device speech recognition, 100+ languages.',                                       0, 1, 'translation'),
  ('whisper-base',            'Whisper Base',                    'asr',           300,  'gguf',       'MIT',            'OpenAI',       'Higher-accuracy speech recognition; runs when device idle.',                          0, 1, 'translation'),
  ('piper-en-us-lessac',      'Piper TTS · Lessac',              'tts',           28,   'onnx',       'MIT',            'Rhasspy',      'Default neutral English voice for text-to-speech.',                                   1, 1, 'translation'),
  ('piper-ar-layla',          'Piper TTS · Layla (Arabic)',      'tts',           42,   'onnx',       'MIT',            'Rhasspy',      'Arabic voice pack for TTS.',                                                          0, 1, 'translation'),
  ('falconsai-nsfw',          'Falconsai NSFW Detector',         'nsfw-detect',   45,   'onnx-int8', 'CC-BY-4.0',      'Hugging Face', 'On-device NSFW classifier (image). Runs before any upload leaves the device.',         1, 1, 'moderation'),
  ('unitary-toxic-bert',      'Unitary Toxic-BERT',              'toxic-detect',  90,   'onnx-int8', 'Apache 2.0',     'Hugging Face', 'Comment/text toxicity classifier.',                                                   0, 1, 'moderation'),
  ('koalaai-moderation',      'KoalaAI Moderation',              'toxic-detect',  85,   'onnx-int8', 'Apache 2.0',     'Hugging Face', 'Multi-category content moderation (violence, harassment, etc).',                       0, 1, 'moderation'),
  ('distilgpt2',              'DistilGPT-2',                     'text-gen',      300,  'onnx-int8', 'Apache 2.0',     'Hugging Face', 'Smart reply suggestions in Wasl; fine-tuned locally on your own message history.',     0, 1, 'assistant'),
  ('smolln2-360m',            'SmolLM2 360M',                    'text-gen',      420,  'gguf',       'Apache 2.0',     'Hugging Face', 'Compact on-device assistant for summaries and Q&A.',                                  0, 1, 'assistant'),
  ('gemma-2-2b',              'Gemma 2 · 2B',                    'text-gen',      1700, 'gguf-q4',    'Gemma TOS',      'Google',       'Higher-capability personal assistant when device has the RAM.',                       0, 1, 'assistant'),
  ('paddleocr-mobile',        'PaddleOCR Mobile',                'ocr',           28,   'onnx-int8', 'Apache 2.0',     'PaddlePaddle', 'OCR for menus, signs, receipts — feeds the translation pipeline.',                    0, 1, 'translation'),
  ('matrix-factor-recsys',    'Matrix Factorisation (custom)',   'recsys',        12,   'onnx-int8', 'Apache 2.0',     'community',    'Personal recommendation model trained on YOUR device only.',                          1, 1, 'core'),
  ('clip-vit-b32',            'CLIP ViT-B/32',                   'embedding',     340,  'onnx-int8', 'MIT',            'OpenAI',       'Image+text embeddings for visual search in Lamahat.',                                  0, 1, 'core');

-- ── §33 Self-hosting nodes (community-operated) ──────────────────────────
INSERT INTO self_host_nodes (node_kind, domain, operator, region, users_served, uptime_pct, monthly_cost_usd, setup_script) VALUES
  ('matrix',         'matrix.circle.app',          'community-collective', 'global',  120000, 99.94,  18, 'https://circle.app/deploy-synapse.sh'),
  ('matrix',         'matrix.circle.cn',           'cn-collective',         'china',    45000, 99.62,  22, 'https://circle.app/deploy-cn-plane.sh'),
  ('matrix',         'matrix.eu.circle.app',       'eu-coop',               'eu',       38000, 99.88,  16, 'https://circle.app/deploy-synapse.sh'),
  ('peertube',       'video.circle.app',           'video-coop',            'global',   65000, 99.71,  35, 'https://circle.app/deploy-peertube.sh'),
  ('peertube',       'video.eu.circle.app',        'eu-video-coop',         'eu',       18000, 99.83,  28, 'https://circle.app/deploy-peertube.sh'),
  ('mailcow',        'mail.circle.app',            'mail-collective',       'global',   84000, 99.96,  24, 'https://circle.app/deploy-mailcow.sh'),
  ('maps',           'maps.circle.app',            'osm-friends',           'global',   54000, 99.65,  14, 'https://circle.app/deploy-maps.sh'),
  ('maps',           'maps.cn.circle.app',         'cn-collective',         'china',    12000, 99.41,  19, 'https://circle.app/deploy-cn-maps.sh'),
  ('pinning',        'pin1.circle.app',            'storage-coop',          'global',   30000, 99.55,  42, 'https://circle.app/deploy-ipfs-pin.sh'),
  ('mini-app-store', 'apps.circle.app',            'apps-collective',       'global',   90000, 99.90,   8, 'https://circle.app/deploy-app-store.sh');

-- ── §34 Roadmap phases ───────────────────────────────────────────────────
INSERT INTO roadmap_phases (phase_no, title, months, status, deliverables) VALUES
  (1, 'Foundation',                 3, 'done',
     '["Flutter shell", "Matrix auth (email/OTP)", "Wasl E2EE chat", "Circle Verify ID scan", "Liveness detection"]'),
  (2, 'Social & Public Content',    3, 'done',
     '["Midan + ActivityPub federation", "Lamahat photos + Stories", "Mashahd video + PeerTube + WebTorrent", "Creator + Official channels", "AI moderation pipeline"]'),
  (3, 'Payments & Work',            3, 'in-progress',
     '["Wasl Maktab workspaces", "Professional Network", "Circle Payments (Fawry/VC/InstaPay)", "Ad serving engine", "Advertiser self-serve"]'),
  (4, 'Super-App Expansion',        4, 'in-progress',
     '["Circle Mail @circle.app", "Circle ID OIDC", "Rihla travel suite", "Zero-cost mapping stack", "Local mesh offline network", "NLLB-200 translation", "Smart Post Router"]'),
  (5, 'Unique & AI Layer',          3, 'planned',
     '["On-device AI personal assistant", "Personal AI Memoir", "Knowledge Circles", "Offline Content Stash", "Family Vault", "Anonymous Help Circles", "Decentralised ticketing", "Self-Learning AI Core"]'),
  (6, 'Mini App Ecosystem',         2, 'planned',
     '["Open Mini App Store", "Developer SDK", "Universal App Hub", "Geo-restricted Mini App logic", "Example apps (Uber/Didi/Meituan stubs)"]'),
  (7, 'Global Compliance & Data Planes', 4, 'planned',
     '["China plane (Alibaba + ICP + CTID + WeChat Pay)", "Russia plane", "Iran plane", "Vietnam plane", "EU plane (GDPR)", "Payment federation"]'),
  (8, 'Launch Egypt',               2, 'planned',
     '["5,000-user Cairo beta", "Arabic UI polish", "Bug fixes", "Marketing campaign", "Play Store + App Store launch"]'),
  (9, 'Global Rollout',             0, 'planned',
     '["Progressive plane activation", "Community node partnerships", "50+ language UI translations", "Global ad program scaling"]');
