import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Wifi, WifiOff } from 'lucide-react';

export function MainLayout({ role }: { role: 'citizen' | 'analyst' | 'authority' }) {
  const isOnline = useNetworkStatus();
  return (
    <div className="min-h-screen bg-transparent" data-portal={role} data-theme="aurora">
      <Sidebar role={role} />
      <div className="lg:pl-[272px]">
        <TopBar role={role} />
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1680px] p-4 pb-28 pt-7 outline-none sm:p-6 sm:pt-8 lg:p-8 lg:pb-8 xl:px-10">
          {!isOnline ? (
            <div className="offline-strip mb-6 flex items-center gap-2 px-4 py-3 text-sm font-medium" role="status">
              <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
              Offline mode is active. New reports will be stored safely and sent when your connection returns.
            </div>
          ) : (
            <div className="status-strip mb-6 hidden w-fit items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] lg:flex" role="status">
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
              <Wifi className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Connected · live coastal data
            </div>
          )}
          <Outlet />
          <footer className="portal-footer" aria-label="OceanGuard information">
            <span>OceanGuard · South India coastal safety</span>
            <span>Citizen reports · analyst verification · authority response</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
