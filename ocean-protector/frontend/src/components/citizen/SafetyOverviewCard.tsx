import React from 'react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import type { LucideIcon } from 'lucide-react';

export function SafetyOverviewCard({ label, value, subtitle, Icon, progress, trend }: { label: string; value: number; subtitle?: string; Icon?: LucideIcon; progress?: number; trend?: string }) {
  return <DashboardCard label={label} value={value} subtitle={subtitle} Icon={Icon} progress={progress} trend={trend} />;
}
