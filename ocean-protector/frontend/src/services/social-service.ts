import type { HazardReport, PaginatedResponse, ReportStatus, HazardType, Severity } from '@/types';
import { mockReports } from '@/mock/reports';
import { delay, generateTrackingId, generateClientReportId } from '@/lib/utils';

// In-memory store seeded from mock
const reports: HazardReport[] = [...mockReports];

export interface ReportFilters {
  status?: ReportStatus[];
  hazardType?: HazardType[];
  severity?: Severity[];
  stateCode?: string[];
  startDate?: string;
  endDate?: string;
  minConfidence?: number;
  search?: string;
  isPublic?: boolean;
}

export interface ReportQuery {
  page?: number;
  pageSize?: number;
  sortBy?: 'receivedAt' | 'observedAt' | 'confidenceScore' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

const mockReportService = {
  async list(
    filters: ReportFilters = {},
    query: ReportQuery = {}
  ): Promise<PaginatedResponse<HazardReport>> {
    await delay(300);
    let filtered = [...reports];

    if (filters.status?.length) {
      filtered = filtered.filter((r) => filters.status!.includes(r.status));
    }
    if (filters.hazardType?.length) {
      filtered = filtered.filter((r) => filters.hazardType!.includes(r.hazardType));
    }
    if (filters.severity?.length) {
      filtered = filtered.filter((r) => filters.severity!.includes(r.severity));
    }
    if (filters.stateCode?.length) {
      filtered = filtered.filter((r) => filters.stateCode!.includes(r.stateCode));
    }
    if (filters.startDate) {
      filtered = filtered.filter((r) => r.observedAt >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter((r) => r.observedAt <= filters.endDate!);
    }
    if (filters.minConfidence !== undefined) {
      filtered = filtered.filter((r) => (r.confidenceScore || 0) >= filters.minConfidence!);
    }
    if (filters.isPublic !== undefined) {
      filtered = filtered.filter((r) => r.isPublic === filters.isPublic);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.trackingId.toLowerCase().includes(q) ||
          r.districtName.toLowerCase().includes(q)
      );
    }

    const sortBy = query.sortBy || 'receivedAt';
    const sortOrder = query.sortOrder || 'desc';
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'confidenceScore') {
        cmp = (a.confidenceScore || 0) - (b.confidenceScore || 0);
      } else {
        cmp = new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
      }
      return sortOrder === 'desc' ? -cmp : cmp;
    });

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  },

  async getById(id: string): Promise<HazardReport | null> {
    await delay(200);
    return reports.find((r) => r.id === id) || null;
  },

  async getByTrackingId(trackingId: string): Promise<HazardReport | null> {
    await delay(200);
    return reports.find((r) => r.trackingId === trackingId) || null;
  },

  async create(input: {
    clientReportId?: string;
    hazardType: HazardType;
    title: string;
    description: string;
    languageCode: string;
    isAnonymous: boolean;
    reporterName?: string;
    reporterPhone?: string;
    latitude: number;
    longitude: number;
    locationAccuracyMeters?: number;
    locationSource?: 'device_gps' | 'manual' | 'map_pin';
    stateCode: string;
    districtName: string;
    observedAt: string;
    receivedAt?: string;
    mediaUrls?: Array<{ url: string; filename: string; contentType: string; size: number }>;
  }): Promise<HazardReport> {
    await delay(500);
    const now = new Date().toISOString();
    const report: HazardReport = {
      id: `RPT-${Date.now()}`,
      clientReportId: input.clientReportId || generateClientReportId(),
      trackingId: generateTrackingId(),
      hazardType: input.hazardType,
      title: input.title,
      description: input.description,
      languageCode: input.languageCode,
      reportType: 'citizen',
      isAnonymous: input.isAnonymous,
      reporterName: input.isAnonymous ? undefined : input.reporterName,
      reporterPhone: input.isAnonymous ? undefined : input.reporterPhone,
      latitude: input.latitude,
      longitude: input.longitude,
      locationAccuracyMeters: input.locationAccuracyMeters,
      locationSource: input.locationSource || 'device_gps',
      stateCode: input.stateCode,
      districtName: input.districtName,
      observedAt: input.observedAt,
      receivedAt: input.receivedAt || now,
      syncedAt: now,
      mediaUrls: input.mediaUrls || [],
      severity: 'advisory',
      status: 'submitted',
      confidenceScore: 50,
      confidenceFactors: [
        { name: 'Hazard keywords', score: 15, weight: 30 },
        { name: 'Description clarity', score: 10, weight: 20 },
        { name: 'Location accuracy', score: 15, weight: 15 },
        { name: 'Photo evidence', score: 0, weight: 15 },
        { name: 'Reporter reliability', score: 10, weight: 10 },
        { name: 'Language consistency', score: 0, weight: 10 },
      ],
      analysisMode: 'simulated',
      analysisExplanation: 'Simulated initial assessment — pending AI classification.',
      keywordsMatched: [],
      isPublic: false,
      socialPostIds: [],
      createdAt: now,
      updatedAt: now,
      isSynthetic: true,
    };
    reports.unshift(report);
    return report;
  },

  async updateStatus(
    id: string,
    status: ReportStatus,
    metadata?: { verifiedBy?: string; rejectionReason?: string }
  ): Promise<HazardReport | null> {
    await delay(300);
    const report = reports.find((r) => r.id === id);
    if (!report) return null;
    report.status = status;
    if (metadata?.verifiedBy) {
      report.verifiedBy = metadata.verifiedBy;
      report.verifiedAt = new Date().toISOString();
    }
    if (metadata?.rejectionReason) {
      report.rejectionReason = metadata.rejectionReason;
    }
    if (status === 'verified') {
      report.isPublic = report.severity !== 'low';
      report.publicVisibilityReason = 'Verified by analyst';
    }
    report.updatedAt = new Date().toISOString();
    return report;
  },

  async recalculateConfidence(id: string): Promise<HazardReport | null> {
    await delay(800);
    const report = reports.find((r) => r.id === id);
    if (!report) return null;
    // Simulate confidence recalculation
    const baseScore = report.confidenceScore || 50;
    const variation = Math.floor(Math.random() * 10) - 3;
    report.confidenceScore = Math.min(99, Math.max(30, baseScore + variation));
    report.updatedAt = new Date().toISOString();
    return report;
  },

  async getDashboardStats(): Promise<{
    total: number;
    submitted: number;
    underReview: number;
    verified: number;
    rejected: number;
    byHazardType: Array<{ hazardType: HazardType; count: number }>;
    bySeverity: Array<{ severity: Severity; count: number }>;
    byState: Array<{ stateCode: string; count: number }>;
    todayCount: number;
    last24Hours: number;
  }> {
    await delay(200);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last24h = new Date(now.getTime() - 24 * 3600000);

    const byHazardTypeMap = new Map<HazardType, number>();
    const bySeverityMap = new Map<Severity, number>();
    const byStateMap = new Map<string, number>();

    let todayCount = 0;
    let last24Hours = 0;
    let submitted = 0;
    let underReview = 0;
    let verified = 0;
    let rejected = 0;

    for (const r of reports) {
      byHazardTypeMap.set(r.hazardType, (byHazardTypeMap.get(r.hazardType) || 0) + 1);
      bySeverityMap.set(r.severity, (bySeverityMap.get(r.severity) || 0) + 1);
      byStateMap.set(r.stateCode, (byStateMap.get(r.stateCode) || 0) + 1);

      if (new Date(r.receivedAt) >= today) todayCount++;
      if (new Date(r.receivedAt) >= last24h) last24Hours++;

      if (r.status === 'submitted') submitted++;
      else if (r.status === 'under_review' || r.status === 'screening') underReview++;
      else if (r.status === 'verified') verified++;
      else if (r.status === 'rejected') rejected++;
    }

    return {
      total: reports.length,
      submitted,
      underReview,
      verified,
      rejected,
      byHazardType: Array.from(byHazardTypeMap.entries()).map(([hazardType, count]) => ({ hazardType, count })),
      bySeverity: Array.from(bySeverityMap.entries()).map(([severity, count]) => ({ severity, count })),
      byState: Array.from(byStateMap.entries()).map(([stateCode, count]) => ({ stateCode, count })),
      todayCount,
      last24Hours,
    };
  },
};

export { mockReportService };