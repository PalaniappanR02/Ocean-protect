import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Label } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { reportService } from '@/services';
import { getCoastalRegionByLocation } from '@/mock/coastalRegions';
import { HAZARD_TYPE_LABELS, type HazardType } from '@/types';
import { FileWarning, MapPin, Camera, Clock, User, Phone, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const reportSchema = z.object({
  hazardType: z.enum([
    'high_waves', 'tsunami', 'coastal_flooding', 'storm_surge',
    'oil_spill', 'abnormal_tide', 'marine_pollution', 'coastal_erosion',
    'damaged_vessel', 'strong_current', 'person_in_danger', 'other',
  ]),
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
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
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      hazardType: 'high_waves',
      isAnonymous: false,
    },
  });

  const isAnonymous = watch('isAnonymous');

  const handleGetLocation = () => {
    getLocation();
  };

  // Set location after the browser geolocation request resolves.
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setSelectedLocation({ lat: latitude, lon: longitude });
    }
  }, [latitude, longitude]);

  const onSubmit = async (data: ReportForm) => {
    if (!selectedLocation) {
      toast({
        title: 'Location Required',
        description: 'Please share your location to submit a report.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const region = getCoastalRegionByLocation(selectedLocation.lat, selectedLocation.lon);
      const observedAt = new Date().toISOString();

      if (!isOnline) {
        // Add to offline queue
        await addToQueue({
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
          locationSource: 'device_gps',
          stateCode: region?.stateCode || 'TN',
          districtName: region?.districtName || 'Unknown',
          observedAt,
          mediaUrls: [],
        });
        navigate('/citizen/offline');
        return;
      }

      // Submit online
      const report = await reportService.create({
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
        locationSource: 'device_gps',
        stateCode: region?.stateCode || 'TN',
        districtName: region?.districtName || 'Unknown',
        observedAt,
        mediaUrls: [],
      });

      toast({
        title: 'Report Submitted',
        description: `Your tracking ID is ${report.trackingId}`,
        variant: 'success',
      });
      navigate(`/citizen/tracking/${report.trackingId}`);
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <PageHeader
        title="Report a Coastal Hazard"
        description="Help protect your community by reporting coastal hazards. Your report will be reviewed by emergency response analysts."
        icon={FileWarning}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hazard Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-ocean-400" />
              Hazard Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(Object.keys(HAZARD_TYPE_LABELS) as HazardType[]).map((type) => (
                <label
                  key={type}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:border-ocean-500/50',
                    watch('hazardType') === type && 'border-ocean-500 bg-ocean-500/10'
                  )}
                >
                  <input
                    type="radio"
                    value={type}
                    {...register('hazardType')}
                    className="sr-only"
                  />
                  <span className="text-xs font-medium text-slate-200">
                    {HAZARD_TYPE_LABELS[type]}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Describe the Hazard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief summary of the hazard"
                {...register('title')}
              />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describe what you are seeing. Include details about the size, direction, affected areas, and any people in danger."
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-ocean-400" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLocation ? (
              <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                <div>
                  <p className="text-sm font-medium text-green-400">Location captured</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lon.toFixed(6)}
                  </p>
                  {accuracy && (
                    <p className="text-xs text-muted-foreground">Accuracy: ±{Math.round(accuracy)}m</p>
                  )}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedLocation(null); getLocation(); }}>
                  Update
                </Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={handleGetLocation} disabled={geoLoading} className="w-full">
                {geoLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                {geoLoading ? 'Getting location...' : 'Share My Location'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isAnonymous">Report Anonymously</Label>
                <p className="text-xs text-muted-foreground">Your name and phone will not be stored</p>
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
                    <User className="h-3.5 w-3.5" />
                    Your Name
                  </Label>
                  <Input id="reporterName" placeholder="Enter your name" {...register('reporterName')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporterPhone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Phone Number
                  </Label>
                  <Input id="reporterPhone" placeholder="+91-XXXXXXXXXX" {...register('reporterPhone')} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting || !selectedLocation} className="flex-1">
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileWarning className="mr-2 h-4 w-4" />
            )}
            {submitting ? 'Submitting...' : isOnline ? 'Submit Report' : 'Save Offline'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/citizen')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}