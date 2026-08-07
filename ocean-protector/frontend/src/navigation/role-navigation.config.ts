import {
  Activity,
  AlertTriangle,
  FileWarning,
  LayoutDashboard,
  Map,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Users,
  WifiOff,
} from 'lucide-react';
import type { NavigationItem, PortalGroup, PortalRole } from './navigation.types';

/**
 * Centralized, role-aware navigation. Every item declares which roles may
 * see it; the sidebar, top bar, breadcrumbs and command palette all derive
 * from this single source of truth. No component hardcodes role checks.
 */
export const ROLE_GROUPS: Record<PortalRole, PortalGroup> = {
  citizen: 'citizen',
  verified_volunteer: 'citizen',
  analyst: 'analyst',
  authority_operator: 'authority',
  authority_supervisor: 'authority',
  system_admin: 'admin',
};

const navigationByRole: Record<PortalGroup, NavigationItem[]> = {
  citizen: [
    { label: 'Overview', mobileLabel: 'Home', to: '/citizen', icon: LayoutDashboard, roles: ['citizen', 'verified_volunteer'], keywords: ['dashboard', 'coastal safety', 'home'] },
    { label: 'Report a Hazard', mobileLabel: 'Report', to: '/citizen/report', icon: FileWarning, roles: ['citizen', 'verified_volunteer'], keywords: ['submit', 'hazard', 'eyewitness', 'evidence'], shortcut: 'G R' },
    { label: 'My Reports', mobileLabel: 'Reports', to: '/citizen/reports', icon: Activity, roles: ['citizen', 'verified_volunteer'], keywords: ['submissions', 'history'] },
    { label: 'Track a Report', mobileLabel: 'Track', to: '/citizen/tracking', icon: Search, roles: ['citizen', 'verified_volunteer'], keywords: ['tracking id', 'status', 'follow up'] },
    { label: 'Hazard Map', mobileLabel: 'Map', to: '/citizen/map', icon: Map, roles: ['citizen', 'verified_volunteer'], keywords: ['map', 'incidents'] },
    { label: 'Safety Alerts', mobileLabel: 'Alerts', to: '/citizen/alerts', icon: AlertTriangle, roles: ['citizen', 'verified_volunteer'], keywords: ['public alerts', 'warnings'] },
    { label: 'Offline Reports', mobileLabel: 'Offline', to: '/citizen/offline', icon: WifiOff, roles: ['citizen', 'verified_volunteer'], keywords: ['offline queue', 'queued', 'sync'] },
    { label: 'Notifications', mobileLabel: 'Alerts', to: '/citizen/notifications', icon: Activity, roles: ['citizen', 'verified_volunteer'], keywords: ['updates', 'messages'] },
    { label: 'Settings', mobileLabel: 'Settings', to: '/citizen/settings', icon: Settings, roles: ['citizen', 'verified_volunteer'], keywords: ['profile', 'language', 'theme'] },
  ],
  analyst: [
    { label: 'Analyst Overview', mobileLabel: 'Overview', to: '/analyst', icon: LayoutDashboard, roles: ['analyst'], keywords: ['dashboard', 'intelligence'] },
    { label: 'Review Queue', mobileLabel: 'Review', to: '/analyst/reports', icon: FileWarning, roles: ['analyst'], keywords: ['citizen reports', 'verification', 'triage'], shortcut: 'G R' },
    { label: 'Incidents', mobileLabel: 'Incidents', to: '/analyst/incidents', icon: AlertTriangle, roles: ['analyst'], keywords: ['correlations'] },
    { label: 'Signal Analysis', mobileLabel: 'Signals', to: '/analyst/social', icon: Radio, roles: ['analyst'], keywords: ['social signals', 'social media', 'monitor'] },
    { label: 'Hotspots', mobileLabel: 'Map', to: '/analyst/map', icon: Map, roles: ['analyst'], keywords: ['hazard map', 'clusters'] },
  ],
  authority: [
    { label: 'Operations Overview', mobileLabel: 'Overview', to: '/authority', icon: LayoutDashboard, roles: ['authority_operator', 'authority_supervisor'], keywords: ['dashboard', 'operations'] },
    { label: 'Incident Management', mobileLabel: 'Incidents', to: '/authority/incidents', icon: AlertTriangle, roles: ['authority_operator', 'authority_supervisor'], keywords: ['incidents', 'queue'], shortcut: 'G I' },
    { label: 'Response Teams', mobileLabel: 'Teams', to: '/authority/teams', icon: Users, roles: ['authority_operator', 'authority_supervisor'], keywords: ['teams', 'ndrf', 'coast guard'], shortcut: 'G T' },
    { label: 'Hazard Map', mobileLabel: 'Map', to: '/authority/map', icon: Map, roles: ['authority_operator', 'authority_supervisor'], keywords: ['map', 'operations'] },
    {
      label: 'Supervisor Controls',
      mobileLabel: 'Supervise',
      to: '/authority/incidents',
      icon: ShieldCheck,
      roles: ['authority_supervisor'],
      supervisorOnly: true,
      keywords: ['verify', 'resolve', 'approve', 'escalate', 'assign'],
      shortcut: 'G S',
    },
  ],
  admin: [
    { label: 'Admin Overview', mobileLabel: 'Admin', to: '/admin', icon: LayoutDashboard, roles: ['system_admin'], keywords: ['system', 'overview'] },
  ],
};

export function getNavigationItems(role: PortalRole): NavigationItem[] {
  const group = ROLE_GROUPS[role];
  if (!group) return [];
  return navigationByRole[group].filter((item) => item.roles.includes(role));
}

export function hasSupervisorAccess(role: PortalRole | null | undefined): boolean {
  return role === 'authority_supervisor';
}
