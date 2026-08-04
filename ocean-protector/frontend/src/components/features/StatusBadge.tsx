import { cn } from '@/lib/utils';
import type { ReportStatus, IncidentStatus } from '@/types';
import { REPORT_STATUS_LABELS, INCIDENT_STATUS_LABELS } from '@/types';

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const statusClass: Record<ReportStatus, string> = {
    submitted: 'border-blue-200 bg-blue-50 text-blue-800',
    screening: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    under_review: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    verified: 'border-green-200 bg-green-50 text-green-800',
    rejected: 'border-red-200 bg-red-50 text-red-800',
    duplicate: 'border-slate-300 bg-slate-100 text-slate-700',
    merged_into_incident: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    action_initiated: 'border-orange-200 bg-orange-50 text-orange-800',
    resolved: 'border-green-200 bg-green-50 text-green-800',
  };
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
      statusClass[status],
    )}>
      {REPORT_STATUS_LABELS[status]}
    </span>
  );
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const colorMap: Record<IncidentStatus, string> = {
    candidate: 'border-slate-300 bg-slate-100 text-slate-700',
    under_review: 'border-blue-200 bg-blue-50 text-blue-800',
    verified: 'border-teal-200 bg-teal-50 text-teal-800',
    assigned: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    responding: 'border-orange-200 bg-orange-50 text-orange-800',
    monitoring: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    resolved: 'border-green-200 bg-green-50 text-green-800',
    cancelled: 'border-red-200 bg-red-50 text-red-800',
  };
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
      colorMap[status],
    )}>
      {INCIDENT_STATUS_LABELS[status]}
    </span>
  );
}
