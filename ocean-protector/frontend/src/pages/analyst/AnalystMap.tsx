import { useQuery } from '@tanstack/react-query';
import { Map } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { HazardMap } from '@/components/features/HazardMap';
import { Card, CardContent } from '@/components/ui/card';
import { reportService, incidentService, regionService } from '@/services';
export function AnalystMap(){
  const {data:reports}=useQuery({queryKey:['reports','analyst-map'],queryFn:()=>reportService.list({}, {pageSize:100})});
  const {data:incidents}=useQuery({queryKey:['incidents','analyst-map'],queryFn:()=>incidentService.list()});
  const {data:regions}=useQuery({queryKey:['regions'],queryFn:()=>regionService.list()});
  return <div className="animate-fade-in"><PageHeader title="Analyst Hazard Map" description="Review citizen reports, incidents, and coastal priority regions" icon={Map}/><Card><CardContent className="p-0"><HazardMap reports={reports?.items||[]} incidents={incidents||[]} regions={regions||[]} className="h-[700px] rounded-lg"/></CardContent></Card></div>;
}
