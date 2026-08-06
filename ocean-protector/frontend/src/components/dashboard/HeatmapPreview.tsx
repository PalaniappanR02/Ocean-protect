import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const HazardMap: any = React.lazy(() => import('@/components/features/HazardMap').then((m) => ({ default: (m as any).HazardMap })));

interface HeatmapPreviewProps {
  reports?: any[];
  incidents?: any[];
  regions?: any[];
}

export const HeatmapPreview: React.FC<HeatmapPreviewProps> = ({ reports, incidents, regions }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Heatmap preview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[320px]">
          <Suspense fallback={<div className="h-full w-full bg-gradient-to-br from-indigo-900 to-sky-800/30" /> }>
            <HazardMap reports={reports} incidents={incidents} regions={regions} className="h-full" />
          </Suspense>
          <div className="absolute bottom-3 right-3">
            <Button asChild size="sm">
              <a href="/analyst/map"><MapPin className="mr-2 h-4 w-4" />Open Map</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapPreview;
