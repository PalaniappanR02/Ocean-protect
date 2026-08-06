import React from 'react';
import QuickActionCard from './QuickActionCard';
import { FileWarning, Bell, Map as MapIcon, Users } from 'lucide-react';

export const QuickActionGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <QuickActionCard Icon={Users} label="Deploy Team" description="Dispatch response teams" onActivate={() => window.location.assign('/authority/teams')} />
      <QuickActionCard Icon={Bell} label="Broadcast Alert" description="Send public alert" onActivate={() => window.location.assign('/authority/alerts/new')} />
      <QuickActionCard Icon={MapIcon} label="Open Incident" description="Open incident map" onActivate={() => window.location.assign('/authority/incidents')} />
      <QuickActionCard Icon={FileWarning} label="Generate Report" description="Export incident report" onActivate={() => {/* noop */}} />
      <QuickActionCard Icon={Users} label="View Resources" description="Resource inventory" onActivate={() => window.location.assign('/authority/resources')} />
      <QuickActionCard Icon={MapIcon} label="Monitor Map" description="Live map monitor" onActivate={() => window.location.assign('/authority/map')} />
    </div>
  );
};

export default QuickActionGrid;
