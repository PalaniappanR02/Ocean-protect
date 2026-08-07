import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, FileWarning, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleNavigation } from '@/navigation/useRoleNavigation';
import { resolveRoleHome } from '@/navigation/role-home';
import { cn } from '@/lib/utils';
import { KadalkavachLogo } from '@/components/brand/KadalkavachLogo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

const PUBLIC_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Hazards', to: '/how-it-works#capabilities' },
  { label: 'Public Alerts', to: '/public-alerts' },
  { label: 'Track', to: '/track' },
];

export function PublicNavigation() {
  const { session, role, signOut } = useAuth();
  const { items } = useRoleNavigation(role);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const workspaceHome = resolveRoleHome(role);
  const firstWorkspaceItem = items[0];

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'public-nav-link text-sm font-medium transition-colors hover:text-foreground',
      isActive ? 'text-foreground' : 'text-muted-foreground',
    );

  return (
    <header className="public-nav sticky top-0 z-40">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg" aria-label="Kadalkavach home">
          <KadalkavachLogo iconClassName="h-5 w-5" wordmarkClassName="text-[15px] font-semibold tracking-tight" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {PUBLIC_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session && role ? (
            <>
              <Link
                to={firstWorkspaceItem?.to ?? workspaceHome ?? '/login'}
                className="public-nav-link inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Open Workspace
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="public-nav-link inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="public-nav-link inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign In
            </Link>
          )}
          <Link
            to="/citizen/report"
            className="button-primary inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <FileWarning className="h-4 w-4" aria-hidden="true" />
            Report a Hazard
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile drawer */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="top-4 translate-y-0 sm:top-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <KadalkavachLogo iconClassName="h-5 w-5" />
              Kadalkavach
            </DialogTitle>
          </DialogHeader>
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {PUBLIC_LINKS.map((link) => (
              <DialogClose asChild key={link.to}>
                <Link
                  to={link.to}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-muted"
                >
                  {link.label}
                </Link>
              </DialogClose>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-4">
              {session && role ? (
                <>
                  <DialogClose asChild>
                    <Link
                      to={firstWorkspaceItem?.to ?? workspaceHome ?? '/login'}
                      className="button-primary inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold"
                    >
                      Open Workspace
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </DialogClose>
                  <DialogClose asChild>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  </DialogClose>
                </>
              ) : (
                <DialogClose asChild>
                  <Link
                    to="/login"
                    className="inline-flex h-11 items-center justify-center rounded-lg border px-4 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                </DialogClose>
              )}
              <DialogClose asChild>
                <Link
                  to="/citizen/report"
                  className="button-primary inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold"
                >
                  <FileWarning className="h-4 w-4" aria-hidden="true" />
                  Report a Hazard
                </Link>
              </DialogClose>
            </div>
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  );
}
