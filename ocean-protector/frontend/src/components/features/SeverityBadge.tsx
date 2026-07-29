import { cn } from '@/lib/utils';
import type { Severity } from '@/types';
import { SEVERITY_LABELS } from '@/types';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const severityConfig: Record<Severity, { class: string; dot: string }> = {
  low: { class: 'severity-low', dot: 'bg-green-500' },
  advisory: { class: 'severity-advisory', dot: 'bg-amber-500' },
  warning: { class: 'severity-warning', dot: 'bg-orange-500' },
  critical: { class: 'severity-critical', dot: 'bg-red-500' },
};

export function SeverityBadge({ severity, size = 'sm', showIcon = true }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }[size];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      config.class,
      sizeClass,
    )}>
      {showIcon && <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />}
      {SEVERITY_LABELS[severity]}
    </span>
  );
}