import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { PublicAlertCard } from '@/components/features/PublicAlertCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.list(),
  });

  const { data: stats } = useQuery({
    queryKey: ['reportStats'],
    queryFn: () => reportService.getDashboardStats(),
  });

  const { data: incidents } = useQuery({
    queryKey: ['incidents', 'public'],
    queryFn: () => incidentService.list({ status: ['verified', 'responding', 'monitoring'] }),
  });

  const activeAlerts = alerts?.filter((alert) => alert.isActive) || [];
  const publicIncidents = incidents?.filter(
    (incident) => incident.publicVisibility === 'auto' || incident.publicVisibility === 'public',
  ) || [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Coastal safety near you"
        description="Check current warnings, report what you see, and follow the response without needing technical coastal knowledge."
        icon={ShieldCheck}
        actions={
          <>
            {pendingCount > 0 && (
              <Button variant="outline" onClick={() => syncQueue()} disabled={syncing || !isOnline}>
                <WifiOff className="mr-2 h-4 w-4" aria-hidden="true" />
                Sync {pendingCount} offline
              </Button>
            )}
            <Button asChild>
              <Link to="/citizen/report">
                <FileWarning className="mr-2 h-4 w-4" aria-hidden="true" />
                Report hazard
              </Link>
            </Button>
          </>
        }
      />

      <section className="citizen-workbench" aria-labelledby="report-hazard-heading">
        <div className="report-callout">
          <div>
            <FileWarning className="h-7 w-7 text-primary" aria-hidden="true" />
            <h2 id="report-hazard-heading" className="mt-5 max-w-2xl text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
              See flooding, unusual waves, erosion, or pollution?
            </h2>
            <p className="mt-4 max-w-[68ch] text-sm leading-6 text-muted-foreground sm:text-base">
              Tell us what happened and share your location. OceanGuard will save the report offline if the network drops, then send it when your connection returns.
            </p>
          </div>
          <Button asChild size="lg" className="mt-7 w-full sm:w-auto">
            <Link to="/citizen/report">
              Start a hazard report
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <aside className="emergency-callout" aria-labelledby="immediate-danger-heading">
          <Phone className="h-6 w-6" aria-hidden="true" />
          <h2 id="immediate-danger-heading" className="mt-5 text-xl font-semibold text-inherit">Immediate danger?</h2>
          <p className="mt-3 text-sm leading-6">
            Move away from the shoreline and call emergency services. Do not enter unsafe water or delay leaving to collect evidence.
          </p>
          <Button asChild variant="destructive" className="mt-6 w-full">
            <a href="tel:112">Call 112</a>
          </Button>
        </aside>
      </section>

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

      <section className="mb-8" aria-labelledby="citizen-tools-heading">
        <h2 id="citizen-tools-heading" className="mb-3 text-lg font-semibold">What you can do next</h2>
        <div className="citizen-action-list">
          <Link to="/citizen/map" className="citizen-action-link">
            <Map className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block font-semibold">Open the hazard map</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">See verified coastal hazards and affected areas.</span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Link>
          <Link to="/citizen/tracking" className="citizen-action-link">
            <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block font-semibold">Track my reports</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">Check verification and response progress.</span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Link>
        </div>
      </section>

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
