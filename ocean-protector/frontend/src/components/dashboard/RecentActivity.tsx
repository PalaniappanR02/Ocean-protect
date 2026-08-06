import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface RecentActivityProps {
  activities?: any[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities = [] }) => {
  return (
    <div className="space-y-3">
      {activities.slice(0, 8).map((a, i) => (
        <Card key={i} className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{a.title || a.message}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2"><Clock className="h-3 w-3" />{a.time ? new Date(a.time).toLocaleString() : ''}</div>
            </div>
            {a.meta && <div className="mt-1 text-xs text-muted-foreground">{a.meta}</div>}
          </CardContent>
        </Card>
      ))}
      {activities.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">No recent activity</div>}
    </div>
  );
};

export default RecentActivity;
