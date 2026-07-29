CREATE TYPE social_platform_enum AS ENUM ('twitter', 'facebook', 'instagram', 'news');

CREATE TABLE social_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform social_platform_enum NOT NULL,
    text TEXT NOT NULL,
    language_code VARCHAR(10) DEFAULT 'en',
    location_name VARCHAR(150),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(Point, 4326),
    hazard_type hazard_type_enum,
    inferred_severity severity_enum,
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_synthetic BOOLEAN DEFAULT true,
    data_source VARCHAR(50) DEFAULT 'sample_dataset',
    related_incident_id UUID REFERENCES incidents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_signals_location ON social_signals USING GIST(location);
CREATE INDEX idx_social_signals_hazard_type ON social_signals(hazard_type);