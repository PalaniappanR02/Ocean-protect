import { /* useState removed - declared later with useMemo */ } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IncidentStatusBadge } from '@/components/features/StatusBadge';
import { SeverityBadge } from '@/components/features/SeverityBadge';
import { incidentService } from '@/services';
import { INCIDENT_STATUS_LABELS, INCIDENT_STATUS_OPTIONS, HAZARD_TYPE_LABELS } from '@/types';
import type { IncidentStatus } from '@/types';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertTriangle, MapPin, Clock, Users, Activity, CheckCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import SearchFilters from '@/components/list/SearchFilters';
import { formatRelativeTime, formatDateTime } from '@/lib/utils';

const STATUS_FILTERS: { value: IncidentStatus | 'all'; label: string; icon: any }[] = [
  { value: 'all', label: 'All', icon: Filter },
  { value: 'assigned', label: 'Assigned', icon: AlertTriangle },
  { value: 'responding', label: 'Responding', icon: Activity },
  { value: 'monitoring', label: 'Monitoring', icon: Clock },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle },
];

export function AuthorityIncidents() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents', 'authority', 'list', { search, statusFilter, page }],
    queryFn: () =>
      incidentService.list({
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : [statusFilter],
        page,
        pageSize: 20,
      }),
  });

  const [searchLocal, setSearchLocal] = useState('');

  const visibleIncidents = useMemo(() => {
    if (!incidents) return [];
    const q = searchLocal.trim().toLowerCase();
    if (!q) return incidents;
    return incidents.filter(i => (i.title||'').toLowerCase().includes(q) || (i.location?.districtName||'').toLowerCase().includes(q) || (i.description||'').toLowerCase().includes(q));
  }, [incidents, searchLocal]);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Incident Management"
        description="Manage all coastal hazard incidents and coordinate response teams"
        icon={AlertTriangle}
      />

      {/* Filters */}
      <div className="space-y-4">
        <SearchFilters value={searchLocal} onChange={setSearchLocal} onClear={()=>setSearchLocal('')} placeholder="Search incidents by title, district, or state..." />

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              className="gap-2"
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Incidents List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-800/50" />
          ))}
        </div>
      ) : visibleIncidents && visibleIncidents.length > 0 ? (
        <div className="space-y-3">
          {visibleIncidents.map((incident) => (
            <Card key={incident.id} className="interactive-card glass-panel">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Info */}
                  <div className="flex items-start gap-3">
                    <SeverityBadge severity={incident.severity} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-100">
                          {incident.title}
                        </h3>
                        <IncidentStatusBadge status={incident.status} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                        {incident.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {incident.location.districtName}, {incident.location.stateCode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(incident.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {incident.responseTeams?.length || 0} teams
                        </span>
                        <span className="font-mono text-slate-600">
                          {incident.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/authority/incidents/${incident.id}`}>
                        Manage
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="mb-4 h-12 w-12 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-200">No incidents found</h3>
            <p className="mt-1 text-sm text-slate-400">
              No incidents match your current filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
