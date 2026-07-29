import { pool } from '../../database/pool';
import { IncidentRecord, ResponseTeamRecord } from './incident.types';

const VALID_INCIDENT_TRANSITIONS: Record<string, string[]> = {
  'candidate': ['under_review', 'cancelled'],
  'under_review': ['verified', 'cancelled'],
  'verified': ['assigned', 'cancelled'],
  'assigned': ['responding', 'monitoring'],
  'responding': ['monitoring', 'resolved'],
  'monitoring': ['resolved'],
  'resolved': [],
  'cancelled': [],
};

export const isValidIncidentTransition = (current: string, next: string): boolean => {
  return VALID_INCIDENT_TRANSITIONS[current]?.includes(next) || false;
};

export const createIncident = async (data: any): Promise<IncidentRecord> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Find nearest region for the incident
    const regionRes = await client.query(`
      SELECT id, state_code, district_name FROM coastal_regions 
      WHERE is_active = true 
      ORDER BY location <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography LIMIT 1
    `, [data.longitude, data.latitude]);
    const region = regionRes.rows[0];

    const { rows } = await client.query<IncidentRecord>(`
      INSERT INTO incidents (title, description, hazard_type, severity, location, state_code, district_name, coastal_region_id)
      VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography, $7, $8, $9)
      RETURNING id, title, description, hazard_type AS "hazardType", severity, status, 
        ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude, 
        state_code AS "stateCode", district_name AS "districtName", coastal_region_id AS "coastalRegionId", 
        is_public AS "isPublic", public_visibility_reason AS "publicVisibilityReason", 
        verified_at AS "verifiedAt", verified_by AS "verifiedBy", resolved_at AS "resolvedAt", 
        created_at AS "createdAt", updated_at AS "updatedAt";
    `, [data.title, data.description || null, data.hazardType, data.severity, data.longitude, data.latitude, 
        region?.state_code || null, region?.district_name || null, region?.id || null]);

    const incident = rows[0];

    // Attach reports
    for (const reportId of data.reportIds) {
      await client.query(`
        INSERT INTO incident_reports (incident_id, report_id) VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [incident.id, reportId]);
      
      // Update report status to merged
      await client.query(`
        UPDATE hazard_reports SET status = 'merged_into_incident', updated_at = CURRENT_TIMESTAMP WHERE id = $1
      `, [reportId]);
    }

    await client.query(`
      INSERT INTO incident_status_history (incident_id, action, new_value, actor_type, actor_name)
      VALUES ($1, 'CREATED', 'candidate', 'system', 'system');
    `, [incident.id]);

    await client.query('COMMIT');
    return incident;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const findIncidentById = async (id: string): Promise<IncidentRecord | null> => {
  const result = await pool.query<IncidentRecord>(`
    SELECT id, title, description, hazard_type AS "hazardType", severity, status, 
      ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude, 
      state_code AS "stateCode", district_name AS "districtName", coastal_region_id AS "coastalRegionId", 
      is_public AS "isPublic", public_visibility_reason AS "publicVisibilityReason", 
      verified_at AS "verifiedAt", verified_by AS "verifiedBy", resolved_at AS "resolvedAt", 
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM incidents WHERE id = $1;
  `, [id]);
  return result.rows[0] || null;
};

export const findAllIncidents = async (filters: any): Promise<{ incidents: IncidentRecord[], total: number }> => {
  let where = ['1=1'];
  const params: any[] = [];
  
  if (filters.status) { params.push(filters.status); where.push(`status = $${params.length}`); }
  if (filters.stateCode) { params.push(filters.stateCode); where.push(`state_code = $${params.length}`); }
  if (filters.isPublic !== undefined) { params.push(filters.isPublic); where.push(`is_public = $${params.length}`); }

  const whereClause = where.join(' AND ');
  const offset = (filters.page - 1) * filters.limit;
  
  const countResult = await pool.query(`SELECT COUNT(*) FROM incidents WHERE ${whereClause}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const query = `
    SELECT id, title, description, hazard_type AS "hazardType", severity, status, 
      ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude, 
      state_code AS "stateCode", district_name AS "districtName", coastal_region_id AS "coastalRegionId", 
      is_public AS "isPublic", public_visibility_reason AS "publicVisibilityReason", 
      verified_at AS "verifiedAt", verified_by AS "verifiedBy", resolved_at AS "resolvedAt", 
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM incidents WHERE ${whereClause}
    ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2};
  `;
  params.push(filters.limit, offset);
  
  const result = await pool.query<IncidentRecord>(query, params);
  return { incidents: result.rows, total };
};

export const updateIncidentStatus = async (incidentId: string, newStatus: string, reason: string, actorType: string, actorName: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT status FROM incidents WHERE id = $1 FOR UPDATE', [incidentId]);
    if (current.rows.length === 0) throw new Error('Incident not found');
    const currentStatus = current.rows[0].status;

    if (!isValidIncidentTransition(currentStatus, newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    let verifiedAt = null, verifiedBy = null, resolvedAt = null, isPublic = false, publicReason = null;
    if (newStatus === 'verified') {
      verifiedAt = new Date().toISOString();
      verifiedBy = actorName;
      isPublic = true; // Auto-make public upon verification
      publicReason = 'verified_incident';
    } else if (newStatus === 'resolved') {
      resolvedAt = new Date().toISOString();
    }

    await client.query(`
      UPDATE incidents 
      SET status = $1, updated_at = CURRENT_TIMESTAMP, 
          verified_at = COALESCE($2, verified_at), 
          verified_by = COALESCE($3, verified_by), 
          resolved_at = COALESCE($4, resolved_at),
          is_public = CASE WHEN $1 = 'verified' THEN true ELSE is_public END
      WHERE id = $5
    `, [newStatus, verifiedAt, verifiedBy, resolvedAt, incidentId]);

    await client.query(`
      INSERT INTO incident_status_history (incident_id, action, previous_value, new_value, reason, actor_type, actor_name)
      VALUES ($1, 'STATUS_CHANGED', $2, $3, $4, $5, $6)
    `, [incidentId, currentStatus, newStatus, reason, actorType, actorName]);

    await client.query('COMMIT');
    return { previousStatus: currentStatus, newStatus };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const attachReportToIncident = async (incidentId: string, reportId: string) => {
  await pool.query(`
    INSERT INTO incident_reports (incident_id, report_id) VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `, [incidentId, reportId]);
  
  await pool.query(`
    UPDATE hazard_reports SET status = 'merged_into_incident', updated_at = CURRENT_TIMESTAMP WHERE id = $1
  `, [reportId]);
};

export const detachReportFromIncident = async (incidentId: string, reportId: string) => {
  await pool.query(`
    DELETE FROM incident_reports WHERE incident_id = $1 AND report_id = $2
  `, [incidentId, reportId]);
};

export const getIncidentReports = async (incidentId: string) => {
  const result = await pool.query(`
    SELECT r.id, r.tracking_id, r.hazard_type, r.severity, r.status, r.observed_at
    FROM hazard_reports r
    JOIN incident_reports ir ON r.id = ir.report_id
    WHERE ir.incident_id = $1
  `, [incidentId]);
  return result.rows;
};

export const getAllResponseTeams = async (): Promise<ResponseTeamRecord[]> => {
  const result = await pool.query<ResponseTeamRecord>(`
    SELECT id, name, agency, location_name AS "locationName", 
      ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude, 
      status, member_count AS "memberCount", capabilities, contact_number AS "contactNumber", is_synthetic AS "isSynthetic"
    FROM response_teams ORDER BY name
  `);
  return result.rows;
};

export const assignTeamToIncident = async (incidentId: string, teamId: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(`
      INSERT INTO incident_assignments (incident_id, team_id, status)
      VALUES ($1, $2, 'assigned')
    `, [incidentId, teamId]);

    await client.query(`
      UPDATE response_teams SET status = 'assigned' WHERE id = $1
    `, [teamId]);

    // Update incident status to assigned
    const current = await client.query('SELECT status FROM incidents WHERE id = $1 FOR UPDATE', [incidentId]);
    if (current.rows.length === 0) throw new Error('Incident not found');
    
    if (isValidIncidentTransition(current.rows[0].status, 'assigned')) {
      await client.query(`
        UPDATE incidents SET status = 'assigned', updated_at = CURRENT_TIMESTAMP WHERE id = $1
      `, [incidentId]);
      
      await client.query(`
        INSERT INTO incident_status_history (incident_id, action, previous_value, new_value, actor_type, actor_name)
        VALUES ($1, 'STATUS_CHANGED', $2, 'assigned', 'authority', 'system')
      `, [incidentId, current.rows[0].status]);
    }

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};