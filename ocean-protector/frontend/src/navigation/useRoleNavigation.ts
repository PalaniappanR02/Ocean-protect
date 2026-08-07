import { useMemo } from 'react';
import type { CommandPaletteCommand, PortalRole } from './navigation.types';
import { getNavigationItems } from './role-navigation.config';
import { isKnownRole } from './route-access';

/**
 * Role-scoped navigation derived from the trusted backend role.
 * Every command references a route the role is actually permitted to reach.
 */
export function useRoleNavigation(role: PortalRole | null) {
  return useMemo(() => {
    if (!isKnownRole(role)) {
      return { items: [], commands: [] as CommandPaletteCommand[] };
    }
    const items = getNavigationItems(role);

    const commands: CommandPaletteCommand[] = items
      .map((item, index) => ({
        id: `${role}-${item.to}-${index}`,
        label: item.label,
        to: item.to,
        icon: item.icon,
        keywords: item.keywords ?? [],
        shortcut: item.shortcut,
      }))
      .filter(
        // De-duplicate commands that point at the same route (e.g. two
        // authority items sharing the incidents list).
        (command, index, all) => all.findIndex((c) => c.to === command.to) === index,
      );

    return { items, commands };
  }, [role]);
}
