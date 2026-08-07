import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Radio } from 'lucide-react';
import { alertService } from '@/services';
import { PublicAlertCard } from '@/components/features/PublicAlertCard';
import { LoadingSkeleton } from '@/components/layout/LoadingSkeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';

const isApiMode = import.meta.env.VITE_DATA_MODE === 'api';

export function PublicAlertsPage() {
  const { data: alerts, isLoading, isError } = useQuery({
    queryKey: ['public-alerts'],
    queryFn: () => alertService.list(),
    enabled: isApiMode,
    refetchInterval: 60_000,
  });

  const activeAlerts = alerts?.filter((a) => a.isActive) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <PageHeader
        title="Public Alerts"
        description="Official alerts published by coastal authorities from verified incidents. Live data — not a demonstration feed."
        icon={Radio}
      />

      <div className="mt-10">
        {!isApiMode ? (
          <EmptyState
            icon={AlertTriangle}
            title="Live alert feed not connected"
            description="This page shows alerts from the live Kadalkavach API. When the API feed is enabled, verified alerts will appear here. We never display placeholder safety messages."
          />
        ) : isLoading ? (
          <LoadingSkeleton rows={3} label="Loading public alerts" />
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Alert service unreachable"
            description="Kadalkavach could not reach the alert feed right now. Please check back in a moment."
          />
        ) : activeAlerts.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No active alerts"
            description="There are no active official alerts at the moment. New verified alerts will appear here immediately."
          />
        ) : (
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <PublicAlertCard key={alert.id} alert={alert} detailed />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
