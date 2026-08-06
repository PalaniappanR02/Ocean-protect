import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { IncidentCard } from '@/components/features/IncidentCard';
import { incidentService } from '@/services';
import { EmptyState } from '@/components/layout/EmptyState';
import { Users, AlertTriangle } from 'lucide-react';
import SearchFilters from '@/components/list/SearchFilters';

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

  const [search, setSearch] = useState('');

  const activeIncidents = useMemo(() => (incidents || []).filter((i) => !['resolved', 'cancelled'].includes(i.status)), [incidents]);
  const resolvedIncidents = useMemo(() => (incidents || []).filter((i) => i.status === 'resolved'), [incidents]);

  const filteredActive = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeIncidents;
    return activeIncidents.filter(i => (i.title||'').toLowerCase().includes(q) || (i.description||'').toLowerCase().includes(q) || (i.location?.districtName||'').toLowerCase().includes(q));
  }, [activeIncidents, search]);

  const filteredResolved = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return resolvedIncidents;
    return resolvedIncidents.filter(i => (i.title||'').toLowerCase().includes(q) || (i.description||'').toLowerCase().includes(q) || (i.location?.districtName||'').toLowerCase().includes(q));
  }, [resolvedIncidents, search]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Incident Management"
        description="View and manage all coastal hazard incidents"
        icon={Users}
      />

      <div className="mb-4">
        <SearchFilters value={search} onChange={setSearch} onClear={()=>setSearch('')} placeholder="Search incidents..." />
      </div>

      {filteredActive.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Active Incidents</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredActive.map((i) => (
              <div key={i.id} className="glass-panel p-3">
                <IncidentCard incident={i} to={`/authority/incidents/${i.id}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredResolved.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Resolved Incidents</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredResolved.map((i) => (
              <div key={i.id} className="glass-panel p-3">
                <IncidentCard incident={i} to={`/authority/incidents/${i.id}`} />
              </div>
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