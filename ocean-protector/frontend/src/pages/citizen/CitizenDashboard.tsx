import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { PublicAlertCard } from '@/components/features/PublicAlertCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { alertService, reportService, incidentService } from '@/services';
import {
  AlertTriangle, FileWarning, Radio, Map, ShieldCheck, Clock, Activity, WifiOff,
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

  const activeAlerts = alerts?.filter((a) => a.isActive) || [];
  const publicIncidents = incidents?.filter((i) => i.publicVisibility === 'auto' || i.publicVisibility === 'public') || [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Citizen Dashboard"
        description="Report coastal hazards and stay informed about safety alerts in your area"
        icon={ShieldCheck}
        actions={
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <Button variant="outline" onClick={() => syncQueue()} disabled={syncing || !isOnline}>
                <WifiOff className="mr-2 h-4 w-4" />
                Sync {pendingCount} offline
              </Button>
            )}
            <Link to="/citizen/report">
              <Button>
                <FileWarning className="mr-2 h-4 w-4" />
                Report Hazard
              </Button>
            </Link>
          </div>
        }
      />

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-red-400">
            <AlertTriangle className="h-4 w-4" />
            Active Safety Alerts ({activeAlerts.length})
          </h2>
          {activeAlerts.slice(0, 2).map((alert) => (
            <PublicAlertCard key={alert.id} alert={alert} />
          ))}
          {activeAlerts.length > 2 && (
            <Link to="/citizen/alerts">
              <Button variant="ghost" className="w-full">
                View all {activeAlerts.length} alerts
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Alerts" value={activeAlerts.length} icon={Radio} color="red" />
        <StatCard label="Active Incidents" value={publicIncidents.length} icon={Activity} color="amber" />
        <StatCard label="Reports (24h)" value={stats?.last24Hours || 0} icon={FileWarning} color="ocean" />
        <StatCard label="Offline Reports" value={pendingCount} icon={WifiOff} color="amber" />
      </div>

      {/* Quick Actions */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link to="/citizen/report">
          <Card className="group h-full transition-all hover:border-ocean-500/50">
            <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-ocean-500/10 text-ocean-400 group-hover:bg-ocean-500/20">
                <FileWarning className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-slate-100">Report a Hazard</h3>
              <p className="mt-1 text-sm text-muted-foreground">Submit a coastal hazard report with photo and location</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/citizen/map">
          <Card className="group h-full transition-all hover:border-ocean-500/50">
            <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20">
                <Map className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-slate-100">Hazard Map</h3>
              <p className="mt-1 text-sm text-muted-foreground">View active hazards and incidents on the map</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/citizen/alerts">
          <Card className="group h-full transition-all hover:border-ocean-500/50">
            <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20">
                <Radio className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-slate-100">Safety Alerts</h3>
              <p className="mt-1 text-sm text-muted-foreground">View active public safety alerts</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Incidents */}
      {publicIncidents.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Recent Verified Incidents</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {publicIncidents.slice(0, 4).map((incident) => (
              <Card key={incident.id} className="border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-100">{incident.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{incident.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(incident.startTime).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Map className="h-3 w-3" />
                      {incident.location.districtName}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}