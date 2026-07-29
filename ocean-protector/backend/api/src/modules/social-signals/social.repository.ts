import { pool } from '../../database/pool';

export interface SocialSignalRecord {
  id: string;
  platform: string;
  text: string;
  languageCode: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  hazardType: string | null;
  inferredSeverity: string | null;
  observedAt: string;
  isSynthetic: boolean;
  dataSource: string;
  relatedIncidentId: string | null;
}

export const findAllSocialSignals = async (hazardType?: string): Promise<SocialSignalRecord[]> => {
  let query = `
    SELECT id, platform, text, language_code AS "languageCode", location_name AS "locationName", 
      ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude, 
      hazard_type AS "hazardType", inferred_severity AS "inferredSeverity", observed_at AS "observedAt", 
      is_synthetic AS "isSynthetic", data_source AS "dataSource", related_incident_id AS "relatedIncidentId"
    FROM social_signals WHERE 1=1
  `;
  const params: string[] = [];
  if (hazardType) {
    params.push(hazardType);
    query += ` AND hazard_type = $${params.length}`;
  }
  query += ` ORDER BY observed_at DESC LIMIT 100;`;
  
  const result = await pool.query<SocialSignalRecord>(query, params);
  return result.rows;
};

export const getSocialSummary = async () => {
  const byHazard = await pool.query(`
    SELECT hazard_type, COUNT(*) FROM social_signals 
    WHERE hazard_type IS NOT NULL GROUP BY hazard_type
  `);
  const byPlatform = await pool.query(`
    SELECT platform, COUNT(*) FROM social_signals GROUP BY platform
  `);
  const recent = await pool.query(`
    SELECT COUNT(*) FROM social_signals WHERE observed_at >= NOW() - INTERVAL '24 hours'
  `);
  
  return {
    totalSignals: byHazard.rows.reduce((acc, r) => acc + parseInt(r.count, 10), 0),
    signalsInLast24h: parseInt(recent.rows[0].count, 10),
    byHazardType: byHazard.rows,
    byPlatform: byPlatform.rows,
    isSynthetic: true,
    dataSource: 'sample_dataset',
  };
};