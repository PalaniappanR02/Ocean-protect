CREATE TYPE incident_status_enum AS ENUM (
    'candidate', 'under_review', 'verified', 'assigned', 'responding', 'monitoring', 'resolved', 'cancelled'
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    hazard_type hazard_type_enum NOT NULL,
    severity severity_enum NOT NULL DEFAULT 'advisory',
    status incident_status_enum NOT NULL DEFAULT 'candidate',
    location GEOGRAPHY(Point, 4326) NOT NULL,
    state_code VARCHAR(50),
    district_name VARCHAR(100),
    coastal_region_id UUID REFERENCES coastal_regions(id),
    is_public BOOLEAN DEFAULT false,
    public_visibility_reason VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX idx_incidents_status ON incidents(status);

CREATE TABLE incident_reports (
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES hazard_reports(id) ON DELETE CASCADE,
    attached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (incident_id, report_id)
);

CREATE TYPE team_status_enum AS ENUM ('available', 'assigned', 'responding', 'offline');

CREATE TABLE response_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    agency VARCHAR(150) NOT NULL,
    location_name VARCHAR(150),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location GEOGRAPHY(Point, 4326),
    status team_status_enum NOT NULL DEFAULT 'available',
    member_count INT DEFAULT 0,
    capabilities JSONB DEFAULT '[]'::jsonb,
    contact_number VARCHAR(20),
    is_synthetic BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incident_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES response_teams(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    arrived_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'assigned',
    notes TEXT
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity severity_enum NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE incident_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    previous_value VARCHAR(50),
    new_value VARCHAR(50) NOT NULL,
    reason TEXT,
    actor_type VARCHAR(50) DEFAULT 'system',
    actor_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);