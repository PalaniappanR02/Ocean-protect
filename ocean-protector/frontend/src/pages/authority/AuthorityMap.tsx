import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HazardMap } from '@/components/features/HazardMap';
import { incidentService, reportService, regionService } from '@/services';
import type { Incident, HazardReport } from '@/types';
import { SEVERITY_COLORS } from '@/types';
import { Map as MapIcon, AlertTriangle, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function AuthorityMap() {
  const [showVerified, setShowVerified] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  const { data: incidents } = useQuery({
    queryKey: ['incidents', 'map'],
    queryFn: () => incidentService.list({ status: ['assigned', 'responding', 'monitoring'] }),
  });

  const { data: reports } = useQuery({
    queryKey: ['reports', 'map'],
    queryFn: () => reportService.list({}, { pageSize: 100 }),
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.list(),
  });

  const mapReports: HazardReport[] = (reports?.items || [])
    .filter((r) => (showVerified ? r.status === 'verified' : false) || (showPending ? r.status === 'submitted' : false));

  const mapIncidents: Incident[] = showIncidents ? (incidents || []) : [];



  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Authority Hazard Map"
        description="Real-time view of all reports, incidents, and response operations"
        icon={MapIcon}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-sm text-slate-400">
          <Filter className="h-4 w-4" /> Filters:
        </span>
        <Button
          variant={showIncidents ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowIncidents(!showIncidents)}
        >
          <AlertTriangle className="mr-1 h-4 w-4" />
          Active Incidents ({mapIncidents.length})
        </Button>
        <Button
          variant={showVerified ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowVerified(!showVerified)}
        >
          Verified Reports
        </Button>
        <Button
          variant={showPending ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowPending(!showPending)}
        >
          Pending Reports
        </Button>
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <HazardMap
            reports={mapReports}
            incidents={mapIncidents}
            regions={regions || []}
            className="h-[600px] rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Legend & Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Map Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs uppercase text-slate-500">Severity</p>
              {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
                <div key={severity} className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm capitalize text-slate-300">{severity}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2">
              <p className="text-xs uppercase text-slate-500">Marker Types</p>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-cyan-400 bg-cyan-400/20" />
                <span className="text-sm text-slate-300">Report</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-red-400 bg-red-400/20" />
                <span className="text-sm text-slate-300">Active Incident</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle>Nearby Incidents ({mapIncidents.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {mapIncidents.length > 0 ? (
              mapIncidents.map((incident) => (
                <Link
                  key={incident.id}
                  to={`/authority/incidents/${incident.id}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-800 p-2 hover:border-slate-600 hover:bg-slate-800/50"
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: SEVERITY_COLORS[incident.severity] }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-200">
                      {incident.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {incident.location.districtName} · {formatRelativeTime(incident.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {incident.status}
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">No active incidents</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}