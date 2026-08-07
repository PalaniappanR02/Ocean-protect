import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { AnalystHero } from '@/components/dashboard/AnalystHero';
import { VerificationQueue } from '@/components/dashboard/VerificationQueue';
import { ConfidenceGauge } from '@/components/dashboard/ConfidenceGauge';
import { HeatmapPreview } from '@/components/dashboard/HeatmapPreview';
import { IncidentTimeline } from '@/components/dashboard/IncidentTimeline';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportCard } from '@/components/features/ReportCard';
import { IncidentCard } from '@/components/features/IncidentCard';
import { HazardMap } from '@/components/features/HazardMap';
import { reportService, incidentService, socialService, regionService } from '@/services';
import {
  Activity, FileWarning, CheckCircle, XCircle, AlertTriangle,
  Radio, Clock, TrendingUp,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { SEVERITY_COLORS, HAZARD_TYPE_LABELS, type Severity, type HazardType } from '@/types';

export function AnalystDashboard() {
  const navigate = useNavigate();
  const { data: stats } = useQuery({
    queryKey: ['reportStats'],
    queryFn: () => reportService.getDashboardStats(),
  });

  const { data: pendingReports } = useQuery({
    queryKey: ['reports', 'pending'],
    queryFn: () => reportService.list({ status: ['submitted', 'screening', 'under_review'] }, { pageSize: 5, sortBy: 'receivedAt', sortOrder: 'desc' }),
  });

  const { data: recentIncidents } = useQuery({
    queryKey: ['incidents', 'recent'],
    queryFn: () => incidentService.list({ status: ['verified', 'responding', 'monitoring'] }),
  });

  const { data: socialTrends } = useQuery({
    queryKey: ['socialTrends'],
    queryFn: () => socialService.getTrends(),
  });
  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.list(),
  });

  const severityData = stats?.bySeverity.map((s) => ({
    name: s.severity.charAt(0).toUpperCase() + s.severity.slice(1),
    value: s.count,
    color: SEVERITY_COLORS[s.severity as Severity] ?? '#64748b',
  })) || [];

  const hazardTypeData = stats?.byHazardType.map((h) => ({
    name: HAZARD_TYPE_LABELS[h.hazardType as HazardType],
    count: h.count,
  })) || [];

  // Incident trend over the last 7 days (derived from live incident data).
  const trendData = useMemo(() => {
    const days: { label: string; incidents: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const count = (recentIncidents || []).filter((incident) => {
        const time = new Date(incident.createdAt).getTime();
        return time >= start.getTime() && time < end.getTime();
      }).length;
      days.push({
        label: start.toLocaleDateString(undefined, { weekday: 'short' }),
        incidents: count,
      });
    }
    return days;
  }, [recentIncidents]);

  const totalSeverity = severityData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="animate-fade-in">
      <AnalystHero totalIncidents={recentIncidents?.length || 0} verificationQueue={pendingReports?.total || 0} />

      {/* Stats */}
      <DashboardSection title="Overview" description="Key metrics for verification and response">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard label="Total Reports" value={stats?.total || 0} subtitle="All-time" trend="+4%" progress={stats?.total ? Math.min(100, (stats.total / 1000) * 100) : 0} Icon={FileWarning} />
          <DashboardCard label="Pending Review" value={stats?.underReview || 0} subtitle="Needs verification" trend="Needs attention" progress={stats?.underReview ? Math.min(100, stats.underReview * 5) : 0} Icon={Clock} />
          <DashboardCard label="Verified" value={stats?.verified || 0} subtitle="Confirmed reports" trend="Stable" progress={stats?.verified ? Math.min(100, (stats.verified / Math.max(1, stats.total || 1)) * 100) : 0} Icon={CheckCircle} />
          <DashboardCard label="Rejected" value={stats?.rejected || 0} subtitle="False or duplicates" trend="-2%" progress={stats?.rejected ? Math.min(100, stats.rejected * 5) : 0} Icon={XCircle} />
        </div>
      </DashboardSection>

      <DashboardSection title="Live signals & incidents" description="Active incident and social signal overview">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard label="Active Incidents" value={recentIncidents?.length || 0} subtitle="Verified / responding" progress={recentIncidents?.length ? Math.min(100, recentIncidents.length * 8) : 0} Icon={AlertTriangle} />
          <DashboardCard label="Critical Incidents" value={recentIncidents?.filter((i) => i.severity === 'critical').length || 0} subtitle="Immediate attention" progress={recentIncidents?.filter((i) => i.severity === 'critical').length ? 100 : 0} Icon={AlertTriangle} />
          <DashboardCard label="Social Signals" value={socialTrends?.totalSignals || 0} subtitle="Trends in social data" progress={socialTrends?.totalSignals ? Math.min(100, socialTrends.totalSignals / 10) : 0} Icon={Radio} />
          <DashboardCard label="High Urgency Signals" value={socialTrends?.highUrgency || 0} subtitle="Priority signals" progress={socialTrends?.highUrgency ? Math.min(100, socialTrends.highUrgency * 10) : 0} Icon={Radio} />
        </div>
      </DashboardSection>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <div>
          <HeatmapPreview reports={pendingReports?.items} incidents={recentIncidents} regions={regions} />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <QuickActionCard Icon={FileWarning} label="Verify reports" description="Open verification workflow" onActivate={() => navigate('/analyst/reports')} />
            <QuickActionCard Icon={Radio} label="Social signals" description="Review live intelligence" onActivate={() => navigate('/analyst/social')} />
            <QuickActionCard Icon={Activity} label="Open Map" description="Full map view" onActivate={() => navigate('/analyst/map')} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-gradient-to-br from-white/3 to-white/2 p-4 shadow-sm backdrop-blur-sm">
            <h3 className="text-sm font-semibold">Verification queue · {pendingReports?.total || 0} reports</h3>
            <div className="mt-3">
              <VerificationQueue reports={pendingReports} />
            </div>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-white/3 to-white/2 p-4 shadow-sm backdrop-blur-sm">
            <h3 className="text-sm font-semibold">Activity feed</h3>
            <div className="mt-3">
              <RecentActivity activities={(socialTrends as any)?.activities || []} />
            </div>
          </div>
        </div>
      </div>

      {/* Decision-support charts — donut, line, bar */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Severity distribution — donut (no external labels, so slices can never overlap) */}
        <Card>
          <CardHeader>
            <CardTitle>Report severity</CardTitle>
          </CardHeader>
          <CardContent>
            {severityData.length > 0 ? (
              <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {severityData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-rule)', borderRadius: 'var(--radius-control)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-2xl font-bold">{totalSeverity}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Reports</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
                {severityData.map((entry) => (
                  <span key={entry.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} aria-hidden="true" />
                    {entry.name}
                    <span className="font-mono text-foreground">{entry.value}</span>
                  </span>
                ))}
              </div>
              </>
            ) : (
              <div className="h-[230px]" />
            )}
          </CardContent>
        </Card>

        {/* Incident trend — line */}
        <Card>
          <CardHeader>
            <CardTitle>Incident trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
                <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-rule)', borderRadius: 'var(--radius-control)' }} />
                <Line type="monotone" dataKey="incidents" name="Incidents" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-accent)' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incoming evidence by hazard type — horizontal bar, readable labels */}
        <Card>
          <CardHeader>
            <CardTitle>Incoming evidence by hazard type</CardTitle>
          </CardHeader>
          <CardContent>
            {hazardTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={hazardTypeData} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" horizontal={false} />
                  <XAxis type="number" stroke="var(--color-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="var(--color-muted)" fontSize={10} width={96} tickLine={false} axisLine={false} />
                  <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-rule)', borderRadius: 'var(--radius-control)' }} />
                  <Bar dataKey="count" fill="var(--color-accent)" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[230px]" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports & Active Incidents */}
      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Pending Reports ({pendingReports?.total || 0})</TabsTrigger>
          <TabsTrigger value="incidents">Active Incidents ({recentIncidents?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pendingReports?.items.map((report) => (
              <ReportCard key={report.id} report={report} />
            )) || <p className="text-sm text-muted-foreground">No pending reports</p>}
          </div>
        </TabsContent>
        <TabsContent value="incidents" className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {recentIncidents?.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            )) || <p className="text-sm text-muted-foreground">No active incidents</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
