import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { PublicAlertCard } from '@/components/features/PublicAlertCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CitizenHero } from '@/components/citizen/CitizenHero';
import { QuickActionCard } from '@/components/citizen/QuickActionCard';
import { WeatherCard } from '@/components/citizen/WeatherCard';
import { SafetyOverviewCard } from '@/components/citizen/SafetyOverviewCard';
import { MapPreview } from '@/components/citizen/MapPreview';
import { SafetyTipCard } from '@/components/citizen/SafetyTipCard';
import { CommunityCard } from '@/components/citizen/CommunityCard';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { alertService, reportService, incidentService } from '@/services';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock,
  FileWarning,
  Map,
  Phone,
  Radio,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function CitizenDashboard() {
  const { pendingCount, syncQueue, syncing } = useOfflineQueue();
  const isOnline = useNetworkStatus();

  const { data: alerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.list(),
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['reportStats'],
    queryFn: () => reportService.getDashboardStats(),
  });

  const { data: incidents, isLoading: loadingIncidents } = useQuery({
    queryKey: ['incidents', 'public'],
    queryFn: () => incidentService.list({ status: ['verified', 'responding', 'monitoring'] }),
  });

  const isDashboardLoading = loadingAlerts || loadingStats || loadingIncidents;

  const activeAlerts = alerts?.filter((alert) => alert.isActive) || [];
  const publicIncidents = incidents?.filter(
    (incident) => incident.publicVisibility === 'auto' || incident.publicVisibility === 'public',
  ) || [];

  return (
    <div className="animate-fade-in relative">
      {isDashboardLoading && <LoadingOverlay label="Refreshing coastal dashboard" />}
      <CitizenHero />

      <div className="mt-4 mb-6 flex items-center justify-between gap-4">
        <div />
        <div>
          {pendingCount > 0 && (
            <Button variant="outline" onClick={() => syncQueue()} disabled={syncing || !isOnline}>
              <WifiOff className="mr-2 h-4 w-4" aria-hidden="true" />
              Sync {pendingCount} offline
            </Button>
          )}
        </div>
      </div>

      {activeAlerts.length > 0 && (
        <section className="mb-8" aria-labelledby="active-alerts-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id="active-alerts-heading" className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
              Active safety alerts
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/citizen/alerts">View all {activeAlerts.length}</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {activeAlerts.slice(0, 2).map((alert) => (
              <PublicAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      )}

      <DashboardSection title="Current coastal activity" description="At-a-glance metrics and quick actions">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard label="Active alerts" value={activeAlerts.length} subtitle="Active safety warnings" trend="+2%" progress={Math.min(100, activeAlerts.length * 5)} Icon={Radio} />
          <DashboardCard label="Active incidents" value={publicIncidents.length} subtitle="Verified nearby incidents" trend="-1%" progress={Math.min(100, publicIncidents.length * 8)} Icon={Activity} />
          <DashboardCard label="Reports today" value={stats?.last24Hours || 0} subtitle="Citizen reports in last 24h" trend="+8%" progress={Math.min(100, (stats?.last24Hours || 0) * 4)} Icon={FileWarning} />
          <DashboardCard label="Saved offline" value={pendingCount} subtitle="Pending sync" trend={syncing ? 'Syncing…' : undefined} progress={Math.min(100, pendingCount * 10)} Icon={WifiOff} />
        </div>
      </DashboardSection>

      <DashboardSection title="Quick actions" description="Fast access to important tasks">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          <QuickActionCard Icon={FileWarning} label="Report Hazard" onActivate={() => window.location.assign('/citizen/report')} />
          <QuickActionCard Icon={Map} label="Hazard Map" onActivate={() => window.location.assign('/citizen/map')} />
          <QuickActionCard Icon={AlertTriangle} label="Safety Alerts" onActivate={() => window.location.assign('/citizen/alerts')} />
          <QuickActionCard Icon={WifiOff} label="Offline Reports" onActivate={() => window.location.assign('/citizen/offline')} />
          <QuickActionCard Icon={Phone} label="Emergency Contacts" onActivate={() => { /* placeholder */ }} />
          <QuickActionCard Icon={Activity} label="Marine Safety Tips" onActivate={() => { /* placeholder */ }} />
          <QuickActionCard Icon={Radio} label="Weather" onActivate={() => { /* placeholder */ }} />
        </div>
      </DashboardSection>

      {publicIncidents.length > 0 && (
        <section aria-labelledby="verified-incidents-heading">
          <h2 id="verified-incidents-heading" className="mb-3 text-lg font-semibold">Recently verified nearby</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {publicIncidents.slice(0, 4).map((incident) => (
              <Card key={incident.id}>
                <CardContent className="p-5">
                  <h3 className="font-semibold">{incident.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{incident.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {new Date(incident.startTime).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Map className="h-3 w-3" aria-hidden="true" />
                      {incident.location.districtName}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
