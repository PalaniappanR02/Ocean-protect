import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SeverityBadge } from './SeverityBadge';
import { IncidentStatusBadge } from './StatusBadge';
import { formatRelativeTime } from '@/lib/utils';
import { HAZARD_TYPE_LABELS, type Incident } from '@/types';
import { MapPin, Clock, FileText, Users } from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  to?: string;
}

export function IncidentCard({ incident, to }: IncidentCardProps) {
  const hazardLabel = HAZARD_TYPE_LABELS[incident.hazardType];
  const body = (
    <Card className="interactive-card group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={incident.severity} />
              <IncidentStatusBadge status={incident.status} />
            </div>
            <span className="font-mono text-xs text-muted-foreground">{incident.incidentCode}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-ocean-400">
            <span className="uppercase tracking-wider">{hazardLabel}</span>
          </div>
          <h3 className="mb-1 line-clamp-2 font-semibold text-slate-100">
            {incident.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{incident.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {incident.location.districtName}, {incident.location.stateCode}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {formatRelativeTime(incident.startTime)}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" aria-hidden="true" />
              {incident.reportCount} {incident.reportCount === 1 ? 'report' : 'reports'}
            </span>
            {incident.responseTeam && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" aria-hidden="true" />
                {incident.responseTeam.name}
              </span>
            )}
          </div>
        </CardContent>
    </Card>
  );

  // Cards are only links when a destination is explicitly provided (the old
  // default pointed analysts into the authority portal, which their role can't
  // open — and analysts have no incident-detail route of their own).
  return to ? <Link to={to}>{body}</Link> : body;
}
