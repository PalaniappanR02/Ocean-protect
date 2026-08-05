import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, CircleUserRound, Radio, Waves, Search, ChevronDown, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleSwitcher } from './RoleSwitcher';
import { motion, AnimatePresence } from 'framer-motion';

export function TopBar({ role }: { role: 'citizen' | 'analyst' | 'authority' }) {
  const location = useLocation();
  const section = location.pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'overview';

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.36, ease: [0.2, 0.8, 0.2, 1] }}
      className="nav-pill sticky top-4 z-20 ml-auto mr-4 mt-4 flex w-full max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-transparent p-2 shadow-menu sm:mr-6 lg:mr-8 lg:px-4"
      role="region"
      aria-label="Top navigation"
    >
      <div className="flex items-center gap-3 min-w-0 lg:ml-2">
        <div className="flex items-center gap-3 lg:hidden">
          <Waves className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="truncate text-sm font-semibold tracking-tight">OCEAN<span className="text-primary">GUARD</span></span>
        </div>

        <div className="hidden items-center gap-3 lg:flex min-w-0">
          <Radio className="h-4 w-4 text-primary" aria-hidden="true" />
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{role}</span>
            <span className="text-muted-foreground">/</span>
            <motion.h2
              key={section}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28 }}
              className="max-w-52 truncate text-sm font-medium capitalize"
            >
              {section}
            </motion.h2>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mx-2 flex flex-1 items-center">
        <div className="relative w-full max-w-[720px]">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" aria-hidden />
          </div>
          <input
            type="search"
            aria-label="Search reports and incidents"
            placeholder="Search (Ctrl + K)"
            className="field-control pl-10 pr-28 h-10 w-full rounded-lg bg-transparent border border-transparent focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <kbd className="rounded-md bg-muted px-2 py-1 text-[11px] font-mono">Ctrl</kbd>
            <kbd className="rounded-md bg-muted px-2 py-1 text-[11px] font-mono">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-sm text-muted-foreground text-right">
            <div aria-hidden>{now.toLocaleDateString()}</div>
            <div className="font-mono text-xs">{now.toLocaleTimeString()}</div>
          </div>
          <div className="px-2">|</div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="rounded-lg border bg-muted px-3 py-2 text-sm font-medium flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" aria-hidden />
            <span className="font-mono text-xs">Monitoring active</span>
          </div>
        </div>

        <RoleSwitcher role={role} />

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open notifications"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((s) => !s)}
            className="relative"
          >
            <Bell className="h-5 w-5" aria-hidden />
            <span className="absolute -right-1 -top-1 flex h-2 w-2 items-center justify-center">
              <span className="block h-2 w-2 rounded-full bg-destructive shadow-focusRing" aria-hidden />
            </span>
          </Button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="absolute right-0 mt-2 w-80 rounded-lg bg-paper-3 border border-color-rule p-3 shadow-menu z-50"
                role="dialog"
                aria-label="Notifications"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">Notifications</div>
                  <button className="text-sm text-muted-foreground" onClick={() => setNotifOpen(false)}>Close</button>
                </div>
                <div className="text-sm text-muted-foreground">No notifications — this is a placeholder UI.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <button
          aria-label="Toggle theme"
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          className="rounded-md p-2 hover:bg-white/30 dark:hover:bg-white/5 focus-visible:outline-none"
        >
          {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Profile */}
        <div className="relative">
          <Button variant="ghost" size="icon" aria-label="Open profile menu" onClick={() => setProfileOpen((s) => !s)}>
            <CircleUserRound className="h-6 w-6" aria-hidden />
          </Button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="absolute right-0 mt-2 w-48 rounded-lg bg-paper-3 border border-color-rule p-3 shadow-menu z-50"
                role="menu"
                aria-label="Profile menu"
              >
                <div className="mb-2 flex items-center gap-2">
                  <CircleUserRound className="h-8 w-8" />
                  <div>
                    <div className="font-semibold">User</div>
                    <div className="text-xs text-muted-foreground">user@example.com</div>
                  </div>
                </div>
                <div className="mt-2 grid gap-2">
                  <button className="text-sm text-left">Profile</button>
                  <button className="text-sm text-left">Settings</button>
                  <button className="text-sm text-left">Sign out</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
