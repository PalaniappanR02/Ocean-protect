import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportCard } from '@/components/features/ReportCard';
import { IncidentCard } from '@/components/features/IncidentCard';
import { reportService, incidentService, socialService } from '@/services';
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
      <PageHeader
        title="Analyst Dashboard"
        description="Review and verify citizen hazard reports, manage incidents, and coordinate response"
        icon={Activity}
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Reports" value={stats?.total || 0} icon={FileWarning} color="ocean" />
        <StatCard label="Pending Review" value={stats?.underReview || 0} icon={Clock} color="amber" trend="Needs attention" />
        <StatCard label="Verified" value={stats?.verified || 0} icon={CheckCircle} color="green" />
        <StatCard label="Rejected" value={stats?.rejected || 0} icon={XCircle} color="red" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Incidents" value={recentIncidents?.length || 0} icon={AlertTriangle} color="orange" />
        <StatCard label="Critical Incidents" value={recentIncidents?.filter((i) => i.severity === 'critical').length || 0} icon={AlertTriangle} color="red" />
        <StatCard label="Social Signals" value={socialTrends?.totalSignals || 0} icon={Radio} color="ocean" />
        <StatCard label="High Urgency Signals" value={socialTrends?.highUrgency || 0} icon={Radio} color="red" />
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reports by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.name}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports by Hazard Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hazardTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
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