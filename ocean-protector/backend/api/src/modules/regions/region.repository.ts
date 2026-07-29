import { pool } from '../../database/pool';
import { QueryResult } from 'pg';

export interface RegionRecord {
  id: string;
  stateCode: string;
  stateName: string;
  districtName: string;
  displayName: string;
  primaryLanguageCode: string;
  secondaryLanguageCodes: string[];
  latitude: number;
  longitude: number;
  coastalPriority: number;
  isActive: boolean;
}

export const findNearestRegion = async (lat: number, lon: number): Promise<RegionRecord | null> => {
  const query = `
    SELECT 
      id, state_code AS "stateCode", state_name AS "stateName", 
      district_name AS "districtName", display_name AS "displayName", 
      primary_language_code AS "primaryLanguageCode", 
      secondary_language_codes AS "secondaryLanguageCodes",
      latitude, longitude, coastal_priority AS "coastalPriority", is_active AS "isActive"
    FROM coastal_regions
    WHERE is_active = true
    ORDER BY location <-> ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
    LIMIT 1;
  `;
  const result: QueryResult<RegionRecord> = await pool.query(query, [lon, lat]);
  return result.rows[0] || null;
};

export const findAllRegions = async (stateCode?: string, languageCode?: string): Promise<RegionRecord[]> => {
  let query = `SELECT id, state_code AS "stateCode", state_name AS "stateName", district_name AS "districtName", display_name AS "displayName", primary_language_code AS "primaryLanguageCode", secondary_language_codes AS "secondaryLanguageCodes", latitude, longitude, coastal_priority AS "coastalPriority", is_active AS "isActive" FROM coastal_regions WHERE is_active = true`;
  const params: (string)[] = [];
  if (stateCode) {
    params.push(stateCode);
    query += ` AND state_code = $${params.length}`;
  }
  if (languageCode) {
    params.push(languageCode);
    query += ` AND (primary_language_code = $${params.length} OR $${params.length} = ANY(secondary_language_codes::text[]))`;
  }
  query += ` ORDER BY state_name, district_name;`;
  
  const result = await pool.query<RegionRecord>(query, params);
  return result.rows;
};

export const findRegionById = async (id: string): Promise<RegionRecord | null> => {
  const result = await pool.query<RegionRecord>(`
    SELECT id, state_code AS "stateCode", state_name AS "stateName", district_name AS "districtName", display_name AS "displayName", primary_language_code AS "primaryLanguageCode", secondary_language_codes AS "secondaryLanguageCodes", latitude, longitude, coastal_priority AS "coastalPriority", is_active AS "isActive" 
    FROM coastal_regions WHERE id = $1`, [id]);
  return result.rows[0] || null;
};