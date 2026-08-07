import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge } from '@/components/features/SeverityBadge';
import { IncidentStatusBadge } from '@/components/features/StatusBadge';
import { ConfidenceScore } from '@/components/features/ConfidenceScore';
import { ResponseTimeline } from '@/components/features/ResponseTimeline';
import { ResponseTeamCard } from '@/components/features/ResponseTeamCard';
import { EvidenceCard } from '@/components/features/ReportCard';
import { incidentService } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { hasSupervisorAccess } from '@/navigation/route-access';
import { HAZARD_TYPE_LABELS, INCIDENT_STATUS_OPTIONS } from '@/types';
import type { IncidentStatus, ResponseTeamType, ResponseTeamMember } from '@/types';
import { useToast } from '@/hooks/useToast';
import {
  ArrowLeft, MapPin, Clock, Users, Phone, AlertTriangle,
  CheckCircle, XCircle, Activity, UserPlus, Building2,
} from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';

export function AuthorityIncidentDetail() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role } = useAuth();
  const isSupervisor = hasSupervisorAccess(role);
  const queryClient = useQueryClient();

  const [analystNotes, setAnalystNotes] = useState('');
  const [showAssignTeam, setShowAssignTeam] = useState(false);

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => incidentService.getById(incidentId!),
    enabled: !!incidentId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: IncidentStatus) =>
      incidentService.updateStatus(incidentId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast({ title: 'Status updated', variant: 'success' });
    },
  });

  const assignTeamMutation = useMutation({
    mutationFn: (team: { name: string; type: ResponseTeamType; members: ResponseTeamMember[] }) =>
      incidentService.assignTeam(incidentId!, team),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      toast({ title: 'Response team assigned', variant: 'success' });
      setShowAssignTeam(false);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => incidentService.verify(incidentId!, analystNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      toast({ title: 'Incident verified and published', variant: 'success' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-slate-600" />
        <h2 className="text-xl font-semibold text-slate-200">Incident not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/authority/incidents')}>
          Back to Incidents
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/authority/incidents')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">{incident.title}</h1>
              <IncidentStatusBadge status={incident.status} />
            </div>
            <p className="mt-1 font-mono text-xs text-slate-500">{incident.id}</p>
          </div>
        </div>
        <SeverityBadge severity={incident.severity} size="lg" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {incident.status === 'assigned' && (
          <Button
            onClick={() => updateStatusMutation.mutate('responding')}
            disabled={updateStatusMutation.isPending}
          >
            <Activity className="mr-2 h-4 w-4" />
            Start Response
          </Button>
        )}
        {incident.status === 'responding' && (
          <Button
            onClick={() => updateStatusMutation.mutate('monitoring')}
            disabled={updateStatusMutation.isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Monitoring
          </Button>
        )}
        {incident.status === 'monitoring' && isSupervisor && (
          <Button
            variant="success"
            onClick={() => updateStatusMutation.mutate('resolved')}
            disabled={updateStatusMutation.isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Resolve Incident
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={() => updateStatusMutation.mutate('cancelled')}
          disabled={updateStatusMutation.isPending || incident.status === 'resolved'}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAssignTeam(!showAssignTeam)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Response Team
        </Button>
      </div>

      {showAssignTeam && (
        <Card className="border-ocean-500/30">
          <CardHeader>
            <CardTitle>Assign a response team</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {[
              { name: 'Coast Guard Rapid Unit', type: 'coast_guard' as const, members: [{ id: 'CG-1', name: 'Arun Kumar', role: 'Team Lead' }] },
              { name: 'District Marine Police', type: 'marine_police' as const, members: [{ id: 'MP-1', name: 'Lakshmi N', role: 'Inspector' }] },
              { name: 'Volunteer Coastal Rescue', type: 'volunteer' as const, members: [{ id: 'VR-1', name: 'Senthil R', role: 'Coordinator' }] },
            ].map((team) => (
              <Button
                key={team.name}
                variant="outline"
                className="h-auto justify-start py-3 text-left"
                disabled={assignTeamMutation.isPending}
                onClick={() => assignTeamMutation.mutate(team)}
              >
                <Building2 className="mr-2 h-4 w-4 shrink-0" />
                <span><span className="block font-medium">{team.name}</span><span className="block text-xs text-slate-500">{team.members.length} lead assigned</span></span>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">{incident.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs uppercase text-slate-500">Hazard Type</p>
                  <p className="mt-1 font-medium text-slate-200">
                    {HAZARD_TYPE_LABELS[incident.hazardType]}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Created</p>
                  <p className="mt-1 font-medium text-slate-200">
                    {formatDateTime(incident.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Location</p>
                  <p className="mt-1 flex items-center gap-1 font-medium text-slate-200">
                    <MapPin className="h-3 w-3" />
                    {incident.location.latitude.toFixed(4)}, {incident.location.longitude.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">District</p>
                  <p className="mt-1 font-medium text-slate-200">
                    {incident.location.districtName}, {incident.location.stateCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          {incident.evidence && incident.evidence.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evidence ({incident.evidence.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {incident.evidence.map((ev, i) => (
                    <EvidenceCard key={i} media={ev} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Response Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponseTimeline incident={incident} />
            </CardContent>
          </Card>

          {/* Analyst Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Analyst Notes & Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incident.verification?.analystNotes && (
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                  <p className="text-xs text-slate-500">Previous notes</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {incident.verification.analystNotes}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">Add verification notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Document your assessment, evidence review, and verification decision..."
                  value={analystNotes}
                  onChange={(e) => setAnalystNotes(e.target.value)}
                  rows={4}
                />
              </div>
              {isSupervisor ? (
                <Button
                  onClick={() => verifyMutation.mutate()}
                  disabled={verifyMutation.isPending || !analystNotes.trim()}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify & Publish Incident
                </Button>
              ) : (
                <p className="rounded-lg border border-dashed px-3 py-2.5 text-xs text-slate-500">
                  Verification and publishing are restricted to authority supervisors. You can prepare notes here for the supervisor&rsquo;s review.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Meta */}
        <div className="space-y-6">
          {/* Confidence */}
          {incident.confidenceScore !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle>AI Confidence Score</CardTitle>
              </CardHeader>
              <CardContent>
                <ConfidenceScore
                  score={incident.confidenceScore}
                  factors={incident.confidenceFactors}
                  explanation={incident.analysisExplanation}
                  size="lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Response Teams */}
          <Card>
            <CardHeader>
              <CardTitle>Response Teams ({incident.responseTeams?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {incident.responseTeams && incident.responseTeams.length > 0 ? (
                incident.responseTeams.map((team) => (
                  <ResponseTeamCard key={team.id} team={team} />
                ))
              ) : (
                <p className="text-sm text-slate-400">No teams assigned yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Public Alert Status */}
          <Card>
            <CardHeader>
              <CardTitle>Public Alert</CardTitle>
            </CardHeader>
            <CardContent>
              {incident.publicAlert ? (
                <div className="space-y-2">
                  <Badge variant="success">Published</Badge>
                  <p className="text-xs text-slate-400">
                    Published {formatRelativeTime(incident.publicAlert.publishedAt || incident.createdAt)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Reach: {incident.publicAlert.reachEstimate?.toLocaleString()} citizens
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">
                    No public alert has been issued for this incident.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/authority/incidents/${incident.id}/alert`}>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Issue Public Alert
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}