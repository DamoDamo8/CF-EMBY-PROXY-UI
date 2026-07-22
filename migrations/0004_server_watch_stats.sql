-- Latest Emby playback stop observed for each proxy node.
CREATE TABLE IF NOT EXISTS server_last_watch (
  node_name TEXT PRIMARY KEY,
  last_watched_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
