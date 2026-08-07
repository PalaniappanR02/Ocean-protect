import type { LucideIcon } from 'lucide-react';

/**
 * Portal roles understood by the frontend.
 *
 * Only `citizen`, `analyst`, `authority_operator` and `authority_supervisor`
 * are issued by the backend today. `verified_volunteer` and `system_admin`
 * are supported forward-compatibly; any other value returned by the trusted
 * `/auth/me` endpoint resolves to NO portal (fail closed).
 */
export type PortalRole =
  | 'citizen'
  | 'verified_volunteer'
  | 'analyst'
  | 'authority_operator'
  | 'authority_supervisor'
  | 'system_admin';

/** Roles the backend is known to issue. Used to label unknown roles safely. */
export const KNOWN_PORTAL_ROLES: readonly PortalRole[] = [
  'citizen',
  'verified_volunteer',
  'analyst',
  'authority_operator',
  'authority_supervisor',
  'system_admin',
];

/** Coarse portal groups that share a navigation tree. */
export type PortalGroup = 'citizen' | 'analyst' | 'authority' | 'admin';

/** Human labels used in breadcrumbs, the top bar and error pages. */
export const ROLE_LABELS: Record<PortalRole, string> = {
  citizen: 'Citizen',
  verified_volunteer: 'Verified Volunteer',
  analyst: 'Analyst',
  authority_operator: 'Authority Operator',
  authority_supervisor: 'Authority Supervisor',
  system_admin: 'System Admin',
};

export interface NavigationItem {
  /** Primary label shown in the sidebar / command palette. */
  label: string;
  /** Compact label for the mobile bottom navigation. */
  mobileLabel?: string;
  /** Destination route. */
  to: string;
  /** lucide-react icon. */
  icon: LucideIcon;
  /** Roles permitted to see this item. */
  roles: PortalRole[];
  /** Extra terms for command-palette search. */
  keywords?: string[];
  /** Keyboard shortcut hint, e.g. "G R". */
  shortcut?: string;
  /** Supervisor-only authority control — hidden from operators. */
  supervisorOnly?: boolean;
}

export interface CommandPaletteCommand {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  keywords?: string[];
  shortcut?: string;
}
