import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Wifi, WifiOff } from 'lucide-react';

export function MainLayout({ role }: { role: 'citizen' | 'analyst' | 'authority' }) {
  const isOnline = useNetworkStatus();
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} />
      <div className="lg:pl-64">
        <TopBar role={role} />
        <main className="p-4 pb-24 lg:p-6">
          {!isOnline ? <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400"><WifiOff className="h-4 w-4" />You are offline. Reports will sync later.</div> : <div className="mb-4 hidden items-center gap-2 text-xs text-muted-foreground lg:flex"><Wifi className="h-3.5 w-3.5 text-green-500" />Connected</div>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
