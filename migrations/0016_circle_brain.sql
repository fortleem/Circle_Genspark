-- Circle Brain AI — self-learning core (§18) + orchestration audit trail
-- Every Brain interaction is logged; distilled knowledge is stored & recalled.

CREATE TABLE IF NOT EXISTS brain_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,                       -- NULL = anonymous
  intent TEXT NOT NULL DEFAULT 'chat',   -- classified intent
  module TEXT NOT NULL DEFAULT 'brain',  -- routed module
  used_web INTEGER NOT NULL DEFAULT 0,   -- 1 if grounded on live web search
  provider TEXT,                          -- groq | gemini | openai | gemini-search
  question TEXT NOT NULL,
  answer TEXT,
  latency_ms INTEGER,
  feedback INTEGER,                       -- +1 / -1 user rating (nullable)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_brain_interactions_user ON brain_interactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_brain_interactions_intent ON brain_interactions(intent);

CREATE TABLE IF NOT EXISTS brain_knowledge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,                        -- NULL = global knowledge
  topic TEXT NOT NULL DEFAULT 'general',
  fact TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.6,   -- 0..1
  source TEXT NOT NULL DEFAULT 'distilled',-- distilled | manual | web
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_brain_knowledge_user ON brain_knowledge(user_id);
CREATE INDEX IF NOT EXISTS idx_brain_knowledge_topic ON brain_knowledge(topic);

-- Seed global knowledge so the Brain knows its own platform from day one
INSERT INTO brain_knowledge (user_id, topic, fact, confidence, source) VALUES
  (NULL, 'platform', 'Circle (دواير) has 4 pillars: Wasl (chat), Mashahd (video), Lamahat (photos), Midan (public square).', 1.0, 'manual'),
  (NULL, 'platform', 'Circle payments (Nat) are non-custodial: deeplinks open native wallet apps (InstaPay, Vodafone Cash, Fawry in Egypt; per-country rails elsewhere).', 1.0, 'manual'),
  (NULL, 'platform', 'Circle has per-country legal nodes: 6 data planes (global, eu, china, russia, iran, vietnam) with individual compliance, payments, emergency numbers, and news sources for every country worldwide.', 1.0, 'manual'),
  (NULL, 'platform', 'Circle Verify enforces one-account-per-ID identity verification; Local Mesh keeps chat working offline via Bluetooth/WiFi-Direct.', 1.0, 'manual'),
  (NULL, 'platform', 'Circle Brain orchestrates all modules, learns from interactions, and grounds answers with live Gemini web search when needed.', 1.0, 'manual');
