import { useQuery } from '@tanstack/react-query';
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
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { SEVERITY_COLORS, HAZARD_TYPE_LABELS, type Severity, type HazardType } from '@/types';

export function AnalystDashboard() {
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
    color: SEVERITY_COLORS[s.severity as Severity],
  })) || [];

  const hazardTypeData = stats?.byHazardType.map((h) => ({
    name: HAZARD_TYPE_LABELS[h.hazardType as HazardType].split(' ')[0],
    count: h.count,
  })) || [];

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
            <QuickActionCard Icon={FileWarning} label="Verify reports" description="Open verification workflow" onActivate={() => window.location.assign('/analyst/reports')} />
            <QuickActionCard Icon={Activity} label="Open Map" description="Full map view" onActivate={() => window.location.assign('/analyst/map')} />
            <QuickActionCard Icon={TrendingUp} label="Generate Alert" description="Trigger a public alert" onActivate={() => window.location.assign('/analyst/alerts/new')} />
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

      {/* Decision-support charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Where verification attention is concentrated</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.name}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-rule)', borderRadius: 'var(--radius-control)' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incoming evidence by hazard type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hazardTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--color-neutral)', fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: 'var(--color-neutral)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-paper-3)', border: '1px solid var(--color-rule)', borderRadius: 'var(--radius-control)' }} />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
              <IncidentCard key={incident.id} incident={incident} to={`/authority/incidents/${incident.id}`} />
            )) || <p className="text-sm text-muted-foreground">No active incidents</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
