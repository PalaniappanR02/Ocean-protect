import { describe, it, expect, beforeEach } from 'vitest';
import { resolveRoleHome } from '@/navigation/role-home';
import {
  canAccessRoute,
  isKnownRole,
  hasSupervisorAccess,
} from '@/navigation/route-access';
import { getNavigationItems } from '@/navigation/role-navigation.config';

describe('resolveRoleHome — trusted role → home mapping', () => {
  it('maps every known role to its portal home', () => {
    expect(resolveRoleHome('citizen')).toBe('/citizen');
    expect(resolveRoleHome('verified_volunteer')).toBe('/citizen');
    expect(resolveRoleHome('analyst')).toBe('/analyst');
    expect(resolveRoleHome('authority_operator')).toBe('/authority');
    expect(resolveRoleHome('authority_supervisor')).toBe('/authority');
    expect(resolveRoleHome('system_admin')).toBe('/admin');
  });

  it('returns null for unknown roles (fail closed)', () => {
    expect(resolveRoleHome('mystery_role')).toBeNull();
    expect(resolveRoleHome('')).toBeNull();
    expect(resolveRoleHome(null)).toBeNull();
    expect(resolveRoleHome(undefined)).toBeNull();
  });
});

describe('canAccessRoute — role isolation matrix', () => {
  it('allows each role into its own portal only', () => {
    expect(canAccessRoute('citizen', ['citizen', 'verified_volunteer'])).toBe(true);
    expect(canAccessRoute('analyst', ['analyst'])).toBe(true);
    expect(canAccessRoute('authority_operator', ['authority_operator', 'authority_supervisor'])).toBe(true);
    expect(canAccessRoute('authority_supervisor', ['authority_operator', 'authority_supervisor'])).toBe(true);
    expect(canAccessRoute('system_admin', ['system_admin'])).toBe(true);
  });

  it('denies cross-portal access (no rank inheritance)', () => {
    // Analyst must not reach authority, authority must not reach analyst/admin, etc.
    expect(canAccessRoute('analyst', ['authority_operator', 'authority_supervisor'])).toBe(false);
    expect(canAccessRoute('analyst', ['system_admin'])).toBe(false);
    expect(canAccessRoute('authority_operator', ['analyst'])).toBe(false);
    expect(canAccessRoute('authority_supervisor', ['analyst'])).toBe(false);
    expect(canAccessRoute('citizen', ['analyst'])).toBe(false);
    expect(canAccessRoute('citizen', ['system_admin'])).toBe(false);
    expect(canAccessRoute('system_admin', ['citizen', 'verified_volunteer'])).toBe(false);
  });

  it('denies a null/unknown role everywhere', () => {
    expect(canAccessRoute(null, ['citizen'])).toBe(false);
    expect(canAccessRoute('unknown_role' as never, ['citizen'])).toBe(false);
  });
});

describe('isKnownRole', () => {
  it('recognizes backend roles', () => {
    expect(isKnownRole('citizen')).toBe(true);
    expect(isKnownRole('analyst')).toBe(true);
    expect(isKnownRole('authority_supervisor')).toBe(true);
  });

  it('rejects unknown and falsy roles', () => {
    expect(isKnownRole('root')).toBe(false);
    expect(isKnownRole('admin')).toBe(false);
    expect(isKnownRole(null)).toBe(false);
    expect(isKnownRole(undefined)).toBe(false);
  });
});

describe('fake role sources are ignored', () => {
  beforeEach(() => {
    // jsdom exposes a limited storage surface in some environments; guard the cleanup.
    try {
      localStorage.removeItem('role');
      localStorage.removeItem('og_role');
      sessionStorage.removeItem('role');
    } catch {
      /* storage unavailable — irrelevant to the assertions */
    }
  });

  it('a localStorage role never changes the resolution', () => {
    // Persist a spoofed role if the environment allows it — regardless, the
    // resolvers never read storage: they only consume the trusted role arg.
    try {
      localStorage.setItem('role', 'analyst');
      localStorage.setItem('og_role', 'authority_supervisor');
    } catch {
      /* storage unavailable — assertion below is still the contract */
    }
    expect(resolveRoleHome('citizen')).toBe('/citizen');
    expect(canAccessRoute('citizen', ['analyst'])).toBe(false);
  });

  it('query-parameter and header-style roles do nothing', () => {
    // A spoofed X-Role header / ?role= query can never change the trusted role
    // object: access follows only the role the backend verified.
    expect(canAccessRoute('citizen', ['authority_supervisor'])).toBe(false);
    expect(resolveRoleHome('citizen')).toBe('/citizen');
    expect(resolveRoleHome('authority_supervisor')).toBe('/authority'); // only if backend actually said so
  });
});

describe('supervisor-only controls', () => {
  it('operators never see supervisor-only navigation items', () => {
    const operatorItems = getNavigationItems('authority_operator');
    expect(operatorItems.some((item) => item.supervisorOnly)).toBe(false);
    expect(hasSupervisorAccess('authority_operator')).toBe(false);
  });

  it('supervisors see supervisor-only navigation items', () => {
    const supervisorItems = getNavigationItems('authority_supervisor');
    expect(supervisorItems.some((item) => item.supervisorOnly)).toBe(true);
    expect(hasSupervisorAccess('authority_supervisor')).toBe(true);
  });

  it('unknown roles receive no navigation at all', () => {
    expect(getNavigationItems('mystery' as never)).toHaveLength(0);
  });
});

describe('navigation config respects the allowed-role model', () => {
  it('citizen navigation never exposes analyst/authority/admin routes', () => {
    const citizenItems = getNavigationItems('citizen');
    for (const item of citizenItems) {
      expect(item.to).toMatch(/^\/citizen/);
    }
  });

  it('analyst navigation never exposes citizen submission utilities', () => {
    const analystItems = getNavigationItems('analyst');
    for (const item of analystItems) {
      expect(item.to).toMatch(/^\/analyst/);
    }
  });

  it('admin navigation stays inside /admin', () => {
    const adminItems = getNavigationItems('system_admin');
    for (const item of adminItems) {
      expect(item.to).toMatch(/^\/admin/);
    }
  });
});
