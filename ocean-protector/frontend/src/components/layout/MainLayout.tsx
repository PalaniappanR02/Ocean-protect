import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Wifi } from 'lucide-react';
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/components/ui/alert';
import type { PortalRole } from '@/navigation/navigation.types';

export function MainLayout({ role }: { role: PortalRole }) {
  const isOnline = useNetworkStatus();
  return (
    <div className="min-h-screen bg-transparent" data-portal={role} data-theme="aurora">
      <Sidebar role={role} />
      <div className="lg:pl-[272px]">
        <TopBar role={role} />
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1680px] p-4 pb-28 pt-7 outline-none sm:p-6 sm:pt-8 lg:p-8 lg:pb-8 xl:px-10">
          {!isOnline ? (
            <Alert variant="warning" className="mb-6 offline-strip">
              <AlertIcon variant="warning" />
              <div>
                <AlertTitle>Offline mode is active</AlertTitle>
                <AlertDescription>New reports will be stored safely and sent when your connection returns.</AlertDescription>
              </div>
            </Alert>
          ) : (
            <div className="status-strip mb-6 hidden w-fit items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] lg:flex" role="status">
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              <Wifi className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Connected · live coastal data
            </div>
          )}
          <Breadcrumbs />
          <Outlet />
          <footer className="portal-footer" aria-label="Kadalkavach information">
            <span>Kadalkavach · South India coastal safety</span>
            <span>Citizen reports · analyst verification · authority response</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
