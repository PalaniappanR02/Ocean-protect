import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Radio,
  Search,
  Sun,
  Moon,
  Globe,
  LogOut,
  CircleUserRound,
  ShieldAlert,
  CheckCircle2,
  Command,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notification-service';
import { formatRelativeTime } from '@/lib/utils';
import { useCommandPalette } from '@/components/navigation/CommandPalette';
import { RealtimeStatusPill } from '@/components/layout/RealtimeStatusPill';
import { KadalkavachLogo } from '@/components/brand/KadalkavachLogo';
import { ROLE_LABELS, type PortalRole } from '@/navigation/navigation.types';

export function TopBar({ role }: { role: PortalRole }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile, signOut } = useAuth();
  const { open: openCommandPalette } = useCommandPalette();
  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list(),
    enabled: notifOpen || session !== null,
    refetchInterval: 30000,
  });
  const unreadCount = notifications?.unread ?? 0;

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'te', label: 'తెలుగు' },
  ];

  const localize = (key: string, fallback: string) => t([`chrome.${key}`, fallback]);

  const section = location.pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'overview';

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
          <KadalkavachLogo iconClassName="h-6 w-6" wordmarkClassName="truncate text-sm font-semibold tracking-tight" />
        </div>

        <div className="hidden items-center gap-3 lg:flex min-w-0">
          <Radio className="h-4 w-4 text-primary" aria-hidden="true" />
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{ROLE_LABELS[role]}</span>
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

      {/* Command palette trigger (replaces the previous inert search field) */}
      <div className="mx-2 flex flex-1 items-center">
        <button
          type="button"
          onClick={openCommandPalette}
          className="field-control flex h-10 w-full items-center gap-3 rounded-lg border border-transparent bg-transparent px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{localize('search', 'Search & navigate…')}</span>
          <span className="hidden items-center gap-1 sm:flex">
            <kbd className="rounded-md bg-muted px-2 py-1 font-mono text-[11px]">Ctrl</kbd>
            <kbd className="rounded-md bg-muted px-2 py-1 font-mono text-[11px]">K</kbd>
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2">
          <div className="font-mono text-[10px] leading-tight text-muted-foreground text-right" aria-hidden>
            <div>{now.toLocaleDateString()}</div>
            <div>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <div className="text-muted-foreground/50">|</div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <RealtimeStatusPill />
        </div>

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
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow-focusRing">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <Drawer open={notifOpen} onOpenChange={setNotifOpen}>
            <DrawerContent side="right" id="notifications-drawer" aria-label="Notifications panel">
              <DrawerHeader>
                <div className="pr-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{localize('liveUpdates', 'Live updates')}</p>
                  <h3 className="mt-1 text-lg font-semibold">{localize('notifications', 'Notifications')}</h3>
                </div>
              </DrawerHeader>
              <DrawerBody>
                <div className="space-y-3">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => void notificationService.markAllRead()}
                      className="w-full rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                    >
                      {localize('markAllRead', 'Mark all as read')}
                    </button>
                  )}
                  {notifications?.items.length ? (
                    notifications.items.slice(0, 20).map((n) => (
                      <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-3">
                        <div className="flex items-start gap-3">
                          <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-500" aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{n.title}</p>
                            {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                            <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">{formatRelativeTime(n.createdAt)}</p>
                          </div>
                          {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-500" aria-label="Unread" />}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-semibold">{localize('allCaughtUp', 'You\'re all caught up')}</p>
                          <p className="text-xs text-muted-foreground">{localize('updatesHere', 'Official alerts and activity updates appear here.')}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Profile & settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open profile and settings">
              <CircleUserRound className="h-5 w-5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-xs text-muted-foreground truncate max-w-[220px]">
              {profile?.email ?? session?.user?.email ?? 'Signed in'}
            </div>
            <div className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ocean-400">
              {ROLE_LABELS[role]}
            </div>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {localize('language', 'Language')}
            </div>
            {LANGUAGES.map(({ code, label }) => (
              <DropdownMenuItem key={code} onClick={() => void i18n.changeLanguage(code)}>
                <Globe className="mr-2 h-4 w-4" aria-hidden="true" />
                {label}
                {i18n.language === code && '✓'}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              {localize('light', 'Light')} {theme === 'light' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              {localize('dark', 'Dark')} {theme === 'dark' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openCommandPalette()}>
              <Command className="mr-2 h-4 w-4" />
              {localize('commandPalette', 'Command palette')}
              <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {localize('logOut', 'Log out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
