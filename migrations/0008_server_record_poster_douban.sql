-- D1 schema v10: persist a validated Douban subject ID without storing external URLs.
ALTER TABLE server_record_poster_cache
  ADD COLUMN douban_id TEXT NOT NULL DEFAULT '';
