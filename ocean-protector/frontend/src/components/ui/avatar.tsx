import * as React from 'react';
import { cn } from '@/lib/utils';
export function Avatar({className,...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-800',className)} {...props}/>}
export function AvatarImage({ width = 40, height = 40, loading = 'lazy', ...props }: React.ImgHTMLAttributes<HTMLImageElement>){return <img width={width} height={height} loading={loading} className="aspect-square h-full w-full object-cover" {...props}/>}
export function AvatarFallback({className,...props}:React.HTMLAttributes<HTMLDivElement>){return <div className={cn('flex h-full w-full items-center justify-center rounded-full text-xs text-slate-300',className)} {...props}/>}
