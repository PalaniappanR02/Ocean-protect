import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;
export const Checkbox = React.forwardRef<HTMLInputElement, Props>(({className, checked, ...props}, ref) => <label className="inline-flex items-center"><input ref={ref} type="checkbox" checked={checked} className="peer sr-only" {...props}/><span className={cn('flex h-4 w-4 items-center justify-center rounded border border-slate-600 bg-slate-950 peer-checked:border-ocean-500 peer-checked:bg-ocean-600',className)}>{checked && <Check className="h-3 w-3 text-white"/>}</span></label>);
Checkbox.displayName='Checkbox';
