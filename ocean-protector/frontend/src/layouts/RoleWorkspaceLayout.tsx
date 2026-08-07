import { MainLayout } from '@/components/layout/MainLayout';
import { CommandPaletteProvider } from '@/components/navigation/CommandPalette';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_GROUPS } from '@/navigation/role-navigation.config';
import type { PortalGroup, PortalRole } from '@/navigation/navigation.types';

const DEFAULT_ROLE_BY_PORTAL: Record<PortalGroup, PortalRole> = {
  citizen: 'citizen',
  analyst: 'analyst',
  authority: 'authority_operator',
  admin: 'system_admin',
};

/**
 * Authenticated role shell: the shared workspace layout plus the role-scoped
 * command palette. The display role is taken from the trusted backend role
 * when it belongs to this portal (so a verified volunteer sees the volunteer
 * label, a supervisor sees supervisor navigation), never from local state.
 */
export function RoleWorkspaceLayout({ portal }: { portal: PortalGroup }) {
  const { role: actualRole } = useAuth();
  const role =
    actualRole && ROLE_GROUPS[actualRole] === portal ? actualRole : DEFAULT_ROLE_BY_PORTAL[portal];

  return (
    <CommandPaletteProvider>
      <MainLayout role={role} />
    </CommandPaletteProvider>
  );
}
