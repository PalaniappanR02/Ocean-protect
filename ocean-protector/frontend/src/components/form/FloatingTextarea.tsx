import React from 'react';
import { cn } from '@/lib/utils';

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(({ label, className, ...props }, ref) => {
  return (
    <label className={cn('relative block w-full', className)}>
      <textarea
        ref={ref}
        {...props}
        className={cn('field-control peer min-h-[6rem] w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder-transparent focus:outline-none')}
        placeholder={label}
      />
      <span className="pointer-events-none absolute left-3 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs">
        {label}
      </span>
    </label>
  );
});
FloatingTextarea.displayName = 'FloatingTextarea';

export default FloatingTextarea;
