import { useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { CheckCircle, Clock, MapPin, Search, FileWarning } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';

export function ReportTracking() {
  const navigate = useNavigate();
  const { trackingId } = useParams<{ trackingId: string }>();
  const [trackingInput, setTrackingInput] = useState('');

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', trackingId],
    queryFn: () => reportService.getByTrackingId(trackingId!),
    enabled: !!trackingId,
  });


  if (!trackingId) {
    const handleTrackingSearch = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const normalized = trackingInput.trim().toUpperCase();
      if (normalized) navigate(`/citizen/tracking/${encodeURIComponent(normalized)}`);
    };

    return (
      <div className="animate-fade-in mx-auto max-w-xl">
        <PageHeader
          title="Track Your Report"
          description="Enter the tracking ID shown after submitting a hazard report."
          icon={Search}
        />
        <Card>
          <CardHeader>
            <CardTitle>Tracking ID</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleTrackingSearch}>
              <div className="space-y-2">
                <Label htmlFor="trackingId">OceanGuard tracking ID</Label>
                <Input
                  id="trackingId"
                  value={trackingInput}
                  onChange={(event) => setTrackingInput(event.target.value)}
                  placeholder="Example: OG-TN-123456"
                  autoComplete="off"
                />
              </div>
              <Button className="w-full" type="submit" disabled={!trackingInput.trim()}>
                <Search className="mr-2 h-4 w-4" />
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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={Search}
          title="Report Not Found"
          description={`No report found with tracking ID: ${trackingId}`}
          action={<Link to="/citizen"><Button>Back to Dashboard</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <PageHeader
        title="Report Tracking"
        description={`Tracking ID: ${report.trackingId}`}
        icon={FileWarning}
      />

      {/* Success Banner */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <CheckCircle className="h-6 w-6 text-green-400" />
        <div>
          <p className="font-semibold text-green-400">Report Submitted Successfully</p>
          <p className="text-sm text-muted-foreground">Save your tracking ID to check the status of your report</p>
        </div>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Status</span>
            <ReportStatusBadge status={report.status} />
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
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Hazard Type</span>
            <span className="text-sm font-medium text-slate-200">{HAZARD_TYPE_LABELS[report.hazardType]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Report Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Title</Label>
            <p className="mt-1 font-medium text-slate-100">{report.title}</p>
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Description</Label>
            <p className="mt-1 text-sm text-slate-300">{report.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location
              </Label>
              <p className="mt-1 text-sm text-slate-200">{report.districtName}, {report.stateCode}</p>
              <p className="font-mono text-xs text-muted-foreground">{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</p>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Observed At
              </Label>
              <p className="mt-1 text-sm text-slate-200">{formatDateTime(report.observedAt)}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(report.observedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <TimelineStep label="Report Submitted" timestamp={report.receivedAt} completed />
            <TimelineStep label="AI Screening" timestamp={report.status !== 'submitted' ? report.updatedAt : undefined} completed={report.status !== 'submitted'} />
            <TimelineStep label="Analyst Review" timestamp={report.status === 'under_review' || report.status === 'verified' ? report.updatedAt : undefined} completed={report.status === 'under_review' || report.status === 'verified' || report.status === 'rejected'} />
            <TimelineStep
              label={report.status === 'verified' ? 'Verified & Made Public' : report.status === 'rejected' ? 'Rejected' : 'Pending Verification'}
              timestamp={report.verifiedAt || undefined}
              completed={report.status === 'verified' || report.status === 'rejected'}
              isLast
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
        <Link to="/citizen"><Button variant="outline">Back to Dashboard</Button></Link>
        <Link to="/citizen/report"><Button>Report Another Hazard</Button></Link>
      </div>
    </div>
  );
}

function TimelineStep({ label, timestamp, completed, isLast }: { label: string; timestamp?: string; completed: boolean; isLast?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
          completed ? 'border-green-500 bg-green-500/10' : 'border-slate-700 bg-slate-800'
        }`}>
          {completed ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Clock className="h-4 w-4 text-slate-500" />}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-800" />}
      </div>
      <div className="pb-3">
        <p className={`text-sm font-medium ${completed ? 'text-slate-200' : 'text-slate-500'}`}>{label}</p>
        {timestamp && <p className="text-xs text-muted-foreground">{formatRelativeTime(timestamp)}</p>}
      </div>
    </div>
  );
}
