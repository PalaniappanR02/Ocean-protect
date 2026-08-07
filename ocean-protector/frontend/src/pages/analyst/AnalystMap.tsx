import { useQuery } from '@tanstack/react-query';
import { Map } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import MapShell from '@/components/map/MapShell';
import { Card, CardContent } from '@/components/ui/card';
import { reportService, incidentService, regionService, socialService } from '@/services';
import { useRealtime } from '@/hooks/useRealtime';
export function AnalystMap(){
  useRealtime();
  const {data:reports}=useQuery({queryKey:['reports','analyst-map'],queryFn:()=>reportService.list({}, {pageSize:100})});
  const {data:incidents}=useQuery({queryKey:['incidents','analyst-map'],queryFn:()=>incidentService.list()});
  const {data:regions}=useQuery({queryKey:['regions'],queryFn:()=>regionService.list()});
  const {data:hotspots}=useQuery({queryKey:['social-hotspots'],queryFn:()=>socialService.getHotspots(),refetchInterval:60000});
    return <div className="animate-fade-in"><PageHeader title="Analyst Hazard Map" description="Review citizen reports, incidents, social-signal hotspots, and coastal priority regions" icon={Map}/><Card><CardContent className="p-0"><MapShell reports={reports?.items||[]} incidents={incidents||[]} regions={regions||[]} hotspots={hotspots||[]} className="h-[60vh] md:h-[75vh] lg:h-[calc(100dvh-12rem)] rounded-lg"/></CardContent></Card></div>;
}
