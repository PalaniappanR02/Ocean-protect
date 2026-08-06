import React from 'react';
import { cn } from '@/lib/utils';

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ComponentType<any>;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(({ label, icon: Icon, className, ...props }, ref) => {
  return (
    <label className={cn('relative block w-full', className)}>
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
      )}
      <input
        ref={ref}
        {...props}
        className={cn('field-control peer h-12 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder-transparent focus:outline-none', Icon ? 'pl-10' : 'pl-3')}
        placeholder={label}
      />
      <span className="pointer-events-none absolute left-3 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs">
        {label}
      </span>
    </label>
  );
});
FloatingInput.displayName = 'FloatingInput';

export default FloatingInput;
