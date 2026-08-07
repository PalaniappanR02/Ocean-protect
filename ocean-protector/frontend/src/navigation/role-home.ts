import type { PortalRole } from './navigation.types';
import { isKnownRole } from './route-access';

/**
 * The single trusted role-home resolver.
 *
 * Policy:
 * - citizen            → /citizen
 * - verified_volunteer → /citizen (volunteer pages are citizen-permitted; none
 *                        exist separately today, so the volunteer shares the
 *                        citizen portal)
 * - analyst            → /analyst
 * - authority_operator → /authority
 * - authority_supervisor → /authority (supervisor controls appear within)
 * - system_admin       → /admin
 * - unknown role       → null (no portal; callers must show the 403 state)
 *
 * The backend issues a single authoritative role, so there is no multi-role
 * priority problem to resolve here; if that ever changes, the explicit
 * priority order below is the approved policy and must not be re-derived in
 * components. The frontend never selects a "stronger" role on its own.
 */
const ROLE_HOME_PRIORITY: Record<PortalRole, string> = {
  citizen: '/citizen',
  verified_volunteer: '/citizen',
  analyst: '/analyst',
  authority_operator: '/authority',
  authority_supervisor: '/authority',
  system_admin: '/admin',
};

export function resolveRoleHome(role: string | null | undefined): string | null {
  if (!isKnownRole(role)) return null;
  return ROLE_HOME_PRIORITY[role];
}
