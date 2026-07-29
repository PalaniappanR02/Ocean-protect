import { cn } from '@/lib/utils';
import type { ReportStatus, IncidentStatus } from '@/types';
import { REPORT_STATUS_LABELS, INCIDENT_STATUS_LABELS } from '@/types';

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const statusClass = `status-${status}`;
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
      statusClass,
    )}>
      {REPORT_STATUS_LABELS[status]}
    </span>
  );
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const colorMap: Record<IncidentStatus, string> = {
    candidate: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    under_review: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    verified: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    assigned: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    responding: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    monitoring: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    resolved: 'text-green-400 bg-green-500/10 border-green-500/30',
    cancelled: 'text-red-400 bg-red-500/10 border-red-500/30',
  };
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
      colorMap[status],
    )}>
      {INCIDENT_STATUS_LABELS[status]}
    </span>
  );
}