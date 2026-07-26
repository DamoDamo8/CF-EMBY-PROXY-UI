ALTER TABLE server_last_watch
  ADD COLUMN playback_session_fingerprint TEXT NOT NULL DEFAULT '';

ALTER TABLE server_last_watch
  ADD COLUMN playback_session_strength TEXT NOT NULL DEFAULT '';

ALTER TABLE server_last_watch
  ADD COLUMN playback_event_phase TEXT NOT NULL DEFAULT 'stopped';
