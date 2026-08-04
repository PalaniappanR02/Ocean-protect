import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'glass-panel-soft flex flex-col items-center justify-center rounded-2xl border-dashed p-8 text-center sm:p-12',
        className
      )}
    >
      <Icon className="mb-4 h-8 w-8 text-slate-500" aria-hidden="true" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-600">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
