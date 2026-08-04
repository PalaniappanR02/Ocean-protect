import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { HazardMap } from '@/components/features/HazardMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportService, incidentService, regionService } from '@/services';
import { Map } from 'lucide-react';

export function CitizenMap() {
  const { data: reports } = useQuery({
    queryKey: ['reports', 'public'],
    queryFn: () => reportService.list({ isPublic: true }, { pageSize: 100 }),
  });

  const { data: incidents } = useQuery({
    queryKey: ['incidents', 'public'],
    queryFn: () => incidentService.list({ status: ['verified', 'responding', 'monitoring'] }),
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionService.list(),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Coastal Hazard Map"
        description="View verified coastal hazards and active incidents across South India"
        icon={Map}
      />

      <Card>
        <CardContent className="p-0">
          <HazardMap
            reports={reports?.items || []}
            incidents={incidents || []}
            regions={regions || []}
            className="h-[700px] rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-xs">
            <LegendItem color="var(--color-success)" label="Low severity" />
            <LegendItem color="var(--color-warning)" label="Advisory" />
            <LegendItem color="var(--color-warning)" label="Warning" />
            <LegendItem color="var(--color-danger)" label="Critical" />
            <LegendItem color="var(--color-accent)" label="Coastal region" outlined />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LegendItem({ color, label, outlined }: { color: string; label: string; outlined?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 w-3 rounded-full"
        style={outlined ? { border: `2px solid ${color}`, background: 'transparent' } : { backgroundColor: color }}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
