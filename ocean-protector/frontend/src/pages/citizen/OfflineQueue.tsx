import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { HAZARD_TYPE_LABELS } from '@/types';
import { WifiOff, CheckCircle, Loader2, Trash2, RefreshCw, CloudUpload } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export function OfflineQueue() {
  const { queue, syncQueue, removeFromQueue, syncing, pendingCount } = useOfflineQueue();
  const isOnline = useNetworkStatus();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Offline Report Queue"
        description="Reports saved while offline will be synced automatically when connection returns"
        icon={WifiOff}
        actions={
          pendingCount > 0 && isOnline ? (
            <Button onClick={() => syncQueue()} disabled={syncing}>
              {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudUpload className="mr-2 h-4 w-4" />}
              {syncing ? 'Syncing...' : `Sync ${pendingCount} Reports`}
            </Button>
          ) : undefined
        }
      />

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
          <h3 className="text-lg font-semibold text-slate-200">No Offline Reports</h3>
          <p className="mt-1 text-sm text-muted-foreground">All your reports have been synced successfully.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {HAZARD_TYPE_LABELS[item.hazardType]}
                      </Badge>
                      <StatusBadge state={item.state} />
                    </div>
                    <h3 className="font-semibold text-slate-100">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{item.districtName}, {item.stateCode}</span>
                      <span>{formatRelativeTime(item.createdAt)}</span>
                      {item.trackingId && <span className="font-mono text-ocean-400">{item.trackingId}</span>}
                    </div>
                    {item.syncError && (
                      <p className="mt-2 text-xs text-red-400">Error: {item.syncError}</p>
                    )}
                  </div>
                  {item.state === 'synced' && (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
                  )}
                  {item.state !== 'synced' && (
                    <Button variant="ghost" size="icon" onClick={() => removeFromQueue(item.id!)}>
                      <Trash2 className="h-4 w-4 text-slate-500" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ state }: { state: string }) {
  const config: Record<string, { label: string; class: string }> = {
    saved_offline: { label: 'Saved Offline', class: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    waiting_for_signal: { label: 'Waiting', class: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    syncing: { label: 'Syncing', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    synced: { label: 'Synced', class: 'bg-green-500/20 text-green-400 border-green-500/30' },
    sync_failed: { label: 'Failed', class: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const c = config[state] || config.saved_offline;
  return <Badge className={c.class}>{c.label}</Badge>;
}