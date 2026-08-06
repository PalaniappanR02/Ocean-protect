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

export function TopBar({ role }: { role: 'citizen' | 'analyst' | 'authority' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const section = location.pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'overview';

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

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
      </div>
    </header>
  );
}