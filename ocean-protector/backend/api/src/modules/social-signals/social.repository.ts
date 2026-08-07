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
  reviewStatus: string | null;
  credibilityScore: number | null;
  sentimentScore: number | null;
  engagementScore: number | null;
  misinfoScore: number | null;
  sourceUrl: string | null;
  observedAt: string;
  isSynthetic: boolean;
  dataSource: string;
  relatedIncidentId: string | null;
}

const SIGNAL_SELECT = `
  id, platform, text, language_code AS "languageCode", location_name AS "locationName",
  ST_Y(location::geometry) AS latitude, ST_X(location::geometry) AS longitude,
  hazard_type AS "hazardType", inferred_severity AS "inferredSeverity", observed_at AS "observedAt",
  review_status AS "reviewStatus", credibility_score AS "credibilityScore",
  sentiment_score AS "sentimentScore", engagement_score AS "engagementScore",
  misinfo_score AS "misinfoScore", source_url AS "sourceUrl",
  is_synthetic AS "isSynthetic", data_source AS "dataSource", related_incident_id AS "relatedIncidentId"
`;

export const findAllSocialSignals = async (
  filters: { hazardType?: string; platform?: string; minEngagement?: number; limit?: number } = {},
): Promise<SocialSignalRecord[]> => {
  let query = `SELECT ${SIGNAL_SELECT} FROM social_signals WHERE 1=1`;
  const params: unknown[] = [];

  if (filters.hazardType) {
    params.push(filters.hazardType);
    query += ` AND hazard_type = $${params.length}`;
  }
  if (filters.platform) {
    params.push(filters.platform);
    query += ` AND platform = $${params.length}`;
  }
  if (filters.minEngagement !== undefined) {
    params.push(filters.minEngagement);
    query += ` AND engagement_score >= $${params.length}`;
  }

  query += ` ORDER BY engagement_score DESC NULLS LAST, observed_at DESC LIMIT ${Math.min(filters.limit ?? 100, 250)}`;

  const result = await pool.query<SocialSignalRecord>(query, params);
  return result.rows;
};

export const importSocialSignal = async (data: {
  platform: string;
  text: string;
  languageCode: string;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hazardType?: string | null;
  inferredSeverity?: string | null;
  credibilityScore: number;
  sentimentScore?: number | null;
  engagementScore?: number | null;
  misinfoScore?: number | null;
  sourceUrl?: string | null;
  observedAt: string;
  dataSource?: string;
}): Promise<SocialSignalRecord> => {
  const { rows } = await pool.query<SocialSignalRecord>(`
    INSERT INTO social_signals (
      platform, text, language_code, location_name, latitude, longitude, location,
      hazard_type, inferred_severity, credibility_score, sentiment_score, engagement_score,
      misinfo_score, source_url, observed_at, is_synthetic, data_source
    ) VALUES (
      $1, $2, $3, $4, $5::float8, $6::float8,
      CASE WHEN $5 IS NULL OR $6 IS NULL THEN NULL ELSE ST_SetSRID(ST_MakePoint($6::float8, $5::float8), 4326)::geography END,
      $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
    )
    RETURNING ${SIGNAL_SELECT}
  `, [
    data.platform,
    data.text,
    data.languageCode,
    data.locationName ?? null,
    data.latitude ?? null,
    data.longitude ?? null,
    data.hazardType ?? null,
    data.inferredSeverity ?? null,
    data.credibilityScore,
    data.sentimentScore ?? null,
    data.engagementScore ?? null,
    data.misinfoScore ?? null,
    data.sourceUrl ?? null,
    data.observedAt,
    data.dataSource === 'manual' ? false : true,
    data.dataSource ?? 'manual',
  ]);
  return rows[0];
};

export const updateSocialReviewStatus = async (id: string, reviewStatus: string, credibilityScore?: number) => {
  if (credibilityScore !== undefined) {
    await pool.query(`UPDATE social_signals SET review_status = $2, credibility_score = $3 WHERE id = $1`, [id, reviewStatus, credibilityScore]);
  } else {
    await pool.query(`UPDATE social_signals SET review_status = $2 WHERE id = $1`, [id, reviewStatus]);
  }
};

export const findSocialHotspots = async (epsKm = 25, minPoints = 3) => {
  const result = await pool.query(`
    WITH clusters AS (
      SELECT
        id,
        hazard_type,
        inferred_severity,
        ST_ClusterDBSCAN(ST_Transform(location::geometry, 3857), eps := $1::float8 * 1000, minpoints := $2::int) OVER () AS cluster_id
      FROM social_signals
      WHERE location IS NOT NULL
    )
    SELECT
      cluster_id AS "clusterId",
      COUNT(*)::int AS "signalCount",
      ST_Y(ST_Centroid(ST_Collect(clusters.geom))) AS latitude,
      ST_X(ST_Centroid(ST_Collect(clusters.geom))) AS longitude,
      MAX(engagement_score) AS "maxEngagement"
    FROM (
      SELECT c.*, s.engagement_score AS engagement_score, s.location::geometry AS geom
      FROM clusters c
      JOIN social_signals s ON s.id = c.id
    ) clusters
    WHERE cluster_id IS NOT NULL
    GROUP BY cluster_id
    HAVING COUNT(*) >= $2
    ORDER BY COUNT(*) DESC
  `, [epsKm, minPoints]);
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

/**
 * Keyword/trend aggregation across signals: top keywords, platform mix,
 * engagement and misinfo averages, urgency counts.
 */
export const findSocialTrends = async (limit = 50) => {
  const keywordsResult = await pool.query(`
    SELECT word, COUNT(*) AS frequency
    FROM (
      SELECT id, unnest(string_to_array(lower(regexp_replace(text, '[^a-zA-Z0-9\\s]', ' ', 'g')), ' ')) AS word
      FROM social_signals
    ) words
    WHERE length(word) > 3 AND word NOT IN (
      'the','this','that','with','from','have','been','were','will','just','about','here','there','what','when','where','your','they','their','them','would','could','should','than','then','into','over','after','before','because','between'
    )
    GROUP BY word
    ORDER BY COUNT(*) DESC
    LIMIT $1
  `, [limit]);

  const platformResult = await pool.query(`
    SELECT platform, COUNT(*)::int AS count FROM social_signals GROUP BY platform ORDER BY count DESC
  `);

  const metricsResult = await pool.query(`
    SELECT
      COUNT(*)::int AS "totalSignals",
      COALESCE(ROUND(AVG(engagement_score)::numeric, 2), 0) AS "avgEngagement",
      COALESCE(ROUND(AVG(misinfo_score)::numeric, 2), 0) AS "avgMisinfo",
      COUNT(*) FILTER (WHERE misinfo_score >= 0.5)::int AS "highMisinfo",
      COUNT(*) FILTER (WHERE inferred_severity IN ('critical', 'warning'))::int AS "highUrgency"
    FROM social_signals
  `);

  return {
    topKeywords: keywordsResult.rows,
    byPlatform: platformResult.rows,
    ...metricsResult.rows[0],
  };
};
