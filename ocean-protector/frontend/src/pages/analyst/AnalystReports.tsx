import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { ReportCard } from '@/components/features/ReportCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { reportService } from '@/services';
import { EmptyState } from '@/components/layout/EmptyState';
import { FileWarning, Search, Filter, X } from 'lucide-react';
import SearchFilters from '@/components/list/SearchFilters';
import type { ReportStatus, HazardType, Severity } from '@/types';
import { REPORT_STATUS_LABELS, HAZARD_TYPE_LABELS, SEVERITY_LABELS, SEVERITY_ORDER } from '@/types';

export function AnalystReports() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus[]>([]);
  const [hazardFilter, setHazardFilter] = useState<HazardType[]>([]);
  const [severityFilter, setSeverityFilter] = useState<Severity[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['reports', { search, statusFilter, hazardFilter, severityFilter, page }],
    queryFn: () => reportService.list(
      {
        search: search || undefined,
        status: statusFilter.length ? statusFilter : undefined,
        hazardType: hazardFilter.length ? hazardFilter : undefined,
        severity: severityFilter.length ? severityFilter : undefined,
      },
      { page, pageSize: 12, sortBy: 'receivedAt', sortOrder: 'desc' }
    ),
  });

  const toggleStatus = (s: ReportStatus) => {
    setStatusFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
    setPage(1);
  };

  const toggleHazard = (h: HazardType) => {
    setHazardFilter((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);
    setPage(1);
  };

  const toggleSeverity = (s: Severity) => {
    setSeverityFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter([]);
    setHazardFilter([]);
    setSeverityFilter([]);
    setPage(1);
  };

  const hasFilters = search || statusFilter.length || hazardFilter.length || severityFilter.length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Verify Reports"
        description="Review citizen hazard reports, verify evidence, and make incidents public"
        icon={FileWarning}
      />

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchFilters value={search} onChange={(v)=>{ setSearch(v); setPage(1); }} onClear={clearFilters} placeholder="Search by title, tracking ID or district..." />
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    statusFilter.includes(s)
                      ? 'border-ocean-500 bg-ocean-500/10 text-ocean-300'
                      : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {REPORT_STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Severity Filters */}
            <div className="flex flex-wrap gap-2">
              {SEVERITY_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSeverity(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    severityFilter.includes(s)
                      ? 'border-ocean-500 bg-ocean-500/10 text-ocean-300'
                      : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {SEVERITY_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="mb-3 text-sm text-muted-foreground">
            Showing {data.items.length} of {data.total} reports
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((report) => (
              <div key={report.id} className="glass-panel p-3">
                <ReportCard report={report} />
              </div>
            ))}
          </div>
          {data.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
              <Button variant="outline" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Filter}
          title="No Reports Found"
          description="Try adjusting your filters or search criteria"
          action={hasFilters ? <Button onClick={clearFilters}>Clear Filters</Button> : undefined}
        />
      )}
    </div>
  );
}