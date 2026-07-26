CREATE TABLE IF NOT EXISTS server_record_snapshots (
  node_name TEXT PRIMARY KEY,
  movie_count INTEGER,
  series_count INTEGER,
  episode_count INTEGER,
  counts_state TEXT NOT NULL DEFAULT 'unavailable',
  counts_errors_json TEXT NOT NULL DEFAULT '{}',
  stats_checked_at TEXT NOT NULL DEFAULT '',
  last_item_id TEXT NOT NULL DEFAULT '',
  last_item_name TEXT NOT NULL DEFAULT '',
  last_item_type TEXT NOT NULL DEFAULT '',
  last_item_series_name TEXT NOT NULL DEFAULT '',
  last_item_image_tag TEXT NOT NULL DEFAULT '',
  last_item_watched_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);
