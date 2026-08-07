import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, FileWarning, MapPin, Clock } from 'lucide-react';
import { reportService } from '@/services';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SeverityBadge } from '@/components/features/SeverityBadge';
import { ReportStatusBadge } from '@/components/features/StatusBadge';
import { ConfidenceScore } from '@/components/features/ConfidenceScore';
import { EmptyState } from '@/components/layout/EmptyState';
import { HAZARD_TYPE_LABELS } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';

/** Public tracking lookup — no sign-in required, uses the public tracking endpoint. */
export function PublicTrackPage() {
  const navigate = useNavigate();
  const { trackingId } = useParams<{ trackingId: string }>();
  const [trackingInput, setTrackingInput] = useState('');

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['public-report', trackingId],
    queryFn: () => reportService.getByTrackingId(trackingId!),
    enabled: !!trackingId,
  });

  if (!trackingId) {
    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const normalized = trackingInput.trim().toUpperCase();
      if (normalized) navigate(`/track/${encodeURIComponent(normalized)}`);
    };

    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6 lg:py-20">
        <PageHeader
          title="Track Your Report"
          description="Enter the tracking ID you received after submitting a hazard report."
          icon={Search}
        />
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Tracking ID</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSearch}>
              <div className="space-y-2">
                <Label htmlFor="public-tracking-id">Kadalkavach tracking ID</Label>
                <Input
                  id="public-tracking-id"
                  value={trackingInput}
                  onChange={(event) => setTrackingInput(event.target.value)}
                  placeholder="Example: OG-TN-123456"
                  autoComplete="off"
                />
              </div>
              <Button className="w-full" type="submit" disabled={!trackingInput.trim()}>
                <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                Find Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" aria-hidden="true" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={Search}
          title="Report Not Found"
          description={`No report found with tracking ID: ${trackingId}. Double-check the ID or report a new hazard.`}
          action={
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/track')}>
                Try another ID
              </Button>
              <Button onClick={() => navigate('/citizen/report')}>Report a Hazard</Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
      <PageHeader
        title="Report Tracking"
        description={`Tracking ID: ${report.trackingId}`}
        icon={FileWarning}
      />

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Report Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Status</span>
            <ReportStatusBadge status={report.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Hazard Type</span>
            <span className="text-sm font-medium">{HAZARD_TYPE_LABELS[report.hazardType] ?? report.hazardType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Severity</span>
            <SeverityBadge severity={report.severity} />
          </div>
          {report.confidenceScore !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI Confidence</span>
              <ConfidenceScore score={report.confidenceScore} size="sm" showLabel={false} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Title</Label>
            <p className="mt-1 font-medium">{report.title}</p>
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Description</Label>
            <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="flex items-center gap-1 text-xs uppercase text-muted-foreground">
                <MapPin className="h-3 w-3" aria-hidden="true" /> Location
              </Label>
              <p className="mt-1 text-sm">{report.districtName}, {report.stateCode}</p>
            </div>
            <div>
              <Label className="flex items-center gap-1 text-xs uppercase text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden="true" /> Observed At
              </Label>
              <p className="mt-1 text-sm">{formatDateTime(report.observedAt)}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(report.observedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => navigate('/track')}>
          Track another report
        </Button>
        <Button onClick={() => navigate('/citizen/report')}>Report a Hazard</Button>
      </div>
    </div>
  );
}
