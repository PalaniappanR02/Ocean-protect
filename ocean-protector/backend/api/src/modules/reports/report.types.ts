export interface ConfidenceFactor {
  code: string;
  label: string;
  rawValue: string;
  pointsAwarded: number;
  maximumPoints: number;
  explanation: string;
  source: string;
  calculatedAt: string;
}

export interface NearbyReportMatch {
  count: number;
  nearestDistanceKm: number;
  relatedReportIds: string[];
  isClusterCandidate: boolean;
}

export interface ReportMediaRecord {
  url: string;
  mimeType: string;
  size: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ReportRecord {
  id: string;
  clientReportId: string;
  trackingId: string;
  hazardType: string;
  title: string;
  description: string;
  languageCode: string;
  reporterName: string | null;
  reporterPhone: string | null;
  isAnonymous: boolean;
  stateCode: string | null;
  districtName: string | null;
  coastalRegionId: string | null;
  latitude: number;
  longitude: number;
  locationAccuracyMetres: number | null;
  locationSource: string;
  observedAt: string;
  receivedAt: string;
  syncedAt: string;
  syncDelayMinutes: number;
  freshnessBand: string;
  severity: string;
  status: string;
  confidenceScore: number;
  analysisMode: string;
  isPublic: boolean;
  isSynthetic: boolean;
  mediaUrls: ReportMediaRecord[];
  createdAt: string;
  updatedAt: string;
}