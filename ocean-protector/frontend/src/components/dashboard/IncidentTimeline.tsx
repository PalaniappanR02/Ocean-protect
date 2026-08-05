import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SEVERITY_COLORS } from '@/types';
import { Clock } from 'lucide-react';

interface IncidentTimelineProps {
  incidents?: any[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ incidents = [] }) => {
  return (
    <div className="space-y-3">
      {incidents.slice(0, 6).map((inc) => (
        <Card key={inc.id} className="flex items-start gap-3 p-3">
          <div className="mt-1 h-3 w-3 rounded-full" style={{ background: (SEVERITY_COLORS as any)[inc.severity] }} />
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="font-medium">{inc.title}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2"><Clock className="h-3 w-3" />{new Date(inc.startTime).toLocaleString()}</div>
            </div>
            <div className="text-sm text-muted-foreground">{inc.location?.districtName}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IncidentTimeline;
