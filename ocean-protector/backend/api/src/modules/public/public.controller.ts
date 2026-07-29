import { Request, Response } from 'express';
import { pool } from '../../database/pool';
import { mapIncidentToResponse } from '../incidents/incident.mapper';

export const getPublicIncidents = async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT id, title, description, hazard_type AS "hazardType", severity, status,
      ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude,
      state_code AS "stateCode", district_name AS "districtName",
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM incidents 
    WHERE is_public = true AND status IN ('verified', 'assigned', 'responding', 'monitoring', 'resolved')
    ORDER BY created_at DESC
  `);
  
  res.json({ success: true, data: result.rows.map(r => mapIncidentToResponse(r as any, true)) });
};

export const getPublicIncident = async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT id, title, description, hazard_type AS "hazardType", severity, status,
      ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude,
      state_code AS "stateCode", district_name AS "districtName",
      created_at AS "createdAt", updated_at AS "updatedAt"
    FROM incidents 
    WHERE id = $1 AND is_public = true
  `, [req.params.incidentId]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Public incident not found' } });
  }
  
  res.json({ success: true, data: mapIncidentToResponse(result.rows[0] as any, true) });
};

export const getPublicMap = async (req: Request, res: Response) => {
  // Returns ONLY verified public incidents. No raw reports.
  const result = await pool.query(`
    SELECT id, hazard_type AS "hazardType", severity, status,
      ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude
    FROM incidents 
    WHERE is_public = true
  `);
  res.json({ success: true, data: result.rows });
};

export const getPublicAlerts = async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT a.id, a.incident_id AS "incidentId", a.title, a.message, a.severity,
      a.issued_at AS "issuedAt", a.expires_at AS "expiresAt"
    FROM alerts a
    JOIN incidents i ON a.incident_id = i.id
    WHERE a.is_active = true AND i.is_public = true
    ORDER BY a.issued_at DESC
  `);
  res.json({ success: true, data: result.rows });
};