import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'button-base inline-flex items-center justify-center whitespace-nowrap text-sm focus-visible:outline-none disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'button-primary',
        destructive: 'button-danger',
        outline: 'button-outline',
        secondary: 'button-secondary',
        ghost: 'button-ghost',
        link: 'button-link underline-offset-4 hover:underline',
        success: 'button-success',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-11 px-3',
        lg: 'h-12 px-6 sm:px-8',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
