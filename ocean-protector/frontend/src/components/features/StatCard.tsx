import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const colorClasses: Record<string, string> = { ocean:'text-ocean-400 bg-ocean-500/10', red:'text-red-400 bg-red-500/10', amber:'text-amber-400 bg-amber-500/10', orange:'text-orange-400 bg-orange-500/10', green:'text-emerald-400 bg-emerald-500/10', blue:'text-blue-400 bg-blue-500/10' };
export function StatCard({ label, value, icon: Icon, color='ocean', trend }: { label:string; value:string|number; icon:LucideIcon; color?:string; trend?:string }) {
  return <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-white">{value}</p>{trend && <p className="mt-1 text-xs text-slate-500">{trend}</p>}</div><div className={`rounded-lg p-3 ${colorClasses[color] || colorClasses.ocean}`}><Icon className="h-5 w-5" /></div></CardContent></Card>;
}
