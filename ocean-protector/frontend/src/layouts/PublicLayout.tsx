import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PublicNavigation } from '@/components/navigation/PublicNavigation';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { PageTransition } from '@/components/motion/PageTransition';

/**
 * Public site shell: skip link, public navigation, page transitions, footer.
 * Used for the landing page and all public pages (/about, /how-it-works,
 * /public-alerts, /track, /login, /signup).
 */
export function PublicLayout() {
  const location = useLocation();

  // Cross-page anchor links (e.g. /how-it-works#capabilities) need manual
  // scrolling in an SPA after the route change completes.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="nav-pill fixed left-4 top-4 z-50 -translate-y-24 px-4 py-3 font-semibold transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <PublicNavigation />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <PublicFooter />
    </div>
  );
}
