import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SeverityBadge } from '@/components/features/SeverityBadge';
import { alertService, incidentService } from '@/services';
import { useToast } from '@/hooks/useToast';
import { SEVERITY_LABELS, HAZARD_TYPE_LABELS } from '@/types';
import { AlertTriangle, Send, ArrowLeft, Radio, Users, MapPin, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export function AuthorityAlert() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [estimatedReach, setEstimatedReach] = useState(50000);

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => incidentService.getById(incidentId!),
    enabled: !!incidentId,
  });

  const publishAlertMutation = useMutation({
    mutationFn: async () => {
      const currentIncident = incident;
      if (!currentIncident) throw new Error('Incident is unavailable.');
      const safetyInstructions = instructions
        .split(/\n|\./)
        .map((item) => item.trim())
        .filter(Boolean);

      const alert = await alertService.create({
        incidentId: currentIncident.id,
        incidentTitle: currentIncident.title,
        hazardType: currentIncident.hazardType,
        severity: currentIncident.severity,
        stateCode: currentIncident.location.stateCode,
        districtName: currentIncident.location.districtName,
        messageTitle: `${SEVERITY_LABELS[currentIncident.severity]} ${HAZARD_TYPE_LABELS[currentIncident.hazardType]} alert`,
        messageBody: message.trim(),
        safetyInstructions,
        affectedAreas: [currentIncident.location.districtName],
        channels: ['sms', 'push', 'web'],
        estimatedReach,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      });

      await incidentService.updateStatus(incidentId!, 'verified');
      return alert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Public Alert Published',
        description: `Alert sent to ~${estimatedReach.toLocaleString()} citizens`,
        variant: 'success',
      });
      navigate(`/authority/incidents/${incidentId}`);
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
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Issue Public Alert</h1>
          <p className="mt-1 text-sm text-slate-400">
            Compose and publish an emergency alert for citizens
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Alert Composer */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase text-slate-500">Incident</p>
                  <p className="mt-1 font-medium text-slate-200">{incident.title}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Severity</p>
                  <div className="mt-1">
                    <SeverityBadge severity={incident.severity} />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Hazard Type</p>
                  <p className="mt-1 font-medium text-slate-200">
                    {HAZARD_TYPE_LABELS[incident.hazardType]}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Location</p>
                  <p className="mt-1 flex items-center gap-1 font-medium text-slate-200">
                    <MapPin className="h-3 w-3" />
                    {incident.location.districtName}, {incident.location.stateCode}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Alert Message *</Label>
                <Textarea
                  id="message"
                  placeholder={`URGENT: ${SEVERITY_LABELS[incident.severity]} - ${HAZARD_TYPE_LABELS[incident.hazardType]} reported near ${incident.location.districtName}. Stay away from coastal areas.`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-slate-500">
                  This message will be sent via SMS, push notification, and displayed on all platforms.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Safety Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Move to higher ground. Avoid coastal roads. Follow instructions from local authorities."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reach">Estimated Reach</Label>
                <Input
                  id="reach"
                  type="number"
                  value={estimatedReach}
                  onChange={(e) => setEstimatedReach(parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-slate-500">
                  Number of citizens in the affected area
                </p>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-amber-200">
                      This alert will be immediately published to all citizens
                    </p>
                    <p className="mt-1 text-xs text-amber-300/70">
                      Once published, the alert cannot be retracted. Ensure all information is accurate.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => publishAlertMutation.mutate()}
                disabled={publishAlertMutation.isPending || !message.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                Publish Public Alert
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border-2 border-red-500/30 bg-red-500/5 p-4">
                <div className="flex items-center gap-2 border-b border-red-500/20 pb-2">
                  <Radio className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                    Emergency Alert
                  </span>
                </div>
                <div className="pt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={incident.severity} size="sm" />
                    <span className="text-xs text-slate-400">
                      {incident.location.districtName}, {incident.location.stateCode}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-100">
                    {message || 'Alert message will appear here...'}
                  </p>
                  {instructions && (
                    <p className="text-xs text-slate-400">{instructions}</p>
                  )}
                  <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      ~{estimatedReach.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Now
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribution Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Mobile App Push</span>
                <span className="text-green-400">✓ Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">SMS Gateway</span>
                <span className="text-green-400">✓ Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Public Dashboard</span>
                <span className="text-green-400">✓ Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Social Media API</span>
                <span className="text-green-400">✓ Ready</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
