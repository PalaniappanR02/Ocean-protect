import { KNOWN_PORTAL_ROLES, type PortalRole } from './navigation.types';
import { hasSupervisorAccess } from './role-navigation.config';

export type { PortalRole } from './navigation.types';

/**
 * Whether a trusted role is known to the platform. Unknown roles resolve to
 * NO portal (fail closed) — a hypothetical/renamed backend role must never
 * silently inherit citizen access.
 */
export function isKnownRole(role: string | null | undefined): role is PortalRole {
  return !!role && (KNOWN_PORTAL_ROLES as readonly string[]).includes(role);
}

/**
 * Route-level access decision. Returns true only when the role appears in the
 * allowed list — there is no "rank inheritance": authority_supervisor is NOT
 * allowed into analyst, analyst is NOT allowed into authority, etc.
 */
export function canAccessRoute(role: PortalRole | null, allowed: readonly PortalRole[]): boolean {
  return role !== null && allowed.includes(role);
}

/**
 * Supervisor-only control gating. Operators never see these as enabled.
 * Supervisor status is an authorization property resolved from the backend,
 * never from local storage or URL state.
 */
export { hasSupervisorAccess };
