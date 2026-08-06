import React, { Suspense, useState } from 'react';
import { HazardMap } from '@/components/features/HazardMap';
import MapToolbar from './MapToolbar';
import FloatingLegend from './FloatingLegend';
import MapFilters from './MapFilters';
import IncidentPopupCard from './IncidentPopupCard';
import WeatherWidget from './WeatherWidget';
import MapAnalytics from './MapAnalytics';
import LiveStatusWidget from './LiveStatusWidget';
import FloatingActionButtons from './FloatingActionButtons';
import MapSkeleton from './MapSkeleton';

interface MapShellProps {
  reports?: any[];
  incidents?: any[];
  regions?: any[];
  className?: string;
}

export const MapShell: React.FC<MapShellProps> = ({ reports = [], incidents = [], regions = [], className }) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <div className={`relative h-full ${className || ''}`}>
      <Suspense fallback={<MapSkeleton />}>
        <HazardMap
          reports={reports}
          incidents={incidents}
          regions={regions}
          onMarkerClick={(id: string) => {
            const s = incidents.find((i: any) => i.id === id) || reports.find((r: any) => r.id === id);
            setSelected(s || null);
          }}
          className="h-full rounded-lg"
        />
      </Suspense>

      {/* Floating overlays */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-4 top-4 pointer-events-auto"><MapToolbar onReset={()=>{}} onLocate={()=>{}} onToggleFilters={()=>setFiltersOpen(true)} /></div>
        <div className="absolute left-4 top-28 pointer-events-auto"><WeatherWidget/></div>
        <div className="absolute right-4 top-4 pointer-events-auto"><FloatingLegend items={[{color:'var(--color-success)', label:'Low'},{color:'var(--color-warning)', label:'Medium'},{color:'var(--color-danger)', label:'High'},{color:'#8B0E0E', label:'Critical'}]} /></div>
        <div className="absolute right-4 bottom-28 pointer-events-auto"><MapAnalytics stats={{count: reports.length + incidents.length, verified: reports.filter(r=>r.status==='verified').length, critical: incidents.filter((i:any)=>i.severity==='critical').length}}/></div>
        <div className="absolute right-4 bottom-4 pointer-events-auto"><FloatingActionButtons/></div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 pointer-events-auto">{selected && <IncidentPopupCard incident={selected} />}</div>
        {filtersOpen && (
          <div className="absolute left-0 top-0 bottom-0 pointer-events-auto">
            <MapFilters onClose={()=>setFiltersOpen(false)} onApply={(f)=>{ setFiltersOpen(false); /* UI-only: external filter apply hook if needed */ }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapShell as any;
