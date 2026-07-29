import type {
  Incident,
  IncidentStatus,
  HazardType,
  Severity,
  ResponseTeam,
  ResponseTeamMember,
  ResponseTeamType,
} from '@/types';
import { mockIncidents } from '@/mock/incidents';
import { delay, generateIncidentCode } from '@/lib/utils';

const normalizeIncident = (incident: Incident): Incident => {
  const responseTeams = incident.responseTeams || (incident.responseTeam ? [incident.responseTeam] : []);
  const evidence = incident.evidence || incident.reports.flatMap((report) => report.mediaUrls || []);
  return {
    ...incident,
    latitude: incident.location.latitude,
    longitude: incident.location.longitude,
    districtName: incident.location.districtName,
    stateCode: incident.location.stateCode,
    reportCount: incident.reportCount ?? incident.reports.length,
    responseTeams,
    responseTeam: incident.responseTeam || responseTeams[0],
    evidence,
    confidenceFactors: incident.confidenceFactors || [],
    analysisExplanation:
      incident.analysisExplanation ||
      'Confidence combines citizen reports, timing, location quality, and corroborating public signals.',
  };
};

const incidents: Incident[] = mockIncidents.map(normalizeIncident);

export interface IncidentFilters {
  status?: IncidentStatus[];
  hazardType?: HazardType[];
  severity?: Severity[];
  stateCode?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
}

const mockIncidentService = {
  async list(filters: IncidentFilters = {}): Promise<Incident[]> {
    await delay(250);
    let filtered = incidents.map(normalizeIncident);

    if (filters.status?.length) filtered = filtered.filter((item) => filters.status!.includes(item.status));
    if (filters.hazardType?.length) filtered = filtered.filter((item) => filters.hazardType!.includes(item.hazardType));
    if (filters.severity?.length) filtered = filtered.filter((item) => filters.severity!.includes(item.severity));
    if (filters.stateCode?.length) filtered = filtered.filter((item) => filters.stateCode!.includes(item.location.stateCode));
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(query) ||
        item.incidentCode.toLowerCase().includes(query) ||
        item.location.districtName.toLowerCase().includes(query) ||
        item.location.stateCode.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.max(1, filters.pageSize || filtered.length || 1);
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  },

  async getById(id: string): Promise<Incident | null> {
    await delay(150);
    const incident = incidents.find((item) => item.id === id);
    return incident ? normalizeIncident(incident) : null;
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
    await delay(350);
    const now = new Date().toISOString();
    const incident: Incident = normalizeIncident({
      id: `INC-${Date.now()}`,
      incidentCode: generateIncidentCode(),
      title: input.title,
      description: input.description,
      hazardType: input.hazardType,
      severity: input.severity,
      status: 'candidate',
      location: {
        latitude: input.latitude,
        longitude: input.longitude,
        stateCode: input.stateCode,
        districtName: input.districtName,
      },
      startTime: now,
      reports: [],
      reportCount: input.reportIds.length,
      confidenceScore: 50,
      publicVisibility: 'private',
      responseTimeline: [{
        id: `TL-${Date.now()}`,
        actionType: 'created',
        description: 'Incident created by analyst',
        actorName: 'Demo Analyst',
        actorRole: 'analyst',
        timestamp: now,
      }],
      socialSignalIds: [],
      relatedIncidentIds: [],
      createdAt: now,
      updatedAt: now,
    });
    incidents.unshift(incident);
    return incident;
  },

  async updateStatus(id: string, status: IncidentStatus): Promise<Incident | null> {
    await delay(220);
    const incident = incidents.find((item) => item.id === id);
    if (!incident) return null;

    const now = new Date().toISOString();
    incident.status = status;
    incident.updatedAt = now;

    const descriptions: Partial<Record<IncidentStatus, string>> = {
      under_review: 'Incident moved to analyst review',
      verified: 'Incident verified by analyst',
      assigned: 'Response team assigned',
      responding: 'Emergency response started',
      monitoring: 'Incident moved to monitoring phase',
      resolved: 'Incident resolved',
      cancelled: 'Incident cancelled',
    };

    if (status === 'verified') {
      incident.verifiedBy = 'Demo Analyst';
      incident.verifiedAt = now;
      incident.verification = {
        analystName: 'Demo Analyst',
        analystNotes: incident.verification?.analystNotes,
        verifiedAt: now,
      };
      incident.publicVisibility = 'public';
    }
    if (status === 'resolved') {
      incident.endTime = now;
      incident.resolvedAt = now;
    }

    incident.responseTimeline.push({
      id: `TL-${Date.now()}`,
      actionType: status,
      description: descriptions[status] || `Incident status changed to ${status}`,
      actorName: 'Demo Authority User',
      actorRole: 'authority',
      timestamp: now,
    });

    return normalizeIncident(incident);
  },

  async assignTeam(
    incidentId: string,
    teamInput: string | { name: string; type: ResponseTeamType; members: ResponseTeamMember[] }
  ): Promise<Incident | null> {
    await delay(250);
    const incident = incidents.find((item) => item.id === incidentId);
    if (!incident) return null;

    const now = new Date().toISOString();
    const team: ResponseTeam = typeof teamInput === 'string'
      ? {
          id: teamInput,
          name: `Response Team ${teamInput}`,
          type: 'volunteer',
          memberCount: 0,
          status: 'deployed',
          assignedAt: now,
          currentIncidentId: incidentId,
        }
      : {
          id: `TEAM-${Date.now()}`,
          name: teamInput.name,
          type: teamInput.type,
          members: teamInput.members,
          memberCount: teamInput.members.length,
          status: 'deployed',
          assignedAt: now,
          currentIncidentId: incidentId,
          districtName: incident.location.districtName,
          stateCode: incident.location.stateCode,
        };

    incident.assignedResponseTeamId = team.id;
    incident.responseTeam = team;
    incident.responseTeams = [...(incident.responseTeams || []), team];
    incident.status = 'assigned';
    incident.updatedAt = now;
    incident.responseTimeline.push({
      id: `TL-${Date.now()}`,
      actionType: 'team_alerted',
      description: `${team.name} assigned and alerted`,
      actorName: 'Demo Analyst',
      actorRole: 'analyst',
      timestamp: now,
    });
    return normalizeIncident(incident);
  },

  async verify(id: string, analystNotes: string): Promise<Incident | null> {
    const incident = incidents.find((item) => item.id === id);
    if (!incident) return null;
    incident.verification = {
      analystName: 'Demo Analyst',
      analystNotes,
      verifiedAt: new Date().toISOString(),
    };
    return this.updateStatus(id, 'verified');
  },
};

export { mockIncidentService };
