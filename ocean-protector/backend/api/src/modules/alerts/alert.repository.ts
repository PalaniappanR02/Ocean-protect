import { pool } from '../../database/pool';

export interface AlertRecord {
  id: string;
  incidentId: string;
  title: string;
  message: string;
  severity: string;
  issuedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export const createAlert = async (data: {
  incidentId: string;
  title: string;
  message: string;
  severity: string;
  expiresAt?: string | null;
}): Promise<AlertRecord> => {
  const { rows } = await pool.query<AlertRecord>(`
    INSERT INTO alerts (incident_id, title, message, severity, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      incident_id AS "incidentId",
      title,
      message,
      severity,
      issued_at AS "issuedAt",
      expires_at AS "expiresAt",
      is_active AS "isActive"
  `, [data.incidentId, data.title, data.message, data.severity, data.expiresAt ?? null]);
  return rows[0];
};

export const findAllAlerts = async (activeOnly = false): Promise<AlertRecord[]> => {
  const result = await pool.query<AlertRecord>(`
    SELECT
      a.id,
      a.incident_id AS "incidentId",
      i.title AS "incidentTitle",
      i.hazard_type AS "hazardType",
      i.severity,
      i.state_code AS "stateCode",
      i.district_name AS "districtName",
      a.title,
      a.message,
      a.severity,
      a.issued_at AS "issuedAt",
      a.expires_at AS "expiresAt",
      a.is_active AS "isActive"
    FROM alerts a
    JOIN incidents i ON a.incident_id = i.id
    ${activeOnly ? 'WHERE a.is_active = true' : ''}
    ORDER BY a.issued_at DESC
  `);
  return result.rows;
};

export const deactivateAlert = async (id: string): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE alerts SET is_active = false WHERE id = $1 AND is_active = true`,
    [id],
  );
  return (result.rowCount ?? 0) > 0;
};

export const notifyAllUsers = async (kind: string, title: string, body: string, entityType: string, entityId: string) => {
  await pool.query(`
    INSERT INTO notifications (user_id, kind, title, body, entity_type, entity_id)
    SELECT id, $1, $2, $3, $4, $5 FROM users WHERE account_status = 'active'
  `, [kind, title, body, entityType, entityId]);
};
