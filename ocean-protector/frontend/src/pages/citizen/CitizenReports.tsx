import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { LoadingSkeleton } from '@/components/layout/LoadingSkeleton';
import { ReportCard } from '@/components/features/ReportCard';
import { Button } from '@/components/ui/button';
import { reportService } from '@/services';
import { ClipboardList, PlusCircle } from 'lucide-react';

export function CitizenReports() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-reports'],
    queryFn: () => reportService.listMine({ page: 1, pageSize: 50 }),
  });

  if (isLoading) {
    return <LoadingSkeleton rows={4} label="Loading your reports" />;
  }

  const reports = data?.items ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Reports"
        description="Reports you submitted are listed here. Open one to track its status."
        icon={ClipboardList}
        actions={
          <Link to="/citizen/report">
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              New report
            </Button>
          </Link>
        }
      />

      {isError ? (
        <EmptyState
          icon={ClipboardList}
          title="Could not load your reports"
          description="Try again in a moment. Your reports stay safe on the server."
          action={
            <Link to="/citizen/report">
              <Button variant="outline">Report a hazard</Button>
            </Link>
          }
        />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No reports yet"
          description="When you submit a hazard report it will appear here with its live status."
          action={
            <Link to="/citizen/report">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                Report a hazard
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              to={`/citizen/tracking/${report.trackingId}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
