import { Link, useLocation } from 'react-router-dom';
import { Bell, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopBar({ role }: { role: 'citizen' | 'analyst' | 'authority' }) {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3 lg:hidden"><Waves className="h-6 w-6 text-ocean-400" /><span className="font-bold text-white">OceanGuard</span></div>
      <div className="hidden text-sm text-slate-400 lg:block">{location.pathname}</div>
      <div className="flex items-center gap-2">
        <div className="hidden rounded-lg border border-slate-800 p-1 sm:flex">
          {(['citizen','analyst','authority'] as const).map((item) => <Link key={item} to={`/${item}`} className={`rounded-md px-3 py-1.5 text-xs capitalize ${role === item ? 'bg-ocean-600 text-white' : 'text-slate-400 hover:text-white'}`}>{item}</Link>)}
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="h-4 w-4" /></Button>
      </div>
    </header>
  );
}
