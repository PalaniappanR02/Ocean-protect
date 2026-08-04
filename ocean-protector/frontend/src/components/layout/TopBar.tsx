import { useLocation } from 'react-router-dom';
import { Bell, CircleUserRound, Radio, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleSwitcher } from './RoleSwitcher';

export function TopBar({ role }: { role: 'citizen' | 'analyst' | 'authority' }) {
  const location = useLocation();
  const section = location.pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'overview';

  return (
    <header className="nav-pill sticky top-4 z-20 ml-auto mr-4 mt-4 flex min-h-[60px] w-fit max-w-[calc(100%-2rem)] items-center gap-2 px-3 sm:mr-6 lg:mr-8 lg:px-4">
      <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
        <Waves className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate text-sm font-semibold tracking-tight">OCEAN<span className="text-primary">GUARD</span></span>
      </div>
      <div className="hidden min-w-0 items-center gap-3 lg:flex">
        <Radio className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{role}</span>
        <span className="text-muted-foreground" aria-hidden="true">/</span>
        <span className="max-w-52 truncate text-sm font-medium capitalize">{section}</span>
      </div>
      <div className="flex items-center gap-2">
        <RoleSwitcher role={role} />
        <Button variant="ghost" size="icon" className="relative" aria-label="Open notifications">
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Open profile and settings">
          <CircleUserRound className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}
