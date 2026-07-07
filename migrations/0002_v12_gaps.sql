-- ============================================================================
-- Cirkle v12 gap-filling migration
-- New tables for blueprint sections §15, §17, §18, §23, §27, §28, §32, §33, §34
-- ============================================================================

-- §15 Local Mesh Offline Network — peer discovery and SOS broadcasts
CREATE TABLE IF NOT EXISTS mesh_peers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  peer_id       TEXT UNIQUE NOT NULL,         -- libp2p peer id
  user_id       INTEGER,                       -- our user id if known
  display_name  TEXT NOT NULL,
  transport     TEXT NOT NULL,                 -- 'ble' | 'wifi-direct' | 'libp2p' | 'lora'
  distance_m    INTEGER,                       -- approximate distance in metres
  rssi_dbm      INTEGER,                       -- signal strength
  last_seen     DATETIME DEFAULT CURRENT_TIMESTAMP,
  city          TEXT,
  is_relaying   INTEGER DEFAULT 0,             -- 1 if this peer is currently relaying for us
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_mesh_peers_transport ON mesh_peers(transport);
CREATE INDEX IF NOT EXISTS idx_mesh_peers_city ON mesh_peers(city);

CREATE TABLE IF NOT EXISTS sos_alerts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  message       TEXT,
  severity      TEXT DEFAULT 'sos',           -- 'sos' | 'medical' | 'fire' | 'panic'
  city          TEXT,
  lat           REAL,
  lng           REAL,
  peers_reached INTEGER DEFAULT 0,
  resolved      INTEGER DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- §17 AI Safety & Moderation — moderation actions and appeals
CREATE TABLE IF NOT EXISTS moderation_actions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  content_kind  TEXT NOT NULL,                -- 'post' | 'video' | 'photo' | 'message' | 'channel_post'
  content_id    TEXT NOT NULL,                -- string id of the content
  detector      TEXT NOT NULL,                -- 'nsfw_onnx' | 'toxic_bert' | 'koala_violence' | 'human_report' | 'jury'
  action        TEXT NOT NULL,                -- 'blur' | 'block' | 'flag' | 'remove' | 'warn'
  score         REAL,                          -- model confidence 0..1
  age_group     TEXT,                          -- 'under16' | 'under18' | 'adult'
  reason        TEXT,
  appealed      INTEGER DEFAULT 0,
  appeal_status TEXT,                          -- 'pending' | 'overturned' | 'upheld'
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_mod_kind ON moderation_actions(content_kind);

-- §18 Self-Learning AI Core — on-device training stats + federated rounds
CREATE TABLE IF NOT EXISTS ai_training_stats (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  model_name    TEXT NOT NULL,                -- 'distilgpt2' | 'matrix_factor' | 'smolln2' | 'gemma_2b'
  samples_local INTEGER DEFAULT 0,            -- examples used in last training round
  rounds_done   INTEGER DEFAULT 0,
  last_loss     REAL,                          -- last training loss
  battery_pct   INTEGER,                       -- battery level when training ran
  charging      INTEGER DEFAULT 0,
  fed_opt_in    INTEGER DEFAULT 0,             -- 1 if user opted into federated learning
  epsilon       REAL DEFAULT 1.0,              -- differential privacy ε
  delta         REAL DEFAULT 1e-5,             -- differential privacy δ
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS federated_rounds (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  round_no        INTEGER NOT NULL,
  model_name      TEXT NOT NULL,
  participants    INTEGER DEFAULT 0,
  aggregator_node TEXT,                        -- community node performing secure aggregation
  noise_added     REAL,                         -- Gaussian σ added for DP
  finished_at     DATETIME,
  notes           TEXT
);

-- §23 Maps — offline region packs
CREATE TABLE IF NOT EXISTS map_regions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  region_name  TEXT NOT NULL,                  -- 'Cairo Metro Area'
  country      TEXT,
  size_mb      INTEGER,
  tile_cid     TEXT,                            -- IPFS CID of mbtiles file
  osrm_cid     TEXT,                            -- IPFS CID of OSRM extract
  nominatim_cid TEXT,                           -- IPFS CID of geocoding DB
  downloaded   INTEGER DEFAULT 0,
  pinned_by    INTEGER DEFAULT 0,               -- count of community nodes pinning
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- §27 Backup & Recovery
CREATE TABLE IF NOT EXISTS backups (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  method       TEXT NOT NULL,                  -- 'local_file' | 'ipfs' | 'trusted_cirkle' | 'matrix_keys'
  size_mb      REAL,
  cid          TEXT,                            -- IPFS CID if applicable
  shards_total INTEGER,                         -- N for Shamir
  shards_threshold INTEGER,                     -- M for Shamir
  encrypted    INTEGER DEFAULT 1,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- §28 Privacy & Consent — per-app, per-resource consent registry
CREATE TABLE IF NOT EXISTS privacy_consent (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL,
  scope        TEXT NOT NULL,                  -- 'camera'|'mic'|'location'|'contacts'|'notifications'|'ipfs_pin'|'read_receipts'|'typing'|'presence'
  granted_to   TEXT NOT NULL,                  -- 'app:uber-mini'|'contact:@ali'|'system'
  decision     TEXT NOT NULL,                  -- 'allow_once'|'allow_while_using'|'always_allow'|'deny'
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- §32 AI Model Catalogue — exposed to UI for installation
CREATE TABLE IF NOT EXISTS ai_models (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  task            TEXT NOT NULL,                -- 'text-gen' | 'nsfw-detect' | 'toxic-detect' | 'translate' | 'asr' | 'tts' | 'ocr' | 'recsys' | 'embedding'
  size_mb         INTEGER NOT NULL,
  format          TEXT DEFAULT 'onnx-int8',
  license         TEXT,                          -- 'Apache 2.0' | 'CC-BY' | 'MIT'
  source          TEXT,                          -- 'Hugging Face' | 'ModelScope' | 'community'
  description     TEXT,
  required        INTEGER DEFAULT 0,             -- 1 if ships with app
  on_device       INTEGER DEFAULT 1,
  category        TEXT                           -- 'core' | 'translation' | 'moderation' | 'creative' | 'assistant'
);

-- §33 Self-Hosting — community nodes index
CREATE TABLE IF NOT EXISTS self_host_nodes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  node_kind       TEXT NOT NULL,                -- 'matrix' | 'peertube' | 'mailcow' | 'maps' | 'pinning' | 'mini-app-store'
  domain          TEXT NOT NULL,
  operator        TEXT,                          -- nickname or org
  region          TEXT,                          -- 'global' | 'china' | 'eu' | 'russia' | 'iran' | 'vietnam'
  users_served    INTEGER DEFAULT 0,
  uptime_pct      REAL DEFAULT 99.0,
  monthly_cost_usd REAL DEFAULT 0,
  setup_script    TEXT,                          -- pointer to one-line installer
  added_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- §34 Roadmap — phased delivery plan visible to users
CREATE TABLE IF NOT EXISTS roadmap_phases (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  phase_no    INTEGER NOT NULL,
  title       TEXT NOT NULL,
  months      INTEGER NOT NULL,
  status      TEXT DEFAULT 'planned',           -- 'done' | 'in-progress' | 'planned'
  deliverables TEXT                              -- JSON-encoded array
);
