import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { PublicAlertCard } from '@/components/features/PublicAlertCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { alertService } from '@/services';
import { Radio, ShieldCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import { LoadingSkeleton } from '@/components/layout/LoadingSkeleton';
import SearchFilters from '@/components/list/SearchFilters';

export function CitizenAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.list(),
  });

  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!alerts) return [];
    const q = search.trim().toLowerCase();
    if (!q) return alerts;
    return alerts.filter(a => (a.messageTitle || '').toLowerCase().includes(q) || (a.messageBody || '').toLowerCase().includes(q));
  }, [alerts, search]);

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

      <div className="mb-4">
        <SearchFilters value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search alerts..." />
      </div>

      {(!alerts || alerts.length === 0) ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Active Alerts"
          description="There are currently no active safety alerts. Stay safe and report any coastal hazards you observe."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((alert) => (
            <div key={alert.id} className="glass-panel p-3">
              <PublicAlertCard
                alert={alert}
                detailed
                onAcknowledge={() => handleAcknowledge(alert.id)}
                acknowledged={acknowledged.has(alert.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
