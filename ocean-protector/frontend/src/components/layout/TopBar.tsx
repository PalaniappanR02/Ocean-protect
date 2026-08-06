<<<<<<< HEAD
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Radio, Waves, LogOut, CircleUserRound, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleSwitcher } from './RoleSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
=======
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, CircleUserRound, Radio, Waves, Search, Sun, Moon, BellRing, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleSwitcher } from './RoleSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@/components/ui/drawer';
>>>>>>> origin/frontend-ui-upgrade

export function TopBar({ role }: { role: 'citizen' | 'analyst' | 'authority' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const section = location.pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'overview';

<<<<<<< HEAD
  async function handleLogout() {
    await signOut();
    navigate('/login');
  }
=======
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchFocused, setSearchFocused] = useState(false);
>>>>>>> origin/frontend-ui-upgrade

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
        <motion.div
          animate={{ maxWidth: searchFocused ? 760 : 720 }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative w-full"
        >
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" aria-hidden />
          </div>
          <input
            type="search"
            aria-label="Search reports and incidents"
            placeholder="Search (Ctrl + K)"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="field-control pl-10 pr-28 h-10 w-full rounded-lg bg-transparent border border-transparent focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <kbd className="rounded-md bg-muted px-2 py-1 text-[11px] font-mono">Ctrl</kbd>
            <kbd className="rounded-md bg-muted px-2 py-1 text-[11px] font-mono">K</kbd>
          </div>
        </motion.div>
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
<<<<<<< HEAD
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
          onClick={() => navigate(`/${role}/alerts`)}
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open profile and settings">
              <CircleUserRound className="h-5 w-5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-xs text-muted-foreground truncate max-w-[220px]">
              {session?.user?.email}
            </div>
            <DropdownMenuItem onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')}>
              {i18n.language === 'en' ? 'தமிழ்' : 'English'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              Light {theme === 'light' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              Dark {theme === 'dark' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="mr-2 h-4 w-4" />
              System {theme === 'system' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
=======

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open notifications"
            aria-expanded={notifOpen}
            aria-controls="notifications-drawer"
            onClick={() => setNotifOpen(true)}
            className="relative"
          >
            <Bell className="h-5 w-5" aria-hidden />
            <span className="absolute -right-1 -top-1 flex h-2 w-2 items-center justify-center">
              <span className="block h-2 w-2 rounded-full bg-destructive shadow-focusRing" aria-hidden />
            </span>
          </Button>

          <Drawer open={notifOpen} onOpenChange={setNotifOpen}>
            <DrawerContent side="right" id="notifications-drawer" aria-label="Notifications panel">
              <DrawerHeader>
                <div className="pr-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Live updates</p>
                  <h3 className="mt-1 text-lg font-semibold">Notifications</h3>
                </div>
              </DrawerHeader>
              <DrawerBody>
                <div className="space-y-3">
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-500" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold">Advisory updated</p>
                        <p className="text-xs text-muted-foreground">High wave advisory extended for 2 districts.</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold">Queue sync complete</p>
                        <p className="text-xs text-muted-foreground">Offline reports synced successfully.</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <BellRing className="mt-0.5 h-4 w-4 text-cyan-500" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold">Monitoring active</p>
                        <p className="text-xs text-muted-foreground">New reports will appear here in real time.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
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
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
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
>>>>>>> origin/frontend-ui-upgrade
      </div>
    </motion.header>
  );
}