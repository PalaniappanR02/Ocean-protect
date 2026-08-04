import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('page-header', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <Icon className="page-header__icon mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <h1 className="text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-tight tracking-[-0.035em]">{title}</h1>
          {description && <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
