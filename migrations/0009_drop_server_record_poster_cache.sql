-- D1 schema v11: persist passive browser search inputs and retire Worker poster cache.
ALTER TABLE server_record_snapshots
  ADD COLUMN last_item_original_title TEXT NOT NULL DEFAULT '';

ALTER TABLE server_record_snapshots
  ADD COLUMN last_item_year INTEGER;

DROP TABLE IF EXISTS server_record_poster_cache;
