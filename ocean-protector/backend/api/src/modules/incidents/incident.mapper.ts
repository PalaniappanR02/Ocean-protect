import { IncidentRecord, ResponseTeamRecord } from './incident.types';

export const mapIncidentToResponse = (incident: IncidentRecord, isPublicContext: boolean = false) => {
  const base = {
    id: incident.id,
    title: incident.title,
    description: incident.description,
    hazardType: incident.hazardType,
    severity: incident.severity,
    latitude: incident.latitude,
    longitude: incident.longitude,
    stateCode: incident.stateCode,
    districtName: incident.districtName,
    status: incident.status,
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
  };

  if (isPublicContext) {
    return base;
  }

  return {
    ...base,
    coastalRegionId: incident.coastalRegionId,
    isPublic: incident.isPublic,
    publicVisibilityReason: incident.publicVisibilityReason,
    verifiedAt: incident.verifiedAt,
    verifiedBy: incident.verifiedBy,
    resolvedAt: incident.resolvedAt,
  };
};

export const mapTeamToResponse = (team: ResponseTeamRecord) => ({
  id: team.id,
  name: team.name,
  agency: team.agency,
  locationName: team.locationName,
  latitude: team.latitude,
  longitude: team.longitude,
  status: team.status,
  memberCount: team.memberCount,
  capabilities: team.capabilities,
  contactNumber: team.contactNumber,
  isSynthetic: team.isSynthetic,
});