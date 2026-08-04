import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { reportService } from '@/services';
import { getCoastalRegionByLocation } from '@/mock/coastalRegions';
import { HAZARD_TYPE_LABELS, type HazardType } from '@/types';
import {
  ArrowLeft,
  ArrowRight,
  FileWarning,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormStepIndicator } from '@/components/features/FormStepIndicator';

const reportSteps = ['Hazard', 'Details', 'Location', 'Review'] as const;

const reportSchema = z.object({
  hazardType: z.enum([
    'high_waves', 'tsunami', 'coastal_flooding', 'storm_surge',
    'oil_spill', 'abnormal_tide', 'marine_pollution', 'coastal_erosion',
    'damaged_vessel', 'strong_current', 'person_in_danger', 'other',
  ]),
  title: z.string().min(10, 'Add a short summary with at least 10 characters.'),
  description: z.string().min(20, 'Describe what you observed using at least 20 characters.'),
  isAnonymous: z.boolean(),
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
});

type ReportForm = z.infer<typeof reportSchema>;

export function ReportHazard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getLocation, latitude, longitude, accuracy, loading: geoLoading } = useGeolocation();
  const isOnline = useNetworkStatus();
  const { addToQueue } = useOfflineQueue();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      hazardType: 'high_waves',
      isAnonymous: false,
    },
  });

  const isAnonymous = watch('isAnonymous');
  const formValues = watch();

  const moveToStep = (nextStep: number) => {
    setStep(nextStep);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  const continueToNextStep = async () => {
    if (step === 0 && !(await trigger('hazardType'))) return;
    if (step === 1 && !(await trigger(['title', 'description']))) return;
    if (step === 2 && !selectedLocation) {
      toast({
        title: 'Location not captured',
        description: 'Share your current location before continuing.',
        variant: 'destructive',
      });
      return;
    }
    moveToStep(Math.min(reportSteps.length - 1, step + 1));
  };

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setSelectedLocation({ lat: latitude, lon: longitude });
    }
  }, [latitude, longitude]);

  const onSubmit = async (data: ReportForm) => {
    if (!selectedLocation) {
      toast({
        title: 'Location not captured',
        description: 'Share your current location before sending this report.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const region = getCoastalRegionByLocation(selectedLocation.lat, selectedLocation.lon);
      const observedAt = new Date().toISOString();
      const reportPayload = {
        hazardType: data.hazardType,
        title: data.title,
        description: data.description,
        languageCode: 'en',
        isAnonymous: data.isAnonymous,
        reporterName: data.isAnonymous ? undefined : data.reporterName,
        reporterPhone: data.isAnonymous ? undefined : data.reporterPhone,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lon,
        locationAccuracyMeters: accuracy || undefined,
        locationSource: 'device_gps' as const,
        stateCode: region?.stateCode || 'TN',
        districtName: region?.districtName || 'Unknown',
        observedAt,
        mediaUrls: [],
      };

      if (!isOnline) {
        await addToQueue(reportPayload);
        navigate('/citizen/offline');
        return;
      }

      const report = await reportService.create(reportPayload);
      toast({
        title: 'Report received',
        description: `Tracking ID: ${report.trackingId}`,
        variant: 'success',
      });
      navigate(`/citizen/tracking/${report.trackingId}`);
    } catch (error) {
      toast({
        title: 'Report was not sent',
        description: `${(error as Error).message} Check your connection, then try again.`,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <PageHeader
        title="Report a coastal hazard"
        description="Four short steps. Share only what you can observe safely—never approach dangerous water to collect details."
        icon={FileWarning}
      />
      <FormStepIndicator steps={reportSteps} currentStep={step} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>What did you observe?</CardTitle>
            </CardHeader>
            <CardContent>
              <fieldset>
                <legend className="sr-only">Choose one coastal hazard type</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(Object.keys(HAZARD_TYPE_LABELS) as HazardType[]).map((type) => {
                    const selected = watch('hazardType') === type;
                    return (
                      <label
                        key={type}
                        className={cn('hazard-choice', selected && 'hazard-choice--selected')}
                      >
                        <input type="radio" value={type} {...register('hazardType')} className="sr-only" />
                        <span className="text-xs font-semibold sm:text-sm">{HAZARD_TYPE_LABELS[type]}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Describe what happened</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Short summary</Label>
                <Input
                  id="title"
                  placeholder="Example: Large waves crossing the sea wall"
                  aria-required="true"
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby="title-help"
                  {...register('title')}
                />
                <p id="title-help" className={cn('min-h-[1lh] text-xs', errors.title ? 'text-destructive' : 'text-muted-foreground')}>
                  {errors.title?.message || 'Name the hazard and the place where possible.'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">What you saw</Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="Include direction, affected area, and whether anyone is in danger."
                  aria-required="true"
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby="description-help"
                  {...register('description')}
                />
                <p id="description-help" className={cn('min-h-[1lh] text-xs', errors.description ? 'text-destructive' : 'text-muted-foreground')}>
                  {errors.description?.message || 'Describe only what you can observe from a safe place.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                Share the hazard location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLocation ? (
                <div className="flex flex-col gap-4 rounded-lg border border-green-400 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between" role="status">
                  <div>
                    <p className="text-sm font-semibold text-green-300">Location captured</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {selectedLocation.lat.toFixed(6)}, {selectedLocation.lon.toFixed(6)}
                    </p>
                    {accuracy && <p className="mt-1 text-xs text-muted-foreground">Accuracy: ±{Math.round(accuracy)} m</p>}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setSelectedLocation(null); getLocation(); }}>
                    Update location
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" onClick={getLocation} disabled={geoLoading} className="w-full" aria-live="polite">
                  {geoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />}
                  {geoLoading ? 'Finding location…' : 'Share current location'}
                </Button>
              )}
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                OceanGuard uses these coordinates to identify the coastal district and compare nearby reports.
              </p>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Choose your privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor="isAnonymous">Report anonymously</Label>
                    <p className="mt-1 text-xs text-muted-foreground">Your name and phone number will not be stored.</p>
                  </div>
                  <Switch
                    id="isAnonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setValue('isAnonymous', checked)}
                  />
                </div>
                {!isAnonymous && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="reporterName" className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" aria-hidden="true" />
                        Your name
                      </Label>
                      <Input id="reporterName" placeholder="Example: Kavya Nair" {...register('reporterName')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reporterPhone" className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        Phone number
                      </Label>
                      <Input id="reporterPhone" inputMode="tel" placeholder="Example: +91 98765 43210" {...register('reporterPhone')} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                  Review before sending
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 text-sm sm:grid-cols-2">
                <ReviewItem label="Hazard" value={HAZARD_TYPE_LABELS[formValues.hazardType]} />
                <ReviewItem label="Location" value={selectedLocation ? `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lon.toFixed(4)}` : 'Not captured'} />
                <ReviewItem label="Summary" value={formValues.title || 'Not provided'} className="sm:col-span-2" />
                <ReviewItem label="Privacy" value={isAnonymous ? 'Anonymous report' : 'Contact details shared with authorised reviewers'} />
                <ReviewItem label="Connection" value={isOnline ? 'Ready to send online' : 'Will be saved offline'} />
              </CardContent>
            </Card>
          </>
        )}

        <div className="report-actions sticky bottom-20 z-10 flex items-center gap-2 py-3 lg:bottom-0">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => moveToStep(step - 1)} aria-label="Go to previous step">
              <ArrowLeft className="h-4 w-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}
          {step < reportSteps.length - 1 ? (
            <Button type="button" onClick={continueToNextStep} className="flex-1">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" disabled={submitting || !selectedLocation} className="flex-1" aria-busy={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <FileWarning className="mr-2 h-4 w-4" aria-hidden="true" />}
              {submitting ? 'Sending report…' : isOnline ? 'Send report' : 'Save offline'}
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/citizen')} aria-label="Cancel report">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function ReviewItem({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
