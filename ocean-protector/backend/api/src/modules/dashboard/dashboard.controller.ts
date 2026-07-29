import type { Request, Response } from 'express';
import { pool } from '../../database/pool';

const numberValue = (value: unknown): number => Number.parseInt(String(value ?? 0), 10) || 0;

export const getDashboardSummary = async (_req: Request, res: Response) => {
  const [
    statusResult,
    todayResult,
    last24Result,
    byStateResult,
    byHazardResult,
    bySeverityResult,
    byFreshnessResult,
    averageResult,
    recentResult,
  ] = await Promise.all([
    pool.query(`SELECT status::text AS status, COUNT(*)::int AS count FROM hazard_reports GROUP BY status`),
    pool.query(`SELECT COUNT(*)::int AS count FROM hazard_reports WHERE received_at >= CURRENT_DATE`),
    pool.query(`SELECT COUNT(*)::int AS count FROM hazard_reports WHERE received_at >= NOW() - INTERVAL '24 hours'`),
    pool.query(`SELECT COALESCE(state_code, 'UNK') AS "stateCode", COUNT(*)::int AS count FROM hazard_reports GROUP BY state_code`),
    pool.query(`SELECT hazard_type::text AS "hazardType", COUNT(*)::int AS count FROM hazard_reports GROUP BY hazard_type`),
    pool.query(`SELECT severity::text AS severity, COUNT(*)::int AS count FROM hazard_reports GROUP BY severity`),
    pool.query(`SELECT freshness_band::text AS "freshnessBand", COUNT(*)::int AS count FROM hazard_reports GROUP BY freshness_band`),
    pool.query(`SELECT COALESCE(AVG(sync_delay_minutes), 0) AS "averageSyncDelay", COALESCE(AVG(confidence_score), 0) AS "averageConfidence" FROM hazard_reports`),
    pool.query(`
      SELECT id, tracking_id AS "trackingId", hazard_type::text AS "hazardType",
             severity::text AS severity, status::text AS status, observed_at AS "observedAt"
      FROM hazard_reports
      ORDER BY received_at DESC
      LIMIT 10
    `),
  ]);

  const statusCounts = new Map<string, number>(
    statusResult.rows.map((row) => [row.status, numberValue(row.count)]),
  );
  const total = [...statusCounts.values()].reduce((sum, count) => sum + count, 0);
  const submitted = statusCounts.get('submitted') ?? 0;
  const underReview =
    submitted +
    (statusCounts.get('screening') ?? 0) +
    (statusCounts.get('under_review') ?? 0);
  const verified = statusCounts.get('verified') ?? 0;
  const rejected = statusCounts.get('rejected') ?? 0;
  const criticalReports = bySeverityResult.rows.find((row) => row.severity === 'critical')?.count ?? 0;

  res.json({
    success: true,
    data: {
      // Frontend-compatible report statistics.
      total,
      submitted,
      underReview,
      verified,
      rejected,
      byHazardType: byHazardResult.rows,
      bySeverity: bySeverityResult.rows,
      byState: byStateResult.rows,
      todayCount: numberValue(todayResult.rows[0]?.count),
      last24Hours: numberValue(last24Result.rows[0]?.count),

      // Additional API summary fields retained for direct consumers.
      totalReports: total,
      reportsToday: numberValue(todayResult.rows[0]?.count),
      awaitingReview: underReview,
      verifiedReports: verified,
      criticalReports: numberValue(criticalReports),
      averageSyncDelay: Number(averageResult.rows[0]?.averageSyncDelay ?? 0),
      averageConfidence: Number(averageResult.rows[0]?.averageConfidence ?? 0),
      reportsByState: byStateResult.rows,
      reportsByHazardType: byHazardResult.rows,
      reportsByFreshnessBand: byFreshnessResult.rows,
      recentActivity: recentResult.rows,
    },
  });
};

export const getTimeline = async (_req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT date_trunc('hour', observed_at) AS hour, COUNT(*)::int AS count
    FROM hazard_reports
    WHERE observed_at >= NOW() - INTERVAL '7 days'
    GROUP BY hour
    ORDER BY hour DESC
  `);
  res.json({ success: true, data: result.rows });
};

export const getStateComparison = async (_req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT
      COALESCE(state_code, 'UNK') AS "stateCode",
      COUNT(*)::int AS total,
      COALESCE(AVG(confidence_score), 0) AS "averageConfidence",
      COUNT(*) FILTER (WHERE status = 'verified')::int AS "verifiedCount"
    FROM hazard_reports
    GROUP BY state_code
  `);
  res.json({ success: true, data: result.rows });
};
