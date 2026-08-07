import { Link } from 'react-router-dom';
import { ShieldX, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { resolveRoleHome } from '@/navigation/role-home';

/**
 * 403 — the signed-in user's role is not permitted here (or the role is not
 * recognized at all). Rendered by guards and never preceded by the forbidden
 * content itself, so there is no authorization flash.
 */
export function ForbiddenPage() {
  const { role } = useAuth();
  const home = resolveRoleHome(role);

  return (
    <div id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-background p-6 outline-none">
      <div className="w-full max-w-lg">
        <EmptyState
          icon={ShieldX}
          title="You do not have access to this workspace"
          description={
            role
              ? `Your session is verified as ${role}, which is not permitted to open this area. The portal is locked to the workspace your account is authorized for.`
              : 'Your account role could not be verified. Access is denied until the backend confirms your permissions.'
          }
          action={
            home ? (
              <Button asChild>
                <Link to={home}>
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  Go to my workspace
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/login">Sign in</Link>
              </Button>
            )
          }
        />
      </div>
    </div>
  );
}
