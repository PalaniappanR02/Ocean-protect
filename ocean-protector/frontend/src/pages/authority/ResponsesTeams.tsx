import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponseTeamCard } from '@/components/features/ResponseTeamCard';
import { incidentService, regionService } from '@/services';
import {
  Users, Phone, MapPin, Activity, AlertTriangle, Shield,
} from 'lucide-react';
import { RESPONSE_TEAM_TYPE_LABELS } from '@/types';
import type { ResponseTeamType } from '@/types';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const TEAM_TYPES: ResponseTeamType[] = ['ndrf', 'sdma', 'ndrf_marine', 'coast_guard', 'marine_police', 'fire_rescue', 'revenue', 'volunteer'];

export function ResponseTeams() {
  const [filter, setFilter] = useState<ResponseTeamType | 'all'>('all');

  const { data: incidents } = useQuery({
    queryKey: ['incidents', 'teams'],
    queryFn: () => incidentService.list({ status: ['assigned', 'responding', 'monitoring'] }),
  });

  // Extract all teams from incidents
  const allTeams = incidents?.flatMap((i) =>
    (i.responseTeams || []).map((t) => ({ ...t, incident: i }))
  ) || [];

  const filteredTeams = filter === 'all'
    ? allTeams
    : allTeams.filter((t) => t.type === filter);

  // Group by type
  const teamsByType = TEAM_TYPES.map((type) => ({
    type,
    teams: allTeams.filter((t) => t.type === type),
  })).filter((g) => g.teams.length > 0);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Response Teams"
        description="Manage emergency response teams and track deployments"
        icon={Users}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500">Total Teams</p>
                <p className="text-2xl font-bold text-slate-100">{allTeams.length}</p>
              </div>
              <Users className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500">Deployed</p>
                <p className="text-2xl font-bold text-orange-400">
                  {allTeams.filter((t) => t.status === 'deployed').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500">On Standby</p>
                <p className="text-2xl font-bold text-blue-400">
                  {allTeams.filter((t) => t.status === 'standby').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500">Stand Down</p>
                <p className="text-2xl font-bold text-slate-400">
                  {allTeams.filter((t) => t.status === 'stood_down').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Teams ({allTeams.length})
        </Button>
        {TEAM_TYPES.map((type) => {
          const count = allTeams.filter((t) => t.type === type).length;
          if (count === 0) return null;
          return (
            <Button
              key={type}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(type)}
            >
              {RESPONSE_TEAM_TYPE_LABELS[type]} ({count})
            </Button>
          );
        })}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => (
            <Card key={team.id}>
              <CardContent className="p-4">
                <ResponseTeamCard team={team} />
                {team.incident && (
                  <div className="mt-3 border-t border-slate-800 pt-3">
                    <p className="text-xs text-slate-500">Assigned to:</p>
                    <Link
                      to={`/authority/incidents/${team.incident.id}`}
                      className="text-sm font-medium text-cyan-400 hover:underline"
                    >
                      {team.incident.title}
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-4 h-12 w-12 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-200">No teams deployed</h3>
              <p className="mt-1 text-sm text-slate-400">
                Response teams will appear here when assigned to incidents.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}