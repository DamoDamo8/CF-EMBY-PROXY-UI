-- Existing tables are intentionally left unchanged here. SQLite does not
-- support ADD COLUMN IF NOT EXISTS, so the Worker compatibility initializer
-- inspects each historical table and adds missing columns before dependent
-- indexes are created.

CREATE TABLE IF NOT EXISTS sys_locks (
  scope TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  owner TEXT NOT NULL,
  acquired_at INTEGER NOT NULL,
  renewed_at INTEGER,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS dns_ip_pool_fetch_cache (
  signature TEXT PRIMARY KEY,
  items_json TEXT NOT NULL,
  source_results_json TEXT NOT NULL,
  imported_count INTEGER NOT NULL DEFAULT 0,
  enabled_source_count INTEGER NOT NULL DEFAULT 0,
  cached_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dns_ip_probe_cache (
  ip TEXT NOT NULL,
  entry_colo TEXT NOT NULL,
  probe_status TEXT NOT NULL,
  latency_ms INTEGER,
  cf_ray TEXT,
  colo_code TEXT,
  city_name TEXT,
  country_code TEXT,
  country_name TEXT,
  probed_at TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (ip, entry_colo)
);

CREATE TABLE IF NOT EXISTS proxy_stats_hourly (
  bucket_date TEXT NOT NULL,
  bucket_hour INTEGER NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  play_count INTEGER NOT NULL DEFAULT 0,
  playback_info_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (bucket_date, bucket_hour)
);
