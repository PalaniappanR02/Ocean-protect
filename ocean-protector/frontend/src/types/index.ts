export const hazardTypes = [
  'high_waves', 'tsunami', 'coastal_flooding', 'storm_surge', 'oil_spill',
  'abnormal_tide', 'marine_pollution', 'coastal_erosion', 'damaged_vessel',
  'strong_current', 'person_in_danger', 'other',
] as const;
export type HazardType = (typeof hazardTypes)[number];

export const severityLevels = ['low', 'advisory', 'warning', 'critical'] as const;
export type Severity = (typeof severityLevels)[number];

export type ReportStatus = 'submitted' | 'screening' | 'under_review' | 'verified' | 'rejected' | 'duplicate' | 'merged_into_incident' | 'action_initiated' | 'resolved';
export type IncidentStatus = 'candidate' | 'under_review' | 'verified' | 'assigned' | 'responding' | 'monitoring' | 'resolved' | 'cancelled';
export type LocationSource = 'device_gps' | 'manual' | 'map_pin';
export type AnalysisMode = 'rule_based' | 'human_reviewed' | 'sample_dataset' | 'simulated';

export interface MediaUrl {
  url: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt?: string;
}

export interface ConfidenceFactor {
  name: string;
  score: number;
  weight: number;
  rawValue?: string | number | boolean;
  explanation?: string;
}

export interface HazardReport {
  id: string;
  clientReportId: string;
  trackingId: string;
  hazardType: HazardType;
  title: string;
  description: string;
  languageCode: string;
  reportType?: 'citizen' | 'social' | 'sensor';
  isAnonymous: boolean;
  reporterName?: string;
  reporterPhone?: string;
  latitude: number;
  longitude: number;
  locationAccuracyMeters?: number;
  locationSource: LocationSource;
  stateCode: string;
  districtName: string;
  coastalRegionId?: string;
  observedAt: string;
  receivedAt: string;
  syncedAt?: string;
  syncDelayMinutes?: number;
  freshnessBand?: 'fresh' | 'recent' | 'delayed' | 'stale';
  severity: Severity;
  status: ReportStatus;
  confidenceScore?: number;
  confidenceFactors?: ConfidenceFactor[];
  analysisMode: AnalysisMode;
  analysisExplanation?: string;
  keywordsMatched?: string[];
  isPublic: boolean;
  publicVisibilityReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  assignedIncidentId?: string;
  socialPostIds: string[];
  mediaUrls: MediaUrl[];
  isSynthetic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialSignal {
  id: string;
  platform: 'twitter' | 'instagram' | 'facebook';
  postId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorVerified: boolean;
  content: string;
  languageCode: string;
  mediaUrls?: MediaUrl[];
  hazardType?: HazardType;
  isHazardRelevant?: boolean;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracyKm?: number;
  observedAt: string;
  collectedAt: string;
  relevanceScore: number;
  urgencyScore: number;
  sentimentScore: number;
  keywordsMatched: string[];
  supportedByImages?: boolean;
  classifierVersion?: string;
  analysisMode?: AnalysisMode;
  isMock: boolean;
  matchedIncidentId?: string;
  matchedReportId?: string;
  relatedIncidentId?: string;
  relatedReportIds?: string[];
  sourceUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  districtName: string;
  stateCode: string;
  locationName?: string;
}

export interface IncidentReport {
  reportId: string;
  hazardType: HazardType;
  severity: Severity;
  title: string;
  description: string;
  isAnonymous: boolean;
  reporterName?: string;
  location: GeoLocation;
  observedAt: string;
  mediaUrls: MediaUrl[];
  confidenceScore?: number;
  status: ReportStatus;
}

export interface ResponseTimelineEntry {
  id: string;
  actionType: string;
  description: string;
  actorName?: string;
  actorRole?: string;
  timestamp: string;
}

export type ResponseTeamType = 'ndrf' | 'sdma' | 'ndrf_marine' | 'coast_guard' | 'marine_police' | 'fire_rescue' | 'revenue' | 'revenue_dept' | 'volunteer';
export interface ResponseTeamMember { id: string; name: string; role: string; phone?: string; }
export interface ResponseTeam {
  id: string;
  name: string;
  type: ResponseTeamType;
  stateCode?: string;
  districtName?: string;
  contactNumber?: string;
  memberCount: number;
  members?: ResponseTeamMember[];
  status: 'standby' | 'alerted' | 'deployed' | 'stood_down';
  assignedAt?: string;
  currentIncidentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncidentVerification {
  analystName?: string;
  analystNotes?: string;
  verifiedAt?: string;
}

export interface IncidentPublicAlert {
  publishedAt?: string;
  reachEstimate?: number;
}

export interface Incident {
  id: string;
  incidentCode: string;
  hazardType: HazardType;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  location: GeoLocation;
  startTime: string;
  endTime?: string;
  resolvedAt?: string;
  reports: IncidentReport[];
  reportCount: number;
  socialSignalIds: string[];
  relatedIncidentIds: string[];
  confidenceScore: number;
  confidenceFactors?: ConfidenceFactor[];
  analysisExplanation?: string;
  publicVisibility: 'private' | 'auto' | 'public';
  publicVisibilityReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verification?: IncidentVerification;
  screeningCompletedAt?: string;
  assignedResponseTeamId?: string;
  responseTeam?: ResponseTeam;
  responseTeams?: ResponseTeam[];
  responseTimeline: ResponseTimelineEntry[];
  evidence?: MediaUrl[];
  publicAlert?: IncidentPublicAlert;
  createdAt: string;
  updatedAt: string;
  // Derived aliases used by some UI screens and API responses.
  latitude?: number;
  longitude?: number;
  districtName?: string;
  stateCode?: string;
}

export interface PublicAlert {
  id: string;
  alertCode: string;
  incidentId: string;
  incidentTitle: string;
  hazardType: HazardType;
  severity: Severity;
  stateCode: string;
  districtName: string;
  messageTitle: string;
  messageBody: string;
  safetyInstructions: string[];
  affectedAreas: string[];
  channels: Array<'sms' | 'push' | 'web' | 'email' | 'radio'>;
  estimatedReach: number;
  issuedAt: string;
  expiresAt?: string;
  acknowledgedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoastalRegion {
  id: string;
  stateCode: string;
  stateName: string;
  districtName: string;
  displayName?: string;
  primaryLanguageCode: string;
  secondaryLanguageCodes: string[];
  coastalPriority: 1 | 2 | 3;
  boundingBox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  referencePoint: { latitude: number; longitude: number };
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { total?: number; page?: number; limit?: number; pageSize?: number; totalPages?: number; requestId?: string; timestamp?: string };
  error?: { code: string; message: string; details?: Record<string, unknown> };
}
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface ApiError extends Error { status: number; code: string; details?: Record<string, unknown>; }

export type UserRole = 'citizen' | 'analyst' | 'authority';
export interface User { id: string; role: UserRole; name: string; email: string; phone?: string; stateCode?: string; districtName?: string; }
export interface Toast { id: string; title: string; description?: string; variant: 'default' | 'info' | 'success' | 'destructive' | 'warning'; }

export interface OfflineQueueItem {
  id: string;
  clientReportId: string;
  trackingId?: string;
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
  locationSource: LocationSource;
  stateCode: string;
  districtName: string;
  observedAt: string;
  receivedAt: string;
  mediaUrls: MediaUrl[];
  state: 'saved_offline' | 'waiting_for_signal' | 'syncing' | 'synced' | 'sync_failed';
  syncAttempts: number;
  lastSyncAttemptAt?: string;
  syncDelayMinutes?: number;
  syncError?: string;
  createdAt: string;
  updatedAt: string;
}

export const HAZARD_TYPE_LABELS: Record<HazardType, string> = {
  high_waves: 'High Waves', tsunami: 'Tsunami', coastal_flooding: 'Coastal Flooding', storm_surge: 'Storm Surge', oil_spill: 'Oil Spill', abnormal_tide: 'Abnormal Tide', marine_pollution: 'Marine Pollution', coastal_erosion: 'Coastal Erosion', damaged_vessel: 'Damaged Vessel', strong_current: 'Strong Current', person_in_danger: 'Person in Danger', other: 'Other Hazard',
};
export const SEVERITY_LABELS: Record<Severity, string> = { low: 'Low', advisory: 'Advisory', warning: 'Warning', critical: 'Critical' };
export const SEVERITY_COLORS: Record<Severity, string> = {
  low: 'var(--color-success)',
  advisory: 'var(--color-warning)',
  warning: 'var(--color-warning)',
  critical: 'var(--color-danger)',
};
export const SEVERITY_ORDER: Severity[] = ['critical', 'warning', 'advisory', 'low'];
export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = { submitted: 'Submitted', screening: 'Screening', under_review: 'Under Review', verified: 'Verified', rejected: 'Rejected', duplicate: 'Duplicate', merged_into_incident: 'Merged into Incident', action_initiated: 'Action Initiated', resolved: 'Resolved' };
export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = { candidate: 'Candidate', under_review: 'Under Review', verified: 'Verified', assigned: 'Assigned', responding: 'Responding', monitoring: 'Monitoring', resolved: 'Resolved', cancelled: 'Cancelled' };
export const INCIDENT_STATUS_OPTIONS = (Object.entries(INCIDENT_STATUS_LABELS) as Array<[IncidentStatus, string]>).map(([value, label]) => ({ value, label }));
export const RESPONSE_TEAM_TYPE_LABELS: Record<ResponseTeamType, string> = { ndrf: 'NDRF', sdma: 'SDMA', ndrf_marine: 'NDRF Marine', coast_guard: 'Coast Guard', marine_police: 'Marine Police', fire_rescue: 'Fire & Rescue', revenue: 'Revenue Department', revenue_dept: 'Revenue Department', volunteer: 'Volunteer Team' };
