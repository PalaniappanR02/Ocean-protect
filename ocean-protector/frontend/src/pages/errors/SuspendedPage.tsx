import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/EmptyState';
import { useAuth } from '@/hooks/useAuth';

/** Shown when the trusted profile reports a non-active account status. */
export function SuspendedPage() {
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
          icon={ShieldAlert}
          title="Account access restricted"
          description="This account is not active, so its access is restricted. If you believe this is a mistake, contact the Kadalkavach administration team for your region."
          action={
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          }
        />
      </div>
    </div>
  );
}
