import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Waves, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@/components/ui/drawer';
import { getNavigationItems } from '@/navigation/role-navigation.config';
import { ROLE_LABELS, type PortalRole } from '@/navigation/navigation.types';
import { RealtimeStatusPill } from '@/components/layout/RealtimeStatusPill';
import { KadalkavachLogo } from '@/components/brand/KadalkavachLogo';

/** Translates a nav label (English default) when a locale provides it. */
const localize = (t: ReturnType<typeof useTranslation>['t'], label: string) =>
  t([`navLabels.${label}`, label]);

/** Primary items shown directly in the mobile bottom nav (rest live in the More sheet). */
const MOBILE_PRIMARY_COUNT = 4;

function isRouteActive(pathname: string, to: string, portalRoot: string) {
  const exact = to === `/${portalRoot}`;
  return exact ? pathname === to : pathname.startsWith(to);
}

/** Nav is derived entirely from the centralized role navigation config. */
export function Sidebar({ role }: { role: PortalRole }) {
  const location = useLocation();
  const { t } = useTranslation();
  const items = getNavigationItems(role);
  const portalRoot = role === 'authority_operator' || role === 'authority_supervisor' ? 'authority' : role;
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block fixed left-6 top-6 bottom-6 z-30"
        aria-label={`${role} sidebar`}
      >
        <div className="h-full rounded-2xl p-[1px] bg-gradient-to-br from-[rgba(6,182,212,0.12)] via-[rgba(3,105,161,0.08)] to-[rgba(59,130,246,0.06)] shadow-menu">
          <motion.div
            animate={{ width: collapsed ? 96 : 260 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-transparent p-3 flex flex-col h-full overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-2 py-3">
              <div className="flex items-center gap-3">
                <KadalkavachLogo iconClassName="h-7 w-7" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.div
                      className="min-w-0"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="truncate text-sm font-bold">KADAL<span className="text-ocean-400">KAVACH</span></p>
                      <p className="mt-0.5 text-[11px] font-mono text-muted-foreground uppercase">Coastal safety</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                aria-pressed={collapsed}
                onClick={() => setCollapsed((s) => !s)}
                className="focus-visible:outline-none rounded-md p-2 hover:bg-white/30 dark:hover:bg-white/5"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <motion.svg animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.24 }} className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M8 6L16 12L8 18V6Z" fill="currentColor" />
                </motion.svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.p
                    className="mb-3 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {ROLE_LABELS[role]} {t(['chrome.workspace', 'workspace'])}
                  </motion.p>
                )}
              </AnimatePresence>

              <nav className="space-y-2 pb-2" aria-label={`${role} portal navigation`}>
                {items.map(({ label, mobileLabel, to, icon: Icon }, index) => {
                  const active = isRouteActive(location.pathname, to, portalRoot);
                  return (
                    <div key={`${to}-${index}`} className="relative">
                      <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
                        <NavLink
                          to={to}
                          aria-current={active ? 'page' : undefined}
                          className={({ isActive }) =>
                            `portal-nav-link group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40 ${collapsed ? 'justify-center px-2' : ''} ${isActive ? 'text-accent' : 'text-ink'}`
                          }
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-transparent group-hover:bg-white/30 dark:group-hover:bg-white/5 transition-colors">
                            <motion.span whileHover={{ rotate: -4, y: -1 }} transition={{ duration: 0.2 }}>
                              <Icon className={`h-5 w-5 ${active ? 'text-accent' : 'text-muted-foreground'}`} aria-hidden="true" />
                            </motion.span>
                          </span>
                          <AnimatePresence initial={false}>
                            {!collapsed && (
                              <motion.span
                                className="min-w-0 truncate"
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -6 }}
                                transition={{ duration: 0.18 }}
                              >
                                {localize(t, label)}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </NavLink>
                      </motion.div>

                      {/* Animated active background using framer-motion */}
                      {active && (
                        <motion.div
                          layoutId={`active-bg-${portalRoot}`}
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
              <RealtimeStatusPill collapsed={collapsed} />
            </div>
          </motion.div>
        </div>
      </aside>

      {/* Mobile bottom nav — capped at MOBILE_PRIMARY_COUNT items; the rest live in the More sheet */}
      <motion.nav initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="fixed inset-x-2 bottom-2 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden" aria-label={`${role} mobile navigation`}>
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-2 shadow-menu flex items-center justify-between gap-1">
          {items.slice(0, MOBILE_PRIMARY_COUNT).map(({ label, mobileLabel, to, icon: Icon }, index) => {
            const active = isRouteActive(location.pathname, to, portalRoot);
            return (
              <motion.div key={`${to}-${index}`} whileTap={{ scale: 0.98 }} className="min-w-0 flex-1">
                <NavLink
                  to={to}
                  aria-current={active ? 'page' : undefined}
                  className={`portal-nav-link flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${active ? 'text-accent' : 'text-muted-foreground'}`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} aria-hidden="true" />
                    {active && (
                      <motion.span
                        layoutId={`mobile-active-${portalRoot}`}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-ocean-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.28 }}
                        aria-hidden
                      />
                    )}
                  </div>
                  <span className="text-[10px]">{localize(t, mobileLabel ?? label)}</span>
                </NavLink>
              </motion.div>
            );
          })}
          {items.length > MOBILE_PRIMARY_COUNT && (
            <motion.div whileTap={{ scale: 0.98 }} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={moreOpen}
                className="portal-nav-link flex min-w-[64px] w-full flex-col items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 text-muted-foreground"
              >
                <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px]">{localize(t, 'More')}</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* More sheet — full navigation for the role on mobile */}
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent side="right" aria-label={`${role} full navigation`}>
          <DrawerHeader>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{ROLE_LABELS[role]} {t(['chrome.workspace', 'workspace'])}</p>
            <h3 className="mt-1 text-lg font-semibold">{t(['chrome.allPages', 'All pages'])}</h3>
          </DrawerHeader>
          <DrawerBody>
            <nav className="space-y-1" aria-label={`${role} mobile menu`}>
              {items.map(({ label, to, icon: Icon }, index) => (
                <NavLink
                  key={`${to}-${index}`}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isActive ? 'bg-ocean-400/10 text-accent' : 'text-ink hover:bg-muted'}`
                  }
                >
                  <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  {localize(t, label)}
                </NavLink>
              ))}
            </nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
