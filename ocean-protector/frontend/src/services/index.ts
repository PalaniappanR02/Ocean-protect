import { reportService as apiReportService } from './report-service';
import { api } from './api-client';
import { mockReportService } from './social-service';
import { mockIncidentService } from './incident-service';
import { mockAlertService } from './alert-service';
import { mockRegionService } from './region-service';
import { mockSocialSignals } from '@/mock/socialSignals';
import { delay } from '@/lib/utils';
import type {
  PublicAlert,
  SocialSignal,
  HazardType,
  Incident,
  IncidentReport,
  ResponseTeam,
  ResponseTeamType,
  CoastalRegion,
  Severity,
} from '@/types';

const useApi = import.meta.env.VITE_DATA_MODE === 'api';

// ---------------------------------------------------------------------------
// Reports — live API in API mode, mock otherwise.
// ---------------------------------------------------------------------------
export const reportService = useApi ? apiReportService : mockReportService;

// ---------------------------------------------------------------------------
// Regions — real API adapter with mock fallback.
// ---------------------------------------------------------------------------
const normaliseRegion = (raw: any): CoastalRegion => ({
  id: raw.id,
  stateCode: raw.stateCode,
  stateName: raw.stateName,
  districtName: raw.districtName,
  displayName: raw.displayName ?? `${raw.districtName}, ${raw.stateName}`,
  primaryLanguageCode: raw.primaryLanguageCode ?? 'en',
  secondaryLanguageCodes: raw.secondaryLanguageCodes ?? [],
  coastalPriority: (raw.coastalPriority as 1 | 2 | 3) ?? 3,
  boundingBox: raw.boundingBox ?? { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 },
  referencePoint: raw.referencePoint ?? { latitude: raw.latitude ?? 0, longitude: raw.longitude ?? 0 },
  latitude: raw.latitude ?? undefined,
  longitude: raw.longitude ?? undefined,
  isActive: raw.isActive ?? true,
  createdAt: raw.createdAt ?? '',
  updatedAt: raw.updatedAt ?? '',
});

const apiRegionService = {
  async list(): Promise<CoastalRegion[]> {
    const response = await api.get<{ success: boolean; data: any[] }>('/api/v1/regions');
    return response.data.map(normaliseRegion);
  },
  async getByState(stateCode: string): Promise<CoastalRegion[]> {
    const response = await api.get<{ success: boolean; data: any[] }>(
      `/api/v1/regions?stateCode=${encodeURIComponent(stateCode)}`,
    );
    return response.data.map(normaliseRegion);
  },
  async getByLocation(lat: number, lon: number): Promise<CoastalRegion | null> {
    try {
      const response = await api.get<{ success: boolean; data: any }>(
        `/api/v1/regions/nearest?lat=${lat}&lon=${lon}`,
      );
      return normaliseRegion(response.data);
    } catch {
      return null;
    }
  },
};

export const regionService = useApi ? (apiRegionService as typeof mockRegionService) : mockRegionService;

// ---------------------------------------------------------------------------
// Incidents — real API adapter with mock fallback. The backend returns a
// flattened incident shape, so responses are normalised to the UI contract.
// ---------------------------------------------------------------------------
export interface IncidentFilters {
  status?: Incident['status'][];
  hazardType?: HazardType[];
  severity?: Severity[];
  stateCode?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
}

const deriveTeamType = (team: any): ResponseTeamType => {
  const haystack = `${team.agency ?? ''} ${team.name ?? ''}`.toLowerCase();
  if (haystack.includes('coast guard')) return 'coast_guard';
  if (haystack.includes('marine police')) return 'marine_police';
  if (haystack.includes('ndrf')) return haystack.includes('marine') ? 'ndrf_marine' : 'ndrf';
  if (haystack.includes('sdma') || haystack.includes('disaster management')) return 'sdma';
  if (haystack.includes('fire')) return 'fire_rescue';
  if (haystack.includes('revenue')) return 'revenue';
  return 'volunteer';
};

const normaliseTeam = (raw: any, incidentId?: string): ResponseTeam => ({
  id: raw.id,
  name: raw.name ?? raw.agency ?? 'Response team',
  type: deriveTeamType(raw),
  stateCode: raw.stateCode ?? undefined,
  districtName: raw.districtName ?? undefined,
  contactNumber: raw.contactNumber ?? undefined,
  memberCount: raw.memberCount ?? 0,
  members: [],
  status: raw.status ?? 'standby',
  assignedAt: raw.assignedAt ?? undefined,
  currentIncidentId: incidentId ?? raw.currentIncidentId ?? undefined,
});

const normaliseIncidentReport = (raw: any): IncidentReport => ({
  reportId: raw.reportId ?? raw.id,
  hazardType: raw.hazardType,
  severity: raw.severity,
  title: raw.title ?? 'Report',
  description: raw.description ?? '',
  isAnonymous: Boolean(raw.isAnonymous),
  reporterName: raw.reporterName ?? undefined,
  location: {
    latitude: raw.latitude ?? raw.location?.latitude ?? 0,
    longitude: raw.longitude ?? raw.location?.longitude ?? 0,
    districtName: raw.districtName ?? raw.location?.districtName ?? 'Unknown',
    stateCode: raw.stateCode ?? raw.location?.stateCode ?? 'UNK',
  },
  observedAt: raw.observedAt ?? raw.createdAt ?? new Date().toISOString(),
  mediaUrls: Array.isArray(raw.mediaUrls) ? raw.mediaUrls : [],
  confidenceScore: raw.confidenceScore ?? undefined,
  status: raw.status ?? 'submitted',
});

const normaliseIncident = (raw: any): Incident => {
  const reports: IncidentReport[] = Array.isArray(raw.reports) ? raw.reports.map(normaliseIncidentReport) : [];
  const rawTeams = Array.isArray(raw.responseTeams)
    ? raw.responseTeams
    : raw.responseTeam
      ? [raw.responseTeam]
      : [];
  const responseTeams = rawTeams.map((team: any) => normaliseTeam(team, raw.id));
  const evidence = Array.isArray(raw.evidence) ? raw.evidence : reports.flatMap((report) => report.mediaUrls);

  return {
    id: raw.id,
    incidentCode: raw.incidentCode ?? `INC-${String(raw.id).slice(0, 8).toUpperCase()}`,
    hazardType: raw.hazardType,
    title: raw.title,
    description: raw.description,
    severity: raw.severity,
    status: raw.status,
    location: {
      latitude: raw.latitude ?? 0,
      longitude: raw.longitude ?? 0,
      districtName: raw.districtName ?? 'Unknown',
      stateCode: raw.stateCode ?? 'UNK',
    },
    latitude: raw.latitude,
    longitude: raw.longitude,
    districtName: raw.districtName,
    stateCode: raw.stateCode,
    startTime: raw.startTime ?? raw.createdAt ?? new Date().toISOString(),
    endTime: raw.endTime,
    resolvedAt: raw.resolvedAt,
    reports,
    reportCount: raw.reportCount ?? reports.length,
    socialSignalIds: raw.socialSignalIds ?? [],
    relatedIncidentIds: raw.relatedIncidentIds ?? [],
    confidenceScore: raw.confidenceScore ?? undefined,
    confidenceFactors: raw.confidenceFactors ?? [],
    analysisExplanation: raw.analysisExplanation,
    publicVisibility: raw.publicVisibility ?? 'private',
    publicVisibilityReason: raw.publicVisibilityReason,
    verifiedBy: raw.verifiedBy,
    verifiedAt: raw.verifiedAt,
    verification: raw.verification,
    screeningCompletedAt: raw.screeningCompletedAt,
    assignedResponseTeamId: raw.assignedResponseTeamId,
    responseTeam: responseTeams[0],
    responseTeams,
    responseTimeline: Array.isArray(raw.responseTimeline) ? raw.responseTimeline : [],
    evidence,
    publicAlert: raw.publicAlert,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
  };
};

const apiIncidentService = {
  async list(filters: IncidentFilters = {}): Promise<Incident[]> {
    const params = new URLSearchParams();
    if (filters.status?.length) params.set('status', filters.status.join(','));
    if (filters.stateCode?.length) params.set('stateCode', filters.stateCode.join(','));
    if (filters.page) params.set('page', String(filters.page));
    if (filters.pageSize) params.set('limit', String(Math.min(filters.pageSize, 100)));

    const response = await api.get<{ success: boolean; data: any[] }>(`/api/v1/incidents?${params.toString()}`);
    let items = response.data.map(normaliseIncident);

    if (filters.hazardType?.length) items = items.filter((item) => filters.hazardType!.includes(item.hazardType));
    if (filters.severity?.length) items = items.filter((item) => filters.severity!.includes(item.severity));
    if (filters.search) {
      const query = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.incidentCode.toLowerCase().includes(query) ||
          item.location.districtName.toLowerCase().includes(query) ||
          item.location.stateCode.toLowerCase().includes(query),
      );
    }

    // Client-side pagination keeps the page contract identical to the mock.
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.max(1, filters.pageSize || items.length || 1);
    return items.slice((page - 1) * pageSize, page * pageSize);
  },

  async getById(id: string): Promise<Incident | null> {
    const response = await api.get<{ success: boolean; data: any }>(`/api/v1/incidents/${id}`);
    return normaliseIncident(response.data);
  },

  async create(input: {
    title: string;
    description: string;
    hazardType: HazardType;
    severity: Severity;
    latitude: number;
    longitude: number;
    stateCode: string;
    districtName: string;
    reportIds: string[];
  }): Promise<Incident> {
    const response = await api.post<{ success: boolean; data: any }>('/api/v1/incidents', input);
    return normaliseIncident(response.data);
  },

  async updateStatus(id: string, status: Incident['status']): Promise<Incident | null> {
    const response = await api.patch<{ success: boolean; data: any }>(`/api/v1/incidents/${id}/status`, {
      status,
      reason: '',
      actorType: 'authority',
      actorName: 'Kadalkavach authority',
    });
    return normaliseIncident(response.data);
  },

  async assignTeam(
    incidentId: string,
    teamInput: string | { name: string; type: ResponseTeamType; members: { id: string; name: string; role: string }[] },
  ): Promise<Incident | null> {
    let teamId: string;
    if (typeof teamInput === 'string') {
      teamId = teamInput;
    } else {
      const teams = await this.getTeams();
      const match = teams.find((team) => team.type === teamInput.type) ?? teams[0];
      if (!match) throw new Error('No matching response team is available to assign.');
      teamId = match.id;
    }
    await api.post(`/api/v1/incidents/${incidentId}/assign-team`, { teamId });
    return this.getById(incidentId);
  },

  async verify(id: string, _analystNotes: string): Promise<Incident | null> {
    await api.post(`/api/v1/incidents/${id}/verify`, { actorName: 'Kadalkavach analyst' });
    return this.getById(id);
  },

  async getTeams(): Promise<ResponseTeam[]> {
    const response = await api.get<{ success: boolean; data: any[] }>('/api/v1/incidents/teams');
    return response.data.map((team) => normaliseTeam(team));
  },
};

export const incidentService = useApi ? (apiIncidentService as typeof mockIncidentService) : mockIncidentService;

// ---------------------------------------------------------------------------
// Social signals — live API in API mode, mock otherwise.
// ---------------------------------------------------------------------------
const severityToUrgency = (severity?: string | null): number => {
  switch (severity) {
    case 'critical': return 92;
    case 'warning': return 72;
    case 'advisory': return 50;
    case 'low': return 25;
    default: return 40;
  }
};

const VALID_PLATFORMS = ['twitter', 'instagram', 'facebook', 'reddit', 'youtube', 'news'];

const mapApiSignal = (raw: any): SocialSignal => ({
  id: raw.id,
  platform: (VALID_PLATFORMS.includes(raw.platform) ? raw.platform : 'twitter') as SocialSignal['platform'],
  postId: raw.id,
  authorUsername: 'community',
  authorDisplayName: raw.dataSource === 'sample_dataset' ? 'Community Monitor' : 'Social Import',
  authorVerified: false,
  content: raw.text,
  languageCode: raw.languageCode || 'en',
  hazardType: raw.hazardType as HazardType | undefined,
  locationName: raw.locationName || undefined,
  latitude: raw.latitude ?? undefined,
  longitude: raw.longitude ?? undefined,
  observedAt: raw.observedAt,
  collectedAt: raw.observedAt,
  relevanceScore: raw.credibilityScore ?? 50,
  urgencyScore: severityToUrgency(raw.inferredSeverity),
  sentimentScore: raw.sentimentScore ?? 0,
  engagementScore: raw.engagementScore ?? undefined,
  misinfoScore: raw.misinfoScore ?? undefined,
  sourceUrl: raw.sourceUrl ?? undefined,
  keywordsMatched: [],
  isMock: raw.isSynthetic ?? true,
  relatedIncidentId: raw.relatedIncidentId || undefined,
  reviewStatus: raw.reviewStatus || 'pending',
  createdAt: raw.observedAt,
});

export interface SocialTrends {
  totalSignals: number;
  relevantSignals: number;
  highUrgency: number;
  avgEngagement?: number;
  avgMisinfo?: number;
  highMisinfo?: number;
  topKeywords: Array<{ word: string; frequency: number }>;
  byPlatform?: Array<{ platform: string; count: number }>;
}

export const socialService = useApi
  ? {
      async list(filters: { minRelevance?: number; minUrgency?: number; platform?: string } = {}) {
        const response = await api.get<{ success: boolean; data: any[] }>('/api/v1/social-signals');
        return response.data
          .map(mapApiSignal)
          .filter(
            (signal) =>
              (signal.relevanceScore ?? 0) >= (filters.minRelevance ?? 0) &&
              (signal.urgencyScore ?? 0) >= (filters.minUrgency ?? 0) &&
              (!filters.platform || signal.platform === filters.platform),
          );
      },
      async getTrends(): Promise<SocialTrends> {
        const response = await api.get<{ success: boolean; data: any }>('/api/v1/social-signals/trends');
        const data = response.data;
        const total = Number(data.totalSignals ?? 0);
        return {
          totalSignals: total,
          relevantSignals: Number(data.byHazardType?.length ?? 0) > 0 ? total : 0,
          highUrgency: Number(data.highUrgency ?? 0),
          avgEngagement: Number(data.avgEngagement ?? 0),
          avgMisinfo: Number(data.avgMisinfo ?? 0),
          highMisinfo: Number(data.highMisinfo ?? 0),
          topKeywords: (data.topKeywords ?? []).map((k: any) => ({
            word: k.word,
            frequency: Number(k.frequency ?? 0),
          })),
          byPlatform: (data.byPlatform ?? []).map((p: any) => ({
            platform: p.platform,
            count: Number(p.count ?? 0),
          })),
        };
      },
      async getHotspots() {
        const response = await api.get<{ success: boolean; data: any[] }>('/api/v1/social-signals/hotspots');
        return response.data;
      },
      async importSignal(input: { text: string; platform?: string; locationName?: string; latitude?: number; longitude?: number; sourceUrl?: string }) {
        const response = await api.post<{ success: boolean; data: any }>('/api/v1/social-signals/import', input);
        return mapApiSignal(response.data);
      },
      async review(signalId: string, reviewStatus: 'confirmed' | 'dismissed', credibilityScore?: number) {
        const response = await api.post<{ success: boolean; data: any }>(`/api/v1/social-signals/${signalId}/review`, {
          reviewStatus,
          credibilityScore,
        });
        return response.data;
      },
    }
  : {
      async list(filters: { minRelevance?: number; minUrgency?: number; platform?: string } = {}) {
        await delay(180);
        return mockSocialSignals.filter(
          (signal) =>
            (signal.relevanceScore ?? 0) >= (filters.minRelevance ?? 0) &&
            (signal.urgencyScore ?? 0) >= (filters.minUrgency ?? 0) &&
            (!filters.platform || signal.platform === filters.platform),
        );
      },
      async getTrends(): Promise<SocialTrends> {
        await delay(120);
        const counts = new Map<string, number>();
        mockSocialSignals
          .flatMap((signal) => signal.keywordsMatched || [])
          .forEach((keyword) => counts.set(keyword, (counts.get(keyword) || 0) + 1));
        return {
          totalSignals: mockSocialSignals.length,
          relevantSignals: mockSocialSignals.filter((signal) => signal.relevanceScore >= 60).length,
          highUrgency: mockSocialSignals.filter((signal) => signal.urgencyScore >= 80).length,
          topKeywords: [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([keyword, count]) => ({ word: keyword, frequency: count })),
        };
      },
      async getHotspots() {
        return [];
      },
      async importSignal() {
        throw new Error('Manual social import requires API mode.');
      },
      async review() {
        throw new Error('Social review requires API mode.');
      },
    };

// ---------------------------------------------------------------------------
// Alerts — live public alerts in API mode, mock otherwise.
// ---------------------------------------------------------------------------
const mapApiAlert = (raw: any): PublicAlert => ({
  id: raw.id,
  alertCode: `ALR-${String(raw.id).slice(0, 8)}`,
  incidentId: raw.incidentId,
  incidentTitle: raw.incidentTitle || 'Official incident',
  hazardType: raw.hazardType || 'other',
  severity: raw.severity,
  stateCode: raw.stateCode || 'UNK',
  districtName: raw.districtName || 'Unknown',
  messageTitle: raw.title,
  messageBody: raw.message,
  safetyInstructions: [],
  affectedAreas: raw.districtName ? [raw.districtName] : [],
  channels: ['web', 'sms', 'push'],
  estimatedReach: 0,
  issuedAt: raw.issuedAt,
  expiresAt: raw.expiresAt,
  acknowledgedCount: 0,
  isActive: raw.isActive ?? true,
  createdAt: raw.issuedAt,
  updatedAt: raw.issuedAt,
});

export const alertService = useApi
  ? {
      async list() {
        const response = await api.get<{ success: boolean; data: any[] }>('/api/v1/public/alerts');
        return response.data.map(mapApiAlert).filter((a) => a.isActive);
      },
      async getById(id: string) {
        const alerts = await this.list();
        return alerts.find((a) => a.id === id) || null;
      },
      async create(input: {
        incidentId: string;
        incidentTitle: string;
        hazardType: any;
        severity: any;
        stateCode: string;
        districtName: string;
        messageTitle: string;
        messageBody: string;
        safetyInstructions: string[];
        affectedAreas: string[];
        channels: any[];
        estimatedReach: number;
        expiresAt?: string;
      }) {
        const response = await api.post<{ success: boolean; data: any }>('/api/v1/alerts', {
          incidentId: input.incidentId,
          title: input.messageTitle,
          message: input.messageBody,
          severity: input.severity,
          expiresAt: input.expiresAt,
        });
        return mapApiAlert(response.data);
      },
      async acknowledge() {
        return null;
      },
      async deactivate(id: string) {
        await api.patch(`/api/v1/alerts/${id}/deactivate`, {});
        return null;
      },
    }
  : mockAlertService;
