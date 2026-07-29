export interface IncidentRecord {
  id: string;
  title: string;
  description: string | null;
  hazardType: string;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
  stateCode: string | null;
  districtName: string | null;
  coastalRegionId: string | null;
  isPublic: boolean;
  publicVisibilityReason: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseTeamRecord {
  id: string;
  name: string;
  agency: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  memberCount: number;
  capabilities: string[];
  contactNumber: string | null;
  isSynthetic: boolean;
}