import { cn } from '@/lib/utils';
import type { Severity } from '@/types';
import { SEVERITY_LABELS } from '@/types';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const severityConfig: Record<Severity, { class: string; dot: string }> = {
  low: { class: 'border-green-200 bg-green-50 text-green-800', dot: 'bg-green-700' },
  advisory: { class: 'border-yellow-200 bg-yellow-50 text-yellow-800', dot: 'bg-yellow-600' },
  warning: { class: 'border-orange-200 bg-orange-50 text-orange-800', dot: 'bg-orange-600' },
  critical: { class: 'border-red-300 bg-red-50 font-bold text-red-800', dot: 'bg-red-700' },
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
      {showIcon && <span className={cn('h-2 w-2 rounded-full', config.dot)} aria-hidden="true" />}
      {SEVERITY_LABELS[severity]}
    </span>
  );
}
