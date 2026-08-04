import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'badge-base inline-flex items-center px-2.5 py-1 text-xs font-semibold focus:outline-none',
  {
    variants: {
      variant: {
        default: 'badge-default',
        secondary: 'badge-secondary',
        destructive: 'badge-danger',
        outline: 'badge-outline',
        warning: 'badge-warning',
        info: 'badge-secondary',
        success: 'badge-success',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
