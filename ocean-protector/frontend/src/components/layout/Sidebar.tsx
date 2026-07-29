import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  FileWarning,
  LayoutDashboard,
  Map,
  Radio,
  Shield,
  Users,
  WifiOff,
  Waves,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = {
  citizen: [
    ['Dashboard', '/citizen', LayoutDashboard],
    ['Report', '/citizen/report', FileWarning],
    ['Track', '/citizen/tracking', Activity],
    ['Alerts', '/citizen/alerts', AlertTriangle],
    ['Map', '/citizen/map', Map],
    ['Offline', '/citizen/offline', WifiOff],
  ],
  analyst: [
    ['Dashboard', '/analyst', LayoutDashboard],
    ['Reports', '/analyst/reports', FileWarning],
    ['Incidents', '/analyst/incidents', AlertTriangle],
    ['Signals', '/analyst/social', Radio],
    ['Map', '/analyst/map', Map],
  ],
  authority: [
    ['Dashboard', '/authority', LayoutDashboard],
    ['Incidents', '/authority/incidents', AlertTriangle],
    ['Teams', '/authority/teams', Users],
    ['Map', '/authority/map', Map],
  ],
} as const;

type Role = keyof typeof navigation;

function isRouteActive(pathname: string, to: string, role: Role) {
  const exact = to === `/${role}`;
  return exact ? pathname === to : pathname.startsWith(to);
}

export function Sidebar({ role }: { role: Role }) {
  const location = useLocation();
  const items = navigation[role];

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-800 bg-slate-950 lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ocean-500/15 text-ocean-400">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-white">OceanGuard</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Coastal Intelligence</p>
          </div>
        </div>

        <div className="px-3 py-5">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {role} portal
          </p>
          <nav className="space-y-1">
            {items.map(([label, to, Icon]) => {
              const active = isRouteActive(location.pathname, to, role);
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    active
                      ? 'bg-ocean-500/15 text-ocean-300'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-4 left-3 right-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400">
          <div className="mb-1 flex items-center gap-2 text-emerald-400">
            <Shield className="h-3.5 w-3.5" />
            Demo system online
          </div>
          South India coastal regions
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="flex gap-1 overflow-x-auto">
          {items.map(([label, to, Icon]) => {
            const active = isRouteActive(location.pathname, to, role);
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] transition-colors',
                  active ? 'bg-ocean-500/15 text-ocean-300' : 'text-slate-500',
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
