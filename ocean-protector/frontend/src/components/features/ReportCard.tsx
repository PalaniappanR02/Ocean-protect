import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SeverityBadge } from './SeverityBadge';
import { ReportStatusBadge } from './StatusBadge';
import { ConfidenceScore } from './ConfidenceScore';
import { formatRelativeTime } from '@/lib/utils';
import { HAZARD_TYPE_LABELS, type HazardReport } from '@/types';
import { MapPin, Clock, User } from 'lucide-react';

interface ReportCardProps {
  report: HazardReport;
  to?: string;
  compact?: boolean;
}

export function ReportCard({ report, to, compact = false }: ReportCardProps) {
  const link = to || `/analyst/reports/${report.id}`;
  const hazardLabel = HAZARD_TYPE_LABELS[report.hazardType];

  return (
    <Link to={link}>
      <Card className="interactive-card group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={report.severity} />
              <ReportStatusBadge status={report.status} />
            </div>
            {report.confidenceScore !== undefined && (
              <ConfidenceScore score={report.confidenceScore} size="sm" factors={report.confidenceFactors} explanation={report.analysisExplanation} showLabel={false} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-ocean-400">
            <span className="uppercase tracking-wider">{hazardLabel}</span>
          </div>
          <h3 className="mb-1 line-clamp-2 font-semibold text-slate-100">
            {report.title}
          </h3>
          {!compact && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{report.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {report.districtName}, {report.stateCode}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {formatRelativeTime(report.observedAt)}
            </span>
            {!report.isAnonymous && report.reporterName && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden="true" />
                {report.reporterName}
              </span>
            )}
            {report.isAnonymous && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden="true" />
                Anonymous
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
export function EvidenceCard({ media }: { media: any }) {
  const isImage = String(media?.contentType || '').startsWith('image/');
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
      {isImage && media?.url ? (
        <img src={media.url} alt={media.filename || 'Incident evidence'} width="448" height="112" loading="lazy" className="h-28 w-full object-cover" />
      ) : (
        <div className="flex h-28 items-center justify-center px-3 text-center text-xs text-slate-500">
          {media?.filename || 'Evidence attachment'}
        </div>
      )}
    </div>
  );
}
