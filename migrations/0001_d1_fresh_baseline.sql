CREATE TABLE IF NOT EXISTS sys_status (
  scope TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_failures (
  ip TEXT PRIMARY KEY,
  fail_count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cf_dashboard_cache (
  cache_key TEXT PRIMARY KEY,
  zone_id TEXT NOT NULL,
  bucket_date TEXT NOT NULL,
  payload TEXT NOT NULL,
  version INTEGER NOT NULL,
  cached_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cf_runtime_cache (
  cache_key TEXT PRIMARY KEY,
  cache_group TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  cached_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS dns_ip_pool_items (
  id TEXT PRIMARY KEY,
  ip TEXT NOT NULL UNIQUE,
  ip_type TEXT NOT NULL,
  source_kind TEXT NOT NULL,
  source_label TEXT,
  line_label TEXT NOT NULL DEFAULT '',
  remark TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dns_ip_pool_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'url',
  domain TEXT,
  source_kind TEXT NOT NULL DEFAULT 'custom',
  preset_id TEXT NOT NULL DEFAULT '',
  builtin_id TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  ip_limit INTEGER NOT NULL DEFAULT 5,
  last_fetch_at TEXT,
  last_fetch_status TEXT,
  last_fetch_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS proxy_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  node_name TEXT NOT NULL,
  request_path TEXT NOT NULL,
  request_method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL,
  client_ip TEXT NOT NULL,
  inbound_colo TEXT,
  outbound_colo TEXT,
  user_agent TEXT,
  referer TEXT,
  category TEXT DEFAULT 'api',
  error_detail TEXT,
  detail_json TEXT,
  created_at TEXT NOT NULL,
  inbound_ip TEXT,
  outbound_ip TEXT
);
