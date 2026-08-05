import React, { Suspense } from 'react';
const HazardMap = React.lazy(() => import('@/components/features/HazardMap').then((mod) => ({ default: (mod as any).HazardMap })) as any);

export function MapPreview({ reports, incidents, regions }: any) {
  return (
    <div className="rounded-2xl border bg-paper-2 p-2">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Map preview</h3>
        <div className="text-xs text-muted-foreground">Preview</div>
      </div>
      <div className="h-64 overflow-hidden rounded-lg">
        <Suspense fallback={<div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100" />}> 
          <HazardMap reports={reports} incidents={incidents} regions={regions} className="h-64 rounded-lg" />
        </Suspense>
      </div>
    </div>
  );
}
