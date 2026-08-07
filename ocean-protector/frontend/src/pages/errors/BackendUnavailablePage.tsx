import { useNavigate } from 'react-router-dom';
import { ServerCrash, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/EmptyState';
import { useAuth } from '@/hooks/useAuth';

/**
 * Shown when a session exists but the trusted profile endpoint could not be
 * reached. FAIL CLOSED: access is never granted while verification is
 * impossible — there is no citizen/analyst fallback.
 */
export function BackendUnavailablePage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg">
        <EmptyState
          icon={ServerCrash}
          title="Cannot verify access right now"
          description="Kadalkavach could not confirm your account permissions because the backend is unreachable. To keep coastal data safe, access stays locked until verification succeeds. Please try again in a moment."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Try again
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
