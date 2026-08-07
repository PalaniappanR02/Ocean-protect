import { pool } from '../../database/pool';
import type { ConfidenceFactor, NearbyReportMatch, ReportRecord } from './report.types';
import type { ReportQuery } from './report.schema';

const REPORT_SELECT = `
  id,
  client_report_id AS "clientReportId",
  tracking_id AS "trackingId",
  hazard_type AS "hazardType",
  title,
  description,
  language_code AS "languageCode",
  reporter_name AS "reporterName",
  reporter_phone AS "reporterPhone",
  is_anonymous AS "isAnonymous",
  state_code AS "stateCode",
  district_name AS "districtName",
  coastal_region_id AS "coastalRegionId",
  ST_Y(location::geometry) AS latitude,
  ST_X(location::geometry) AS longitude,
  location_accuracy_metres AS "locationAccuracyMetres",
  location_source AS "locationSource",
  observed_at AS "observedAt",
  received_at AS "receivedAt",
  synced_at AS "syncedAt",
  sync_delay_minutes AS "syncDelayMinutes",
  freshness_band AS "freshnessBand",
  severity,
  status,
  confidence_score AS "confidenceScore",
  analysis_mode AS "analysisMode",
  is_public AS "isPublic",
  is_synthetic AS "isSynthetic",
  COALESCE((
    SELECT json_agg(json_build_object(
      'url', file_url,
      'mimeType', mime_type,
      'size', file_size_bytes,
      'latitude', latitude,
      'longitude', longitude
    ))
    FROM report_media rm
    WHERE rm.report_id = hazard_reports.id
  ), '[]') AS "mediaUrls",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const VALID_TRANSITIONS: Record<string, string[]> = {
  submitted: ['screening', 'under_review', 'verified', 'rejected', 'duplicate'],
  screening: ['under_review', 'verified', 'rejected', 'duplicate'],
  under_review: ['verified', 'rejected', 'duplicate'],
  verified: ['merged_into_incident', 'action_initiated', 'resolved'],
  merged_into_incident: ['action_initiated', 'resolved'],
  action_initiated: ['resolved'],
  rejected: [],
  duplicate: [],
  resolved: [],
};

export const isValidTransition = (current: string, next: string): boolean =>
  current === next || Boolean(VALID_TRANSITIONS[current]?.includes(next));

const findOne = async (column: 'id' | 'client_report_id' | 'tracking_id', value: string) => {
  const result = await pool.query<ReportRecord>(
    `SELECT ${REPORT_SELECT} FROM hazard_reports WHERE ${column} = $1 LIMIT 1`,
    [value],
  );
  return result.rows[0] ?? null;
};

export const findReportByClientId = (clientReportId: string): Promise<ReportRecord | null> =>
  findOne('client_report_id', clientReportId);

export const findReportById = (id: string): Promise<ReportRecord | null> =>
  findOne('id', id);

export const findReportByTrackingId = (trackingId: string): Promise<ReportRecord | null> =>
  findOne('tracking_id', trackingId);

export const createReport = async (
  data: any,
  region: any,
  confidenceScore: number,
  freshnessBand: string,
  syncDelayMinutes: number,
  reporterUserId?: string | null,
): Promise<ReportRecord> => {
  const { rows } = await pool.query<ReportRecord>(`
    INSERT INTO hazard_reports (
      client_report_id, tracking_id, hazard_type, title, description, language_code,
      reporter_name, reporter_phone, is_anonymous, state_code, district_name, coastal_region_id,
      location, location_accuracy_metres, location_source, observed_at, received_at, synced_at,
      sync_delay_minutes, freshness_band, severity, status, confidence_score, analysis_mode, is_synthetic,
      reporter_user_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
      ST_SetSRID(ST_MakePoint($13, $14), 4326)::geography, $15, $16, $17, $18, $19,
      $20, $21, $22, 'submitted', $23, $24, false, $25
    )
    RETURNING ${REPORT_SELECT}
  `, [
    data.clientReportId,
    data.trackingId,
    data.hazardType,
    data.title,
    data.description,
    data.languageCode,
    data.isAnonymous ? null : (data.reporterName || null),
    data.isAnonymous ? null : (data.reporterPhone || null),
    data.isAnonymous,
    region?.stateCode || null,
    region?.districtName || null,
    region?.id || null,
    data.longitude,
    data.latitude,
    data.locationAccuracyMetres || null,
    data.locationSource,
    data.observedAt,
    data.receivedAt,
    data.syncedAt,
    syncDelayMinutes,
    freshnessBand,
    data.severity,
    confidenceScore,
    data.analysisMode || 'rule_based',
    reporterUserId ?? null,
  ]);
  return rows[0];
};

export const saveConfidenceFactors = async (
  reportId: string,
  factors: ConfidenceFactor[],
): Promise<void> => {
  if (factors.length === 0) return;

  const values = factors.map((_, index) => {
    const offset = index * 8;
    return `($1, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`;
  }).join(',');

  const params: unknown[] = [reportId];
  for (const factor of factors) {
    params.push(
      factor.code,
      factor.label,
      factor.rawValue,
      factor.pointsAwarded,
      factor.maximumPoints,
      factor.explanation,
      factor.source,
      factor.calculatedAt,
    );
  }

  await pool.query(`
    INSERT INTO confidence_factors (
      report_id, code, label, raw_value, points_awarded,
      maximum_points, explanation, source, calculated_at
    ) VALUES ${values}
  `, params);
};

export interface MediaItemInput {
  url: string;
  latitude?: number | null;
  longitude?: number | null;
}

export const saveReportMedia = async (
  reportId: string,
  mediaUrls: Array<string | MediaItemInput>,
): Promise<void> => {
  if (!mediaUrls.length) return;

  const values = mediaUrls.map((_, index) => {
    const offset = index * 5;
    return `($1, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
  }).join(',');

  const params: unknown[] = [reportId];
  for (const item of mediaUrls) {
    const url = typeof item === 'string' ? item : item.url;
    const latitude = typeof item === 'string' ? null : (item.latitude ?? null);
    const longitude = typeof item === 'string' ? null : (item.longitude ?? null);
    const mimeType = url.includes('.png') ? 'image/png' : url.includes('.webp') ? 'image/webp' : 'image/jpeg';
    params.push(url, mimeType, 0, latitude, longitude);
  }

  await pool.query(`
    INSERT INTO report_media (report_id, file_url, mime_type, file_size_bytes, latitude, longitude)
    VALUES ${values}
    ON CONFLICT DO NOTHING
  `, params);
};

export const replaceConfidenceFactors = async (
  reportId: string,
  factors: ConfidenceFactor[],
): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM confidence_factors WHERE report_id = $1', [reportId]);
    if (factors.length > 0) {
      const values = factors.map((_, index) => {
        const offset = index * 8;
        return `($1, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`;
      }).join(',');
      const params: unknown[] = [reportId];
      for (const factor of factors) {
        params.push(
          factor.code,
          factor.label,
          factor.rawValue,
          factor.pointsAwarded,
          factor.maximumPoints,
          factor.explanation,
          factor.source,
          factor.calculatedAt,
        );
      }
      await client.query(`
        INSERT INTO confidence_factors (
          report_id, code, label, raw_value, points_awarded,
          maximum_points, explanation, source, calculated_at
        ) VALUES ${values}
      `, params);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateReportConfidence = async (
  reportId: string,
  confidenceScore: number,
  analysisMode: string,
): Promise<ReportRecord | null> => {
  await pool.query(`
    UPDATE hazard_reports
    SET confidence_score = $2,
        analysis_mode = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `, [reportId, confidenceScore, analysisMode]);
  return findReportById(reportId);
};

export const findNearbyReports = async (
  lat: number,
  lon: number,
  hazardType: string,
  observedAt: string,
  radiusKm = 20,
  timeWindowHours = 3,
): Promise<NearbyReportMatch> => {
  const timeThreshold = new Date(
    new Date(observedAt).getTime() - timeWindowHours * 3_600_000,
  ).toISOString();

  const result = await pool.query<{ id: string; distance_km: number }>(`
    SELECT
      id,
      ST_Distance(
        location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) / 1000 AS distance_km
    FROM hazard_reports
    WHERE hazard_type = $3
      AND observed_at >= $4
      AND ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $5 * 1000
      )
    ORDER BY distance_km ASC
    LIMIT 10
  `, [lon, lat, hazardType, timeThreshold, radiusKm]);

  return {
    count: result.rowCount ?? 0,
    nearestDistanceKm: Number(result.rows[0]?.distance_km ?? 0),
    relatedReportIds: result.rows.map((row) => row.id),
    isClusterCandidate: (result.rowCount ?? 0) >= 3,
  };
};

export const getReportHistoryRows = async (reportId: string) => {
  const result = await pool.query(`
    SELECT
      id,
      action,
      previous_value AS "previousValue",
      new_value AS "newValue",
      reason,
      actor_type AS "actorType",
      actor_name AS "actorName",
      created_at AS "createdAt"
    FROM report_status_history
    WHERE report_id = $1
    ORDER BY created_at ASC
  `, [reportId]);
  return result.rows;
};

export const getReportConfidenceRows = async (reportId: string) => {
  const result = await pool.query(`
    SELECT
      code,
      label,
      raw_value AS "rawValue",
      points_awarded AS "pointsAwarded",
      maximum_points AS "maximumPoints",
      explanation,
      source,
      calculated_at AS "calculatedAt"
    FROM confidence_factors
    WHERE report_id = $1
    ORDER BY code ASC
  `, [reportId]);
  return result.rows;
};

export const updateReportStatus = async (
  reportId: string,
  newStatus: string,
  reason: string,
  actorType: string,
  actorName: string,
): Promise<ReportRecord> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query<{ status: string }>(
      'SELECT status FROM hazard_reports WHERE id = $1 FOR UPDATE',
      [reportId],
    );
    if (current.rows.length === 0) throw new Error('Report not found');

    const currentStatus = current.rows[0].status;
    if (!isValidTransition(currentStatus, newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    if (currentStatus !== newStatus) {
      await client.query(`
        UPDATE hazard_reports
        SET status = $1::report_status_enum,
            is_public = CASE
              WHEN $1::report_status_enum = 'verified' AND severity <> 'low' THEN true
              WHEN $1::report_status_enum IN ('rejected', 'duplicate') THEN false
              ELSE is_public
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2::uuid
      `, [newStatus, reportId]);

      await client.query(`
        INSERT INTO report_status_history (
          report_id, action, previous_value, new_value,
          reason, actor_type, actor_name
        ) VALUES ($1, 'STATUS_CHANGED', $2, $3, $4, $5, $6)
      `, [reportId, currentStatus, newStatus, reason, actorType, actorName]);
    }

    const updated = await client.query<ReportRecord>(
      `SELECT ${REPORT_SELECT} FROM hazard_reports WHERE id = $1`,
      [reportId],
    );
    await client.query('COMMIT');
    return updated.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const splitCsv = (value?: string): string[] =>
  value?.split(',').map((item) => item.trim()).filter(Boolean) ?? [];

export const findAllReports = async (
  filters: ReportQuery,
  reporterUserId?: string,
): Promise<{ reports: ReportRecord[]; total: number }> => {
  const where = ['1=1'];
  const params: unknown[] = [];

  if (reporterUserId) {
    params.push(reporterUserId);
    where.push(`reporter_user_id = $${params.length}`);
  }

  const addCsvFilter = (column: string, value?: string) => {
    const values = splitCsv(value);
    if (!values.length) return;
    params.push(values);
    where.push(`${column}::text = ANY($${params.length}::text[])`);
  };

  addCsvFilter('state_code', filters.state);
  addCsvFilter('district_name', filters.district);
  addCsvFilter('hazard_type', filters.hazardType);
  addCsvFilter('severity', filters.severity);
  addCsvFilter('status', filters.status);
  addCsvFilter('freshness_band', filters.freshnessBand);

  if (filters.minConfidence !== undefined) {
    params.push(filters.minConfidence);
    where.push(`confidence_score >= $${params.length}`);
  }
  if (filters.observedFrom) {
    params.push(filters.observedFrom);
    where.push(`observed_at >= $${params.length}`);
  }
  if (filters.observedTo) {
    params.push(filters.observedTo);
    where.push(`observed_at <= $${params.length}`);
  }
  if (filters.hasMedia === 'true') where.push('id IN (SELECT report_id FROM report_media)');
  if (filters.hasMedia === 'false') where.push('id NOT IN (SELECT report_id FROM report_media)');
  if (filters.isPublic !== undefined) {
    params.push(filters.isPublic === 'true');
    where.push(`is_public = $${params.length}`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    const index = params.length;
    where.push(`(
      title ILIKE $${index}
      OR description ILIKE $${index}
      OR tracking_id ILIKE $${index}
      OR district_name ILIKE $${index}
    )`);
  }

  const whereClause = where.join(' AND ');
  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM hazard_reports WHERE ${whereClause}`,
    params,
  );
  const total = Number.parseInt(countResult.rows[0].count, 10);

  const sortColumns: Record<ReportQuery['sortBy'], string> = {
    receivedAt: 'received_at',
    observedAt: 'observed_at',
    confidenceScore: 'confidence_score',
    severity: 'severity',
    createdAt: 'created_at',
  };
  const orderColumn = sortColumns[filters.sortBy];
  const orderDirection = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const offset = (filters.page - 1) * filters.limit;

  params.push(filters.limit, offset);
  const result = await pool.query<ReportRecord>(`
    SELECT ${REPORT_SELECT}
    FROM hazard_reports
    WHERE ${whereClause}
    ORDER BY ${orderColumn} ${orderDirection}
    LIMIT $${params.length - 1}
    OFFSET $${params.length}
  `, params);

  return { reports: result.rows, total };
};
