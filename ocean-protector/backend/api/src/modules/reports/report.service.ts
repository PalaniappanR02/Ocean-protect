import {
  createReport,
  findNearbyReports,
  findReportByClientId,
  findReportById,
  replaceConfidenceFactors,
  saveConfidenceFactors,
  saveReportMedia,
  updateReportConfidence,
  updateReportStatus as updateReportStatusRecord,
} from './report.repository';
import { findNearestRegion } from '../regions/region.repository';
import { calculateConfidence, calculateFreshnessBand } from '../confidence/confidence.service';
import { ConflictError, NotFoundError } from '../../common/errors/AppError';
import { io } from '../../realtime/socket';
import { createAuditEvent } from '../audit/audit.repository';
import type { CreateReportInput } from './report.schema';

export const createReportService = async (data: CreateReportInput, reporterUserId?: string | null) => {
  const existing = await findReportByClientId(data.clientReportId);
  if (existing) return { report: existing, duplicatePrevented: true };

  const receivedAt = new Date().toISOString();
  const syncedAt = receivedAt;
  const observedDate = new Date(data.observedAt);
  const syncDelayMinutes = Math.max(
    0,
    Math.round((new Date(syncedAt).getTime() - observedDate.getTime()) / 60_000),
  );
  const freshnessBand = calculateFreshnessBand(syncDelayMinutes);

  const region = await findNearestRegion(data.latitude, data.longitude);
  const nearbyMatch = await findNearbyReports(
    data.latitude,
    data.longitude,
    data.hazardType,
    data.observedAt,
  );

  const { score, factors, analysisMode } = await calculateConfidence(
    {
      ...data,
      syncDelayMinutes,
      coastalRegionId: region?.id,
    },
    nearbyMatch,
  );

  const trackingId = `OG-${region?.stateCode || 'UNK'}-${Date.now().toString().slice(-6)}`;
  const report = await createReport(
    {
      ...data,
      receivedAt,
      syncedAt,
      trackingId,
      analysisMode,
    },
    region,
    score,
    freshnessBand,
    syncDelayMinutes,
    reporterUserId,
  );

  await saveConfidenceFactors(report.id, factors);
  await saveReportMedia(report.id, data.mediaUrls ?? []);
  await createAuditEvent(
    'report',
    report.id,
    'CREATED',
    null,
    { trackingId: report.trackingId, hazardType: report.hazardType },
    'Citizen hazard report created.',
    'citizen',
    reporterUserId ?? 'anonymous',
  );
  io?.emit('report.created', {
    reportId: report.id,
    trackingId: report.trackingId,
    hazardType: report.hazardType,
  });

  return { report, duplicatePrevented: false };
};

export const updateReportStatusService = async (
  reportId: string,
  newStatus: string,
  reason: string,
  actorType: string,
  actorName: string,
) => {
  const report = await findReportById(reportId);
  if (!report) throw new NotFoundError('Report not found');

  try {
    const updated = await updateReportStatusRecord(
      reportId,
      newStatus,
      reason,
      actorType,
      actorName,
    );
    await createAuditEvent(
      'report',
      reportId,
      'STATUS_CHANGED',
      { status: report.status },
      { status: updated.status },
      reason,
      actorType,
      actorName,
    );
    io?.emit('report.statusChanged', {
      reportId,
      previousStatus: report.status,
      newStatus: updated.status,
    });
    return updated;
  } catch (error) {
    throw new ConflictError((error as Error).message);
  }
};

export const recalculateReportConfidenceService = async (reportId: string) => {
  const report = await findReportById(reportId);
  if (!report) throw new NotFoundError('Report not found');

  const nearbyMatch = await findNearbyReports(
    report.latitude,
    report.longitude,
    report.hazardType,
    report.observedAt,
  );
  const { score, factors, analysisMode } = await calculateConfidence(
    { ...report, mediaUrls: [] },
    nearbyMatch,
  );

  await replaceConfidenceFactors(report.id, factors);
  const updated = await updateReportConfidence(report.id, score, analysisMode);
  if (!updated) throw new NotFoundError('Report not found after recalculation');

  await createAuditEvent(
    'report',
    reportId,
    'CONFIDENCE_UPDATED',
    { confidenceScore: report.confidenceScore },
    { confidenceScore: updated.confidenceScore },
    'Confidence score recalculated.',
    'analyst',
    'system',
  );
  io?.emit('report.confidenceChanged', {
    reportId,
    confidenceScore: updated.confidenceScore,
  });
  return updated;
};
