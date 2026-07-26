CREATE TABLE IF NOT EXISTS server_record_poster_cache (
  node_name TEXT PRIMARY KEY,
  watched_at TEXT NOT NULL,
  item_id TEXT NOT NULL,
  tmdb_id TEXT NOT NULL DEFAULT '',
  imdb_id TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT '',
  image_path TEXT NOT NULL DEFAULT '',
  resolved_at TEXT NOT NULL DEFAULT '',
  expires_at TEXT NOT NULL DEFAULT '',
  failure_code TEXT NOT NULL DEFAULT '',
  retry_after TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_server_record_poster_cache_expires_at
  ON server_record_poster_cache (expires_at);
