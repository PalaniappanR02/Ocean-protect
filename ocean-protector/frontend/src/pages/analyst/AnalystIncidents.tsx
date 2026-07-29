import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { IncidentCard } from '@/components/features/IncidentCard';
import { incidentService } from '@/services';
import { EmptyState } from '@/components/layout/EmptyState';
import { Users, AlertTriangle } from 'lucide-react';

export function AnalystIncidents() {
  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents', 'all'],
    queryFn: () => incidentService.list({}),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
      </div>
    );
  }

  const activeIncidents = incidents?.filter((i) => !['resolved', 'cancelled'].includes(i.status)) || [];
  const resolvedIncidents = incidents?.filter((i) => i.status === 'resolved') || [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Incident Management"
        description="View and manage all coastal hazard incidents"
        icon={Users}
      />

      {activeIncidents.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Active Incidents</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {activeIncidents.map((i) => (
              <IncidentCard key={i.id} incident={i} to={`/authority/incidents/${i.id}`} />
            ))}
          </div>
        </div>
      )}

      {resolvedIncidents.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Resolved Incidents</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {resolvedIncidents.map((i) => (
              <IncidentCard key={i.id} incident={i} to={`/authority/incidents/${i.id}`} />
            ))}
          </div>
        </div>
      )}

      {!incidents || incidents.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No Incidents" description="No incidents have been created yet" />
      ) : null}
    </div>
  );
}