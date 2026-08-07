import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/** Known segment labels for human-readable breadcrumbs. */
const SEGMENT_LABELS: Record<string, string> = {
  citizen: 'Citizen',
  analyst: 'Analyst',
  authority: 'Authority',
  admin: 'Admin',
  report: 'Report Hazard',
  reports: 'Reports',
  tracking: 'Track Report',
  incidents: 'Incidents',
  teams: 'Response Teams',
  map: 'Hazard Map',
  social: 'Signal Analysis',
  alerts: 'Safety Alerts',
  offline: 'Offline Reports',
  notifications: 'Notifications',
  settings: 'Settings',
  news: 'News',
};

/**
 * Compact breadcrumbs for authenticated pages. Rendered only when the route
 * is deeper than the portal index (single-level pages stay clean). Dynamic
 * ids (e.g. INC-204) are shown as plain text.
 */
export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length < 2) return null;

  const crumbs = segments.map((segment, index) => {
    const to = `/${segments.slice(0, index + 1).join('/')}`;
    const label = SEGMENT_LABELS[segment] ?? segment;
    const isLast = index === segments.length - 1;
    return { to, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, index) => (
          <li key={crumb.to} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" aria-hidden="true" />}
            {crumb.isLast ? (
              <span aria-current="page" className="font-medium capitalize text-foreground/80">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.to}
                className="capitalize transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
