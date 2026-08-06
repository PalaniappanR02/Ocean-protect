import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { AuthorityHero } from '@/components/dashboard/AuthorityHero';
import { ResponseStats } from '@/components/dashboard/ResponseStats';
import { TeamStatusCard } from '@/components/dashboard/TeamStatusCard';
import { ResourceCard } from '@/components/dashboard/ResourceCard';
import { QuickActionGrid } from '@/components/dashboard/QuickActionGrid';
import { AlertPanel } from '@/components/dashboard/AlertPanel';
import { OperationsFeed } from '@/components/dashboard/OperationsFeed';
import { HeatmapPreview } from '@/components/dashboard/HeatmapPreview';
import { EmptyState } from '@/components/layout/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { reportService, incidentService, regionService } from '@/services';
import {
  Activity, AlertTriangle, CheckCircle, Clock, FileWarning,
  Radio, Users, Map as MapIcon, Shield, TrendingUp, XCircle, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { HAZARD_TYPE_LABELS, SEVERITY_COLORS } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { ResponseTimeline } from '@/components/features/ResponseTimeline';

export function AuthorityDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['reportStats'],
    queryFn: () => reportService.getDashboardStats(),
  });

  const { data: incidents } = useQuery({
    queryKey: ['incidents', 'authority'],
    queryFn: () => incidentService.list({ status: ['assigned', 'responding', 'monitoring'] }),
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.list(),
  });

  const recentIncidents = incidents?.slice(0, 5) || [];

  const criticalAlerts = incidents?.filter((i) => i.severity === 'critical').length ?? 0;

  const severityData = stats?.bySeverity.map(({ severity, count }) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
    color: SEVERITY_COLORS[severity],
  })) ?? [];

  const hazardTypeData = stats?.byHazardType.map(({ hazardType, count }) => ({
    name: HAZARD_TYPE_LABELS[hazardType] || hazardType,
    count,
  })) ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <AuthorityHero activeIncidents={incidents?.length || 0} teamsDeployed={incidents?.filter(i => i.responseTeams?.length).length || 0} criticalAlerts={criticalAlerts} readiness={88} />

      <DashboardSection title="Operations overview" description="Response and incident metrics">
        <ResponseStats stats={[
          { label: 'Pending Reports', value: stats?.underReview ?? 0, icon: Clock, trend: 'Needs attention' },
          { label: 'Active Incidents', value: recentIncidents.length, icon: AlertTriangle },
          { label: 'Critical Incidents', value: incidents?.filter((i) => i.severity === 'critical').length ?? 0, icon: XCircle },
          { label: 'Teams Deployed', value: incidents?.filter((i) => i.responseTeams?.some((t: any) => t.status === 'deployed')).length ?? 0, icon: Users },
        ]} />
      </DashboardSection>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Severity Distribution */}
        <Card className="rounded-xl bg-gradient-to-br from-white/4 to-white/2">
          <CardHeader>
            <CardTitle>Current incident severity</CardTitle>
          </CardHeader>
          <CardContent>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <defs>
                    <linearGradient id="pieGradA" x1="0%" x2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry: any) => `${entry.name}: ${entry.value}`}
                  >
                    {severityData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-rule)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] py-4">
                <EmptyState
                  icon={AlertTriangle}
                  title="No severity data"
                  description="Severity distribution will appear once incident metrics are available."
                  className="h-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hazard Types */}
        <Card className="rounded-xl bg-gradient-to-br from-white/4 to-white/2">
          <CardHeader>
            <CardTitle>Response demand by hazard type</CardTitle>
          </CardHeader>
          <CardContent>
            {hazardTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hazardTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" />
                  <XAxis type="number" stroke="var(--color-muted)" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="var(--color-muted)"
                    fontSize={11}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-paper-3)',
                      border: '1px solid var(--color-rule)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] py-4">
                <EmptyState
                  icon={MapIcon}
                  title="No hazard demand data"
                  description="Hazard demand distribution will be shown when reports are available."
                  className="h-full"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Incidents */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Incidents requiring action</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">Review severity and response status separately before deployment.</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/authority/incidents">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentIncidents.length > 0 ? (
            recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${incident.severity === 'critical' ? 'border-red-300 bg-red-50' : 'border-border bg-card'}`}
              >
                <div
                  className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${SEVERITY_COLORS[incident.severity]}20`,
                    border: `1px solid ${SEVERITY_COLORS[incident.severity]}`,
                  }}
                >
                  <AlertTriangle
                    className="h-5 w-5"
                    style={{ color: SEVERITY_COLORS[incident.severity] }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {incident.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {incident.location.districtName}, {incident.location.stateCode} ·
                    {' '}{formatRelativeTime(incident.createdAt)}
                  </p>
                </div>
                <Badge variant={incident.status === 'responding' ? 'warning' : 'info'}>
                  {incident.status}
                </Badge>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/authority/incidents/${incident.id}`}>
                    Manage
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-8 text-sm text-slate-400">
              No active incidents
            </div>
          )}
        </CardContent>
          </Card>
        </div>

        <div>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Team status</h3>
              <div className="mt-3 grid grid-cols-1 gap-3">
                {(incidents || []).slice(0,3).map((inc:any, idx:number) => (
                  <TeamStatusCard key={idx} team={{ name: inc.responseTeams?.[0]?.name || 'Team', status: inc.responseTeams?.[0]?.status || 'available', assignment: inc.title, personnel: inc.responseTeams?.[0]?.personnelCount || 0, vehicles: inc.responseTeams?.[0]?.vehicleCount || 0 }} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Resources</h3>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <ResourceCard resource={{ name: 'Rescue boats', type: 'Boats', available: 4, total: 6 }} />
                <ResourceCard resource={{ name: 'Medical units', type: 'Units', available: 2, total: 3 }} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Alerts</h3>
              <div className="mt-3">
                <AlertPanel alerts={(incidents || []).filter((i:any)=> i.severity === 'critical').map((i:any)=>({ id: i.id, title: i.title, region: i.location?.districtName, time: i.createdAt, severity: i.severity }))} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Response Timeline */}
      {recentIncidents[0] && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Incident Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseTimeline incident={recentIncidents[0]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
