import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';
import type { HazardType, Severity } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy · h:mm a');
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'h:mm a');
}

export function generateClientReportId(): string {
  return crypto.randomUUID();
}

export function generateTrackingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OG-${timestamp}-${random}`;
}

export function getFreshnessBand(observedAt: string, receivedAt?: string): 'fresh' | 'recent' | 'delayed' | 'stale' {
  const received = receivedAt ? new Date(receivedAt) : new Date();
  const minutes = differenceInMinutes(received, new Date(observedAt));

  if (minutes <= 30) return 'fresh';
  if (minutes <= 120) return 'recent';
  if (minutes <= 720) return 'delayed'; // 12 hours
  return 'stale';
}

export function getHazardTypeLabel(hazardType: HazardType): string {
  const labels: Record<HazardType, string> = {
    high_waves: 'High Waves',
    tsunami: 'Tsunami Warning',
    coastal_flooding: 'Coastal Flooding',
    storm_surge: 'Storm Surge',
    oil_spill: 'Oil Spill',
    abnormal_tide: 'Abnormal Tide',
    marine_pollution: 'Marine Pollution',
    coastal_erosion: 'Coastal Erosion',
    damaged_vessel: 'Damaged Vessel',
    strong_current: 'Strong Current',
    person_in_danger: 'Person in Danger',
    other: 'Other Hazard',
  };
  return labels[hazardType] || hazardType;
}

export function getHazardTypeIcon(hazardType: HazardType): string {
  const icons: Record<HazardType, string> = {
    high_waves: '🌊',
    tsunami: '🌊',
    coastal_flooding: '🌊',
    storm_surge: '🌊',
    oil_spill: '🛢️',
    abnormal_tide: '🌊',
    marine_pollution: '🗑️',
    coastal_erosion: '🪨',
    damaged_vessel: '🚢',
    strong_current: '💨',
    person_in_danger: '🆘',
    other: '⚠️',
  };
  return icons[hazardType] || '⚠️';
}

export function getSeverityColor(severity: Severity): string {
  const colors: Record<Severity, string> = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    advisory: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    warning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[severity];
}

export function getSeverityLabel(severity: Severity): string {
  const labels: Record<Severity, string> = {
    low: 'Low',
    advisory: 'Advisory',
    warning: 'Warning',
    critical: 'Critical',
  };
  return labels[severity];
}

export function getReportStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    submitted: 'Submitted',
    screening: 'AI Screening',
    under_review: 'Under Review',
    verified: 'Verified',
    rejected: 'Rejected',
    duplicate: 'Duplicate',
  };
  return labels[status] || status;
}

export function getReportStatusColor(status: string): string {
  const colors: Record<string, string> = {
    submitted: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    screening: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    under_review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    verified: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    duplicate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
}

export function getIncidentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    candidate: 'Candidate',
    verified: 'Verified',
    assigned: 'Response Assigned',
    responding: 'Responding',
    resolved: 'Resolved',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

export function getIncidentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    candidate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    verified: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    assigned: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    responding: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
}

export function getFreshnessBandLabel(band: 'fresh' | 'recent' | 'delayed' | 'stale'): string {
  const labels = {
    fresh: 'Fresh',
    recent: 'Recent',
    delayed: 'Delayed',
    stale: 'Stale',
  };
  return labels[band];
}

export function getFreshnessBandColor(band: 'fresh' | 'recent' | 'delayed' | 'stale'): string {
  const colors = {
    fresh: 'bg-green-500/20 text-green-400 border-green-500/30',
    recent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    delayed: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    stale: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[band];
}

export function formatConfidenceScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function getConfidenceColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-blue-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

export function isValidLongitude(lon: number): boolean {
  return lon >= -180 && lon <= 180;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateIncidentCode(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `INC-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function generateAlertCode(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `ALR-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
}
