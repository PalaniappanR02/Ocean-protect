import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'feedback-alert relative grid grid-cols-[auto_1fr] items-start gap-3 rounded-2xl border p-4 text-sm backdrop-blur-sm',
  {
    variants: {
      variant: {
        default: 'feedback-alert--info',
        info: 'feedback-alert--info',
        success: 'feedback-alert--success',
        warning: 'feedback-alert--warning',
        destructive: 'feedback-alert--danger',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div role="status" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertIcon({ variant = 'default' }: { variant?: AlertProps['variant'] }) {
  const iconClass = 'mt-0.5 h-5 w-5';
  if (variant === 'success') {
    return <CheckCircle2 className={cn(iconClass, 'text-emerald-500')} aria-hidden="true" />;
  }
  if (variant === 'warning') {
    return <TriangleAlert className={cn(iconClass, 'text-amber-500')} aria-hidden="true" />;
  }
  if (variant === 'destructive') {
    return <XCircle className={cn(iconClass, 'text-rose-500')} aria-hidden="true" />;
  }
  return <Info className={cn(iconClass, 'text-cyan-500')} aria-hidden="true" />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn('text-sm font-semibold leading-tight', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1 text-sm leading-relaxed text-muted-foreground', className)} {...props} />;
}
