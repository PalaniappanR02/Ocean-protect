import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthLoadingShell } from '@/pages/errors/AuthLoadingShell';
import { BackendUnavailablePage } from '@/pages/errors/BackendUnavailablePage';
import { SuspendedPage } from '@/pages/errors/SuspendedPage';

/**
 * Wraps the router. While the Supabase session and /auth/me are resolving,
 * only the branded loading shell is visible — no portal, no public nav, no
 * flash of the wrong workspace. Fail-closed error states render here too.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading, resolving, authError } = useAuth();

  if (loading || resolving) return <AuthLoadingShell />;

  if (session && authError === 'unreachable') return <BackendUnavailablePage />;
  if (session && authError === 'suspended') return <SuspendedPage />;

  return <>{children}</>;
}
