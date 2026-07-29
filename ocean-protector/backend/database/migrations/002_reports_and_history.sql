CREATE TYPE hazard_type_enum AS ENUM (
    'high_waves', 'tsunami', 'coastal_flooding', 'storm_surge', 'oil_spill',
    'abnormal_tide', 'marine_pollution', 'coastal_erosion', 'damaged_vessel',
    'strong_current', 'person_in_danger', 'other'
);

CREATE TYPE severity_enum AS ENUM (
    'low', 'advisory', 'warning', 'critical'
);

CREATE TYPE report_status_enum AS ENUM (
    'submitted', 'screening', 'under_review', 'verified', 'rejected',
    'duplicate', 'merged_into_incident', 'action_initiated', 'resolved'
);

CREATE TYPE freshness_band_enum AS ENUM (
    'fresh', 'recent', 'delayed', 'stale'
);

CREATE TYPE analysis_mode_enum AS ENUM (
    'rule_based', 'human_reviewed', 'sample_dataset', 'not_analysed'
);

CREATE TABLE hazard_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_report_id UUID NOT NULL UNIQUE,
    tracking_id VARCHAR(50) UNIQUE NOT NULL,
    hazard_type hazard_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    reporter_name VARCHAR(150),
    reporter_phone VARCHAR(20),
    is_anonymous BOOLEAN DEFAULT false,
    state_code VARCHAR(50),
    district_name VARCHAR(100),
    coastal_region_id UUID REFERENCES coastal_regions(id),
    location GEOGRAPHY(Point, 4326) NOT NULL,
    location_accuracy_metres INT,
    location_source VARCHAR(50),
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sync_delay_minutes INT NOT NULL,
    freshness_band freshness_band_enum NOT NULL,
    severity severity_enum NOT NULL,
    status report_status_enum NOT NULL DEFAULT 'submitted',
    confidence_score INT NOT NULL DEFAULT 0,
    analysis_mode analysis_mode_enum NOT NULL DEFAULT 'not_analysed',
    is_public BOOLEAN DEFAULT false,
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hazard_reports_location ON hazard_reports USING GIST(location);
CREATE INDEX idx_hazard_reports_status ON hazard_reports(status);
CREATE INDEX idx_hazard_reports_hazard_type ON hazard_reports(hazard_type);
CREATE INDEX idx_hazard_reports_observed_at ON hazard_reports(observed_at);

CREATE TABLE report_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES hazard_reports(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    file_size_bytes INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE audit_action_enum AS ENUM ('CREATED', 'STATUS_CHANGED', 'CONFIDENCE_UPDATED');

CREATE TABLE report_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES hazard_reports(id) ON DELETE CASCADE,
    action audit_action_enum NOT NULL,
    previous_value VARCHAR(50),
    new_value VARCHAR(50) NOT NULL,
    reason TEXT,
    actor_type VARCHAR(50) DEFAULT 'system',
    actor_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE confidence_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES hazard_reports(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    raw_value VARCHAR(100),
    points_awarded INT NOT NULL,
    maximum_points INT NOT NULL,
    explanation TEXT NOT NULL,
    source VARCHAR(50) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    reason TEXT,
    actor_type VARCHAR(50),
    actor_name VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);