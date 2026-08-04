import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
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
      <PageHeader
        title="Authority Dashboard"
        description="Manage incidents, coordinate response teams, and monitor coastal safety"
        icon={Shield}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <StatCard
          label="Pending Reports"
          value={stats?.underReview ?? 0}
          icon={Clock}
          color="amber"
          trend="Needs attention"
        />
        <StatCard
          label="Active Incidents"
          value={recentIncidents.length}
          icon={AlertTriangle}
          color="orange"
          trend="Live incidents"
        />
        <StatCard
          label="Critical Incidents"
          value={incidents?.filter((i) => i.severity === 'critical').length ?? 0}
          icon={XCircle}
          color="red"
        />
        <StatCard
          label="Teams Deployed"
          value={incidents?.filter((i) => i.responseTeams?.some(t => t.status === 'deployed')).length ?? 0}
          icon={Users}
          color="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Current incident severity</CardTitle>
          </CardHeader>
          <CardContent>
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
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
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-paper-3)',
                      border: '1px solid var(--color-rule)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-slate-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hazard Types */}
        <Card>
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
              <div className="flex h-[250px] items-center justify-center text-sm text-slate-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Incidents */}
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
