import { api } from './api-client';
import type {
  ApiResponse,
  HazardReport,
  HazardType,
  PaginatedResponse,
  ReportStatus,
  Severity,
} from '@/types';

export interface CreateReportInput {
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
  mediaUrls?: Array<{
    url: string;
    filename: string;
    contentType: string;
    size: number;
  }>;
}

export interface ReportFilters {
  status?: ReportStatus[];
  hazardType?: HazardType[];
  severity?: Severity[];
  stateCode?: string[];
  districtName?: string[];
  startDate?: string;
  endDate?: string;
  minConfidence?: number;
  search?: string;
  isPublic?: boolean;
}

export interface ReportQuery {
  page?: number;
  pageSize?: number;
  sortBy?: 'receivedAt' | 'observedAt' | 'confidenceScore' | 'severity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
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
}

interface ApiReport extends Omit<HazardReport, 'locationAccuracyMeters' | 'mediaUrls' | 'socialPostIds'> {
  locationAccuracyMetres?: number;
  locationAccuracyMeters?: number;
  mediaUrls?: HazardReport['mediaUrls'] | string[];
  socialPostIds?: string[];
}

interface ReportListResponse extends ApiResponse<ApiReport[]> {
  meta?: {
    page?: number;
    limit?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normaliseMedia = (media: ApiReport['mediaUrls']): HazardReport['mediaUrls'] => {
  if (!Array.isArray(media)) return [];
  return media.map((item) => {
    if (typeof item === 'string') {
      return {
        url: item,
        filename: item.split('/').pop() || 'attachment',
        contentType: 'application/octet-stream',
        size: 0,
      };
    }
    return item;
  });
};

const normaliseReport = (raw: ApiReport): HazardReport => ({
  ...raw,
  stateCode: raw.stateCode || 'UNK',
  districtName: raw.districtName || 'Unknown',
  locationAccuracyMeters: raw.locationAccuracyMeters ?? raw.locationAccuracyMetres,
  mediaUrls: normaliseMedia(raw.mediaUrls),
  socialPostIds: raw.socialPostIds ?? [],
  isPublic: Boolean(raw.isPublic),
  analysisMode: raw.analysisMode ?? 'rule_based',
  createdAt: raw.createdAt ?? raw.receivedAt,
  updatedAt: raw.updatedAt ?? raw.receivedAt,
});

const addListParam = (params: URLSearchParams, key: string, values?: readonly string[]) => {
  if (values?.length) params.set(key, values.join(','));
};

const buildListQuery = (filters: ReportFilters, query: ReportQuery): string => {
  const params = new URLSearchParams();
  addListParam(params, 'status', filters.status);
  addListParam(params, 'hazardType', filters.hazardType);
  addListParam(params, 'severity', filters.severity);
  addListParam(params, 'state', filters.stateCode);
  addListParam(params, 'district', filters.districtName);

  if (filters.startDate) params.set('observedFrom', filters.startDate);
  if (filters.endDate) params.set('observedTo', filters.endDate);
  if (filters.minConfidence !== undefined) params.set('minConfidence', String(filters.minConfidence));
  if (filters.search) params.set('search', filters.search);
  if (filters.isPublic !== undefined) params.set('isPublic', String(filters.isPublic));

  params.set('page', String(query.page ?? 1));
  params.set('limit', String(query.pageSize ?? 20));
  params.set('sortBy', query.sortBy ?? 'receivedAt');
  params.set('sortOrder', query.sortOrder ?? 'desc');
  return params.toString();
};

export const reportService = {
  async create(input: CreateReportInput): Promise<HazardReport> {
    const payload = {
      clientReportId: input.clientReportId ?? crypto.randomUUID(),
      hazardType: input.hazardType,
      title: input.title,
      description: input.description,
      languageCode: input.languageCode,
      isAnonymous: input.isAnonymous,
      reporterName: input.isAnonymous ? undefined : input.reporterName,
      reporterPhone: input.isAnonymous ? undefined : input.reporterPhone,
      latitude: input.latitude,
      longitude: input.longitude,
      locationAccuracyMetres: input.locationAccuracyMeters,
      locationSource: input.locationSource ?? 'device_gps',
      observedAt: input.observedAt,
      severity: 'advisory' as Severity,
      mediaUrls: (input.mediaUrls ?? []).map((media) => media.url),
    };

    const response = await api.post<ApiResponse<ApiReport>>('/api/v1/reports', payload);
    return normaliseReport(response.data);
  },

  async list(
    filters: ReportFilters = {},
    query: ReportQuery = {},
  ): Promise<PaginatedResponse<HazardReport>> {
    const response = await api.get<ReportListResponse>(
      `/api/v1/reports?${buildListQuery(filters, query)}`,
    );
    const page = response.meta?.page ?? query.page ?? 1;
    const pageSize = response.meta?.limit ?? response.meta?.pageSize ?? query.pageSize ?? 20;
    const total = response.meta?.total ?? response.data.length;

    return {
      items: response.data.map(normaliseReport),
      total,
      page,
      pageSize,
      totalPages: response.meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(id: string): Promise<HazardReport> {
    const response = await api.get<ApiResponse<ApiReport>>(`/api/v1/reports/${id}`);
    return normaliseReport(response.data);
  },

  async getByTrackingId(trackingId: string): Promise<HazardReport> {
    const response = await api.get<ApiResponse<ApiReport>>(
      `/api/v1/reports/tracking/${encodeURIComponent(trackingId)}`,
    );
    return normaliseReport(response.data);
  },

  async updateStatus(
    id: string,
    status: ReportStatus,
    metadata?: {
      verifiedBy?: string;
      rejectionReason?: string;
      publicVisibilityReason?: string;
    },
  ): Promise<HazardReport> {
    const response = await api.patch<ApiResponse<ApiReport>>(
      `/api/v1/reports/${id}/status`,
      {
        status,
        reason: metadata?.rejectionReason ?? metadata?.publicVisibilityReason ?? '',
        actorType: 'analyst',
        actorName: metadata?.verifiedBy ?? 'OceanGuard analyst',
      },
    );
    return normaliseReport(response.data);
  },

  async recalculateConfidence(id: string): Promise<HazardReport> {
    const response = await api.post<ApiResponse<ApiReport>>(
      `/api/v1/reports/${id}/recalculate-confidence`,
    );
    return normaliseReport(response.data);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/api/v1/dashboard/summary');
    return {
      ...response.data,
      total: asNumber(response.data.total),
      submitted: asNumber(response.data.submitted),
      underReview: asNumber(response.data.underReview),
      verified: asNumber(response.data.verified),
      rejected: asNumber(response.data.rejected),
      todayCount: asNumber(response.data.todayCount),
      last24Hours: asNumber(response.data.last24Hours),
      byHazardType: (response.data.byHazardType ?? []).map((item) => ({
        hazardType: item.hazardType,
        count: asNumber(item.count),
      })),
      bySeverity: (response.data.bySeverity ?? []).map((item) => ({
        severity: item.severity,
        count: asNumber(item.count),
      })),
      byState: (response.data.byState ?? []).map((item) => ({
        stateCode: item.stateCode || 'UNK',
        count: asNumber(item.count),
      })),
    };
  },
};
