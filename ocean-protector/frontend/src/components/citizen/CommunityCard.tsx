import React from 'react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';

export function CommunityCard({ label, value }: { label: string; value: number }) {
  return <DashboardCard label={label} value={value} subtitle={undefined} Icon={undefined} progress={Math.min(100, value)} />;
}
