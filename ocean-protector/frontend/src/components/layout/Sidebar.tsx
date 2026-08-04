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
const navigation = {
  citizen: [
    { label: 'Coastal safety', mobileLabel: 'Safety', to: '/citizen', icon: LayoutDashboard },
    { label: 'Report a hazard', mobileLabel: 'Report', to: '/citizen/report', icon: FileWarning },
    { label: 'Hazard map', mobileLabel: 'Map', to: '/citizen/map', icon: Map },
    { label: 'Safety alerts', mobileLabel: 'Alerts', to: '/citizen/alerts', icon: AlertTriangle },
    { label: 'My reports', mobileLabel: 'Reports', to: '/citizen/tracking', icon: Activity },
    { label: 'Offline reports', mobileLabel: 'Offline', to: '/citizen/offline', icon: WifiOff },
  ],
  analyst: [
    { label: 'Analyst overview', mobileLabel: 'Overview', to: '/analyst', icon: LayoutDashboard },
    { label: 'Verification queue', mobileLabel: 'Verify', to: '/analyst/reports', icon: FileWarning },
    { label: 'Incidents', mobileLabel: 'Incidents', to: '/analyst/incidents', icon: AlertTriangle },
    { label: 'Signal analysis', mobileLabel: 'Signals', to: '/analyst/social', icon: Radio },
    { label: 'Hazard map', mobileLabel: 'Map', to: '/analyst/map', icon: Map },
  ],
  authority: [
    { label: 'Authority overview', mobileLabel: 'Overview', to: '/authority', icon: LayoutDashboard },
    { label: 'Incident management', mobileLabel: 'Incidents', to: '/authority/incidents', icon: AlertTriangle },
    { label: 'Response teams', mobileLabel: 'Teams', to: '/authority/teams', icon: Users },
    { label: 'Hazard map', mobileLabel: 'Map', to: '/authority/map', icon: Map },
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
      <aside className="portal-sidebar fixed bottom-4 left-4 top-4 z-30 hidden w-[240px] overflow-hidden lg:block">
        <div className="flex h-[72px] items-center gap-3 border-b px-5">
          <Waves className="h-6 w-6 text-primary" aria-hidden="true" />
          <div>
            <p className="text-[15px] font-bold tracking-tight">OCEAN<span className="text-primary">GUARD</span></p>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Coastal safety</p>
          </div>
        </div>

        <div className="px-3 py-6">
          <p className="mb-3 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{role} workspace</p>
          <nav className="space-y-1" aria-label={`${role} portal navigation`}>
            {items.map(({ label, to, icon: Icon }) => {
              const active = isRouteActive(location.pathname, to, role);
              return (
                <NavLink
                  key={to}
                  to={to}
                  data-active={active}
                  className="portal-nav-link flex min-h-11 items-center gap-3 px-3 py-2.5 text-sm font-medium"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-4 left-3 right-3 rounded-lg border bg-muted p-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          <div className="mb-1.5 flex items-center gap-2 text-primary">
            <Shield className="h-3.5 w-3.5" />
            <span>Monitoring active</span>
          </div>
          <span>South India · four regions</span>
        </div>
      </aside>

      <nav className="portal-sidebar fixed inset-x-2 bottom-2 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden" aria-label={`${role} mobile navigation`}>
        <div className="flex gap-1 overflow-x-auto">
          {items.map(({ mobileLabel, to, icon: Icon }) => {
            const active = isRouteActive(location.pathname, to, role);
            return (
              <NavLink
                key={to}
                to={to}
                  data-active={active}
                  className="portal-nav-link flex min-h-12 min-w-[64px] flex-1 flex-col items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{mobileLabel}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
