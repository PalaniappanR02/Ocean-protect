import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute, isKnownRole } from '@/navigation/route-access';
import { resolveRoleHome } from '@/navigation/role-home';
import type { PortalRole } from '@/navigation/navigation.types';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';

interface RoleRouteProps {
  allowed: readonly PortalRole[];
  children: ReactNode;
}

/**
 * Role-gated route.
 *
 * - Auth still booting        → null (AuthGate shows the branded shell, so the
 *                               forbidden page can never flash first)
 * - Unauthenticated           → /login, preserving the intended destination
 * - Authenticated, wrong role → redirect to the user's own role home (no flash)
 * - Authenticated, unknown role → 403 page (fail closed)
 *
 * Frontend visibility is UX only — the backend remains the security boundary.
 */
export function RoleRoute({ allowed, children }: RoleRouteProps) {
  const { session, role, loading, resolving, authError } = useAuth();
  const location = useLocation();

  if (loading || resolving || authError) return null;

  if (!session) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  if (!isKnownRole(role) || !canAccessRoute(role, allowed)) {
    const home = resolveRoleHome(role);
    if (home) return <Navigate to={home} replace />;
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}
