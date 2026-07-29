-- Optimize filtering by timestamp and status combinations
CREATE INDEX idx_hazard_reports_status_observed_at ON hazard_reports(status, observed_at DESC);
CREATE INDEX idx_hazard_reports_state_hazard ON hazard_reports(state_code, hazard_type);

-- Optimize incident status and public visibility queries
CREATE INDEX idx_incidents_public_status ON incidents(is_public, status);

-- Optimize finding related reports in proximity faster using bounding box prior to exact distance
CREATE INDEX idx_hazard_reports_location_bbox ON hazard_reports USING GIST(location);