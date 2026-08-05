import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block fixed left-6 top-6 bottom-6 z-30"
        aria-label={`${role} sidebar`}
      >
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[rgba(6,182,212,0.12)] via-[rgba(3,105,161,0.08)] to-[rgba(59,130,246,0.06)] shadow-menu">
          <div
            className={`w-[260px] ${collapsed ? 'translate-x-[-12rem]' : ''} rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-transparent p-3 flex flex-col h-full transition-transform duration-300 ease-out`}
          >
            <div className="flex items-center justify-between gap-3 px-2 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full p-2" aria-hidden>
                  <Waves className="h-7 w-7 text-primary drop-shadow-md" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold"> <span className="text-ocean-400">OCEAN</span>GUARD</p>
                  <p className="mt-0.5 text-[11px] font-mono text-muted-foreground uppercase">Coastal safety</p>
                </div>
              </div>
              <button
                aria-pressed={collapsed}
                onClick={() => setCollapsed((s) => !s)}
                className="focus-visible:outline-none rounded-md p-2 hover:bg-white/30 dark:hover:bg-white/5"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M8 6L16 12L8 18V6Z" fill="currentColor" />
                </svg>
              </button>
            </div>

            <div className="px-2 py-4">
              <p className="mb-3 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{role} workspace</p>

              <nav className="space-y-2" aria-label={`${role} portal navigation`}>
                {items.map(({ label, to, icon: Icon }) => {
                  const active = isRouteActive(location.pathname, to, role);
                  return (
                    <div key={to} className="relative">
                      <NavLink
                        to={to}
                        aria-current={active ? 'page' : undefined}
                        className={({ isActive }) =>
                          `portal-nav-link group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40 ${isActive ? 'text-accent' : 'text-ink'}`
                        }
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-transparent group-hover:bg-white/30 dark:group-hover:bg-white/5 transition-colors">
                          <Icon className={`h-5 w-5 transition-transform group-hover:translate-y-[-2px] ${active ? 'text-accent' : 'text-muted-foreground'}`} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 truncate">{label}</span>
                        {/* Notification placeholder */}
                        <span className="ml-auto mr-1 flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 opacity-0 group-data-active-visible:opacity-100" aria-hidden="true" />
                        </span>
                      </NavLink>

                      {/* Animated active background using framer-motion */}
                      {active && (
                        <motion.div
                          layoutId="active-bg"
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-ocean-50/30 to-transparent blur-[6px]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.35 }}
                          aria-hidden
                        />
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto px-3 pb-4">
              <div className="rounded-lg border bg-muted p-3 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-green-400 animate-pulse" aria-hidden />
                  <span className="text-sm font-semibold">Monitoring active</span>
                </div>
                <div className="text-xs">4 regions</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-2 bottom-2 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden" aria-label={`${role} mobile navigation`}>
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-2 shadow-menu flex items-center justify-between gap-2">
          {items.map(({ mobileLabel, to, icon: Icon }) => {
            const active = isRouteActive(location.pathname, to, role);
            return (
              <NavLink
                key={to}
                to={to}
                aria-current={active ? 'page' : undefined}
                className={`portal-nav-link flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${active ? 'text-accent' : 'text-muted-foreground'}`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} aria-hidden="true" />
                  {active && (
                    <motion.span
                      layoutId={`mobile-active-${role}`}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-ocean-400"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.28 }}
                      aria-hidden
                    />
                  )}
                </div>
                <span className="text-[10px]">{mobileLabel}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
