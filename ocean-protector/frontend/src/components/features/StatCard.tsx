import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const colorClasses: Record<string, string> = {
  ocean: 'text-primary bg-muted border-border',
  red: 'text-destructive bg-red-50 border-red-400',
  amber: 'text-amber-300 bg-amber-50 border-amber-400',
  orange: 'text-orange-300 bg-orange-50 border-orange-400',
  green: 'text-green-300 bg-green-50 border-green-400',
  blue: 'text-blue-300 bg-blue-50 border-blue-400',
};
export function StatCard({ label, value, icon: Icon, color='ocean', trend }: { label:string; value:string|number; icon:LucideIcon; color?:string; trend?:string }) {
  return <Card><CardContent className="flex min-h-[108px] items-center justify-between p-4 sm:p-5"><div><p className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold leading-none tracking-tight">{value}</p>{trend && <p className="mt-2 text-[11px] text-muted-foreground">{trend}</p>}</div><div className={`rounded-md border p-3 ${colorClasses[color] || colorClasses.ocean}`}><Icon className="h-5 w-5" aria-hidden="true" /></div></CardContent></Card>;
}
