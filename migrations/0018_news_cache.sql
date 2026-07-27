-- 0018 — Live local news cache (per country+language, 15-min TTL logic in code)
CREATE TABLE IF NOT EXISTS news_cache (
  cache_key  TEXT PRIMARY KEY,           -- news:EG:ar
  payload    TEXT NOT NULL,              -- JSON NewsResult
  fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
