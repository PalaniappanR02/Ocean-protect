import type { ReportRecord } from './report.types';

export const mapReportToResponse = (
  report: ReportRecord,
  isPublicContext = false,
) => {
  const base = {
    id: report.id,
    clientReportId: report.clientReportId,
    trackingId: report.trackingId,
    hazardType: report.hazardType,
    title: report.title,
    description: report.description,
    languageCode: report.languageCode,
    isAnonymous: report.isAnonymous,
    stateCode: report.stateCode ?? 'UNK',
    districtName: report.districtName ?? 'Unknown',
    coastalRegionId: report.coastalRegionId,
    latitude: Number(report.latitude),
    longitude: Number(report.longitude),
    locationAccuracyMetres: report.locationAccuracyMetres,
    locationSource: report.locationSource,
    observedAt: report.observedAt,
    receivedAt: report.receivedAt,
    syncedAt: report.syncedAt,
    syncDelayMinutes: report.syncDelayMinutes,
    freshnessBand: report.freshnessBand,
    severity: report.severity,
    status: report.status,
    confidenceScore: report.confidenceScore,
    analysisMode: report.analysisMode,
    isPublic: report.isPublic,
    isSynthetic: report.isSynthetic,
    mediaUrls: [],
    socialPostIds: [],
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };

  if (isPublicContext || report.isAnonymous) return base;
  return {
    ...base,
    reporterName: report.reporterName,
    reporterPhone: report.reporterPhone,
  };
};
