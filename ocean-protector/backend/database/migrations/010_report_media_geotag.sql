-- Geotagged evidence: store GPS coordinates captured with each media item.
ALTER TABLE report_media
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

CREATE INDEX IF NOT EXISTS idx_report_media_geotag
  ON report_media (report_id, latitude, longitude)
  WHERE latitude IS NOT NULL;
