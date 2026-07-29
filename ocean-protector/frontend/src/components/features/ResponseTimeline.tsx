import { cn, formatDateTime, formatRelativeTime } from '@/lib/utils';
import type { Incident } from '@/types';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Radio,
  Users,
  XCircle,
} from 'lucide-react';

interface ResponseTimelineProps {
  incident: Incident;
  className?: string;
}

const iconByAction: Record<string, typeof Clock> = {
  created: Radio,
  screening: Activity,
  screened: Activity,
  under_review: Clock,
  verified: CheckCircle,
  team_alerted: Users,
  team_deployed: Users,
  assigned: Users,
  responding: Activity,
  monitoring: Clock,
  resolved: CheckCircle,
  cancelled: XCircle,
};

const colorByAction: Record<string, string> = {
  created: 'text-slate-400',
  screening: 'text-blue-400',
  screened: 'text-blue-400',
  under_review: 'text-blue-400',
  verified: 'text-teal-400',
  team_alerted: 'text-amber-400',
  team_deployed: 'text-orange-400',
  assigned: 'text-amber-400',
  responding: 'text-orange-400',
  monitoring: 'text-cyan-400',
  resolved: 'text-green-400',
  cancelled: 'text-red-400',
};

export function ResponseTimeline({ incident, className }: ResponseTimelineProps) {
  const events = [...incident.responseTimeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  if (events.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <AlertTriangle className="h-4 w-4" /> No response events recorded yet.
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {events.map((event, index) => {
        const Icon = iconByAction[event.actionType] || Activity;
        const color = colorByAction[event.actionType] || 'text-slate-400';
        const label = event.actionType
          .replaceAll('_', ' ')
          .replace(/\b\w/g, (character) => character.toUpperCase());

        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full border-2 border-current', color)}>
                <Icon className="h-4 w-4" />
              </div>
              {index < events.length - 1 && <div className="mt-1 h-full w-px bg-slate-800" />}
            </div>
            <div className="flex-1 pb-4">
              <p className={cn('text-sm font-medium', color)}>{label}</p>
              <p className="mt-0.5 text-xs text-slate-300">{event.description}</p>
              {(event.actorName || event.actorRole) && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {event.actorName || 'System'}{event.actorRole ? ` · ${event.actorRole}` : ''}
                </p>
              )}
              <p className="mt-0.5 text-xs text-slate-500">
                {formatRelativeTime(event.timestamp)} · {formatDateTime(event.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
