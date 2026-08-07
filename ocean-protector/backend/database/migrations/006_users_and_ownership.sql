-- Internal application users mirroring Supabase Auth identities.
-- Roles are resolved server-side from this table; the Supabase token only
-- proves identity. A new signup is upserted with the default 'citizen' role.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(150),
    role VARCHAR(50) NOT NULL DEFAULT 'citizen',
    account_status VARCHAR(20) NOT NULL DEFAULT 'active',
    organisation_name VARCHAR(150),
    jurisdiction_state_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Report ownership (who submitted the report) for "My Reports".
ALTER TABLE hazard_reports ADD COLUMN IF NOT EXISTS reporter_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_hazard_reports_reporter_user ON hazard_reports(reporter_user_id);

-- In-app notifications (Stage 4).
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    entity_type VARCHAR(50),
    entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
