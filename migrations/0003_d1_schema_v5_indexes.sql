CREATE INDEX IF NOT EXISTS idx_sys_locks_expires_at
  ON sys_locks (expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_failures_expires_at
  ON auth_failures (expires_at);

CREATE INDEX IF NOT EXISTS idx_cf_dashboard_cache_expires_at
  ON cf_dashboard_cache (expires_at);

CREATE INDEX IF NOT EXISTS idx_cf_runtime_cache_expires_at
  ON cf_runtime_cache (expires_at);

CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_items_updated_ip
  ON dns_ip_pool_items (updated_at DESC, ip ASC);

CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_sources_sort
  ON dns_ip_pool_sources (sort_order ASC, updated_at ASC);

CREATE INDEX IF NOT EXISTS idx_dns_ip_pool_fetch_cache_expires
  ON dns_ip_pool_fetch_cache (expires_at);

CREATE INDEX IF NOT EXISTS idx_dns_ip_probe_cache_expire
  ON dns_ip_probe_cache (expires_at);

CREATE INDEX IF NOT EXISTS idx_dns_ip_probe_cache_colo_ip_expires
  ON dns_ip_probe_cache (entry_colo, ip, expires_at);

CREATE INDEX IF NOT EXISTS idx_proxy_logs_timestamp
  ON proxy_logs (timestamp);

CREATE INDEX IF NOT EXISTS idx_proxy_logs_client_time
  ON proxy_logs (client_ip, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_proxy_logs_status_time
  ON proxy_logs (status_code, timestamp);

CREATE INDEX IF NOT EXISTS idx_proxy_logs_category_time
  ON proxy_logs (category, timestamp);

DROP INDEX IF EXISTS idx_proxy_logs_client_ip;
DROP INDEX IF EXISTS idx_proxy_logs_inbound_colo;
DROP INDEX IF EXISTS idx_proxy_logs_outbound_colo;
DROP INDEX IF EXISTS idx_proxy_logs_timestamp_id;
DROP INDEX IF EXISTS idx_proxy_logs_node_time;
DROP INDEX IF EXISTS idx_proxy_logs_category;
DROP INDEX IF EXISTS idx_proxy_stats_hourly_date;
DROP INDEX IF EXISTS idx_dns_ip_pool_items_updated_at;
DROP INDEX IF EXISTS idx_dns_ip_pool_items_ip_type;
DROP INDEX IF EXISTS idx_sys_status_updated_at;
DROP INDEX IF EXISTS idx_cf_dashboard_cache_zone_bucket;
DROP INDEX IF EXISTS idx_cf_runtime_cache_group_resource;
