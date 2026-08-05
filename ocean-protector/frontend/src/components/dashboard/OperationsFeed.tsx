import React from 'react';
import { RecentActivity } from './RecentActivity';

export const OperationsFeed: React.FC<{ activities?: any[] }> = ({ activities = [] }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold">Recent operations</h3>
      <div className="mt-3">
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
};

export default OperationsFeed;
