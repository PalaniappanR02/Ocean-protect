import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[70] flex max-h-screen w-full flex-col-reverse gap-2 p-3 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[440px] md:p-4',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'toast-surface group pointer-events-auto relative flex w-full items-start justify-between gap-3 overflow-hidden p-4 pr-10 transition-[opacity,transform] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'toast-info',
        info: 'toast-info',
        destructive: 'toast-danger destructive group',
        success: 'toast-success',
        warning: 'toast-warning',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    duration={5000}
    data-variant={variant ?? 'default'}
    {...props}
  />
));
Toast.displayName = ToastPrimitives.Root.displayName;

function ToastIcon({ variant }: { variant?: VariantProps<typeof toastVariants>['variant'] }) {
  const iconClass = 'h-5 w-5 shrink-0';
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

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold leading-tight tracking-tight', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('text-[13px] leading-relaxed opacity-95', className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn('absolute right-2 top-2 rounded-md p-1 text-foreground/70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none', className)}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

function ToastProgress() {
  return (
    <div aria-hidden="true" className="toast-progress-wrap absolute inset-x-0 bottom-0 h-[3px]">
      <div className="toast-progress h-full" />
    </div>
  );
}

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastIcon,
  ToastProgress,
};
