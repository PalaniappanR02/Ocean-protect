import { Pool } from 'pg';

// Test specific database connection (assumes test DB is running)
const testPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://oceanguard:oceanguard_pass@localhost:5432/oceanguard_db',
});

export const cleanDatabase = async () => {
  // Truncate all tables in reverse dependency order
  await testPool.query(`
    TRUNCATE TABLE 
      audit_logs, 
      incident_assignments, 
      incident_status_history, 
      incident_reports, 
      alerts, 
      social_signals, 
      response_teams, 
      incidents, 
      confidence_factors, 
      report_status_history, 
      report_media, 
      hazard_reports 
    CASCADE;
  `);
  
  // Re-seed regions and base teams because they are needed for almost all tests
  await testPool.query(`
    INSERT INTO coastal_regions (state_code, state_name, district_name, display_name, primary_language_code, secondary_language_codes, latitude, longitude, location, coastal_priority) VALUES
    ('TN', 'Tamil Nadu', 'Chennai', 'Chennai Coast', 'ta', '["en"]', 13.0827, 80.2707, ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)::geography, 1)
    ON CONFLICT DO NOTHING;
  `);

  await testPool.query(`
    INSERT INTO response_teams (name, agency, location_name, latitude, longitude, location, status, member_count, capabilities, contact_number, is_synthetic) VALUES
    ('Chennai Coastal Rescue', 'NDRF', 'Chennai', 13.0827, 80.2707, ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)::geography, 'available', 25, '["flood_rescue"]', '044-12345678', true)
    ON CONFLICT DO NOTHING;
  `);
};

export const closeTestPool = async () => {
  await testPool.end();
};