import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { PublicAlertCard } from '@/components/features/PublicAlertCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { alertService } from '@/services';
import { Radio, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { LoadingSkeleton } from '@/components/layout/LoadingSkeleton';

export function CitizenAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.list(),
  });

  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const handleAcknowledge = (id: string) => {
    setAcknowledged((prev) => new Set([...prev, id]));
    alertService.acknowledge(id);
  };

  if (isLoading) {
    return <LoadingSkeleton rows={3} label="Loading safety alerts" />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Active Safety Alerts"
        description="Official public safety alerts issued by coastal authorities"
        icon={Radio}
      />

      {(!alerts || alerts.length === 0) ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Active Alerts"
          description="There are currently no active safety alerts. Stay safe and report any coastal hazards you observe."
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <PublicAlertCard
              key={alert.id}
              alert={alert}
              detailed
              onAcknowledge={() => handleAcknowledge(alert.id)}
              acknowledged={acknowledged.has(alert.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
