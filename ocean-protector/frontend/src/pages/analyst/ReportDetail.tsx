import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SeverityBadge } from '@/components/features/SeverityBadge';
import { ReportStatusBadge } from '@/components/features/StatusBadge';
import { ConfidenceScore } from '@/components/features/ConfidenceScore';
import { ConfidenceBarChart } from '@/components/features/ConfidenceBarChart';
import { HazardMap } from '@/components/features/HazardMap';
import { EmptyState } from '@/components/layout/EmptyState';
import { useToast } from '@/hooks/useToast';
import { HAZARD_TYPE_LABELS, type ReportStatus } from '@/types';
import {
  CheckCircle, XCircle, MapPin, Clock, User, Phone, Globe,
  FileWarning, RefreshCw, ArrowLeft, AlertTriangle, FileText, Tag,
} from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
      </div>
    );
  }

  if (!report) {
    return <EmptyState icon={FileWarning} title="Report Not Found" />;
  }

  const handleVerify = async () => {
    await reportService.updateStatus(report.id, 'verified', { verifiedBy: 'Demo Analyst' });
    queryClient.invalidateQueries({ queryKey: ['report', id] });
    queryClient.invalidateQueries({ queryKey: ['reports'] });
    toast({ title: 'Report Verified', description: 'The report is now public', variant: 'success' });
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: 'Reason Required', description: 'Please provide a rejection reason', variant: 'destructive' });
      return;
    }
    await reportService.updateStatus(report.id, 'rejected', { verifiedBy: 'Demo Analyst', rejectionReason });
    queryClient.invalidateQueries({ queryKey: ['report', id] });
    queryClient.invalidateQueries({ queryKey: ['reports'] });
    toast({ title: 'Report Rejected', variant: 'destructive' });
    setShowRejectInput(false);
    setRejectionReason('');
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    await reportService.recalculateConfidence(report.id);
    queryClient.invalidateQueries({ queryKey: ['report', id] });
    setRecalculating(false);
    toast({ title: 'Confidence Recalculated', variant: 'success' });
  };

  return (
    <div className="animate-fade-in">
      <Button variant="ghost" onClick={() => navigate('/analyst/reports')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports
      </Button>

      <PageHeader
        title={report.title}
        description={`${HAZARD_TYPE_LABELS[report.hazardType]} · ${report.trackingId}`}
        icon={FileWarning}
        actions={
          <div className="flex gap-2">
            {report.status !== 'verified' && report.status !== 'rejected' && (
              <>
                <Button variant="outline" onClick={() => setShowRejectInput(!showRejectInput)}>
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button onClick={handleVerify}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Verify & Publish
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={handleRecalculate} disabled={recalculating}>
              <RefreshCw className={`mr-2 h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} /> Recalculate
            </Button>
          </div>
        }
      />

      {/* Status Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <SeverityBadge severity={report.severity} size="md" />
        <ReportStatusBadge status={report.status} />
        {report.confidenceScore !== undefined && (
          <ConfidenceScore
            score={report.confidenceScore}
            factors={report.confidenceFactors}
            explanation={report.analysisExplanation}
            size="md"
          />
        )}
        {report.isPublic && (
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
            Public
          </span>
        )}
      </div>

      {/* Rejection Input */}
      {showRejectInput && (
        <Card className="mb-6 border-red-500/30">
          <CardContent className="p-4">
            <Label htmlFor="rejection">Rejection Reason</Label>
            <Textarea
              id="rejection"
              rows={2}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this report is being rejected..."
              className="mt-2"
            />
            <div className="mt-3 flex gap-2">
              <Button variant="destructive" onClick={handleReject}>Confirm Rejection</Button>
              <Button variant="outline" onClick={() => setShowRejectInput(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-slate-200">{report.description}</p>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HazardMap
                reports={[report]}
                center={[report.latitude, report.longitude]}
                zoom={10}
                className="h-[300px] rounded-lg"
              />
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Coordinates</p>
                  <p className="font-mono text-slate-200">{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">District</p>
                  <p className="text-slate-200">{report.districtName}, {report.stateCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confidence Breakdown */}
          {report.confidenceFactors && report.confidenceFactors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Confidence Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ConfidenceBarChart factors={report.confidenceFactors} />
                {report.analysisExplanation && (
                  <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                    <p className="text-xs text-muted-foreground">{report.analysisExplanation}</p>
                  </div>
                )}
                {report.keywordsMatched && report.keywordsMatched.length > 0 && (
                  <div className="mt-3">
                    <Label className="text-xs uppercase text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Matched Keywords
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {report.keywordsMatched.map((kw, i) => (
                        <span key={i} className="rounded bg-ocean-500/10 px-2 py-0.5 text-xs text-ocean-300">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow icon={Clock} label="Observed" value={formatDateTime(report.observedAt)} sub={formatRelativeTime(report.observedAt)} />
              <DetailRow icon={Clock} label="Received" value={formatDateTime(report.receivedAt)} sub={formatRelativeTime(report.receivedAt)} />
              <DetailRow icon={Globe} label="Language" value={report.languageCode.toUpperCase()} />
              <DetailRow icon={User} label="Reporter" value={report.isAnonymous ? 'Anonymous' : report.reporterName || 'Unknown'} />
              {!report.isAnonymous && report.reporterPhone && (
                <DetailRow icon={Phone} label="Phone" value={report.reporterPhone} />
              )}
              {report.verifiedBy && (
                <DetailRow icon={CheckCircle} label="Verified By" value={report.verifiedBy} />
              )}
              {report.rejectionReason && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-xs font-medium text-red-400">Rejection Reason</p>
                  <p className="mt-1 text-xs text-slate-300">{report.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking Info */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Tracking ID</p>
                <p className="font-mono text-slate-200">{report.trackingId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Client Report ID</p>
                <p className="font-mono text-xs text-muted-foreground">{report.clientReportId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Report ID</p>
                <p className="font-mono text-xs text-muted-foreground">{report.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-slate-200">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}