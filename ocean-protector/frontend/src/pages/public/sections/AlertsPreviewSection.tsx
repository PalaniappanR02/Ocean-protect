import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { alertService } from '@/services';
import { PublicAlertCard } from '@/components/features/PublicAlertCard';
import { LoadingSkeleton } from '@/components/layout/LoadingSkeleton';
import { SectionHeading } from './SectionHeading';

const isApiMode = import.meta.env.VITE_DATA_MODE === 'api';

export function AlertsPreviewSection() {
  const { data: alerts, isLoading, isError } = useQuery({
    queryKey: ['public-alerts', 'landing'],
    queryFn: () => alertService.list(),
    enabled: isApiMode,
    refetchInterval: 60_000,
  });

  const activeAlerts = alerts?.filter((a) => a.isActive) ?? [];

  return (
    <section className="py-24 lg:py-32" aria-labelledby="alerts-preview-heading">
      <SectionHeading
        id="alerts-preview-heading"
        eyebrow="Public alerts"
        title="Live official alerts."
        description="Verified incidents published by authorities — nothing here is speculative."
      />

      <div className="mx-auto mt-14 w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        {!isApiMode ? (
          <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-ocean-400/10">
              <AlertTriangle className="h-6 w-6 text-ocean-400" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">No live alert feed connected</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              This preview connects to the live Kadalkavach API. Until then we deliberately show no
              alerts — public safety messaging must never be a placeholder.
            </p>
          </div>
        ) : isLoading ? (
          <LoadingSkeleton rows={2} label="Loading public alerts" />
        ) : isError ? (
          <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
            Could not reach the alert service right now. Please check back shortly.
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10">
              <AlertTriangle className="h-6 w-6 text-emerald-500" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">No active alerts right now</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Verified incidents appear here the moment an authority publishes them.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {activeAlerts.slice(0, 3).map((alert) => (
                <PublicAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/public-alerts"
                className="inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View all public alerts
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
