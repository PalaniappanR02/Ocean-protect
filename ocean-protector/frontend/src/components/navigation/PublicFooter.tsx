import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '@/services/api-client';
import { KadalkavachLogo } from '@/components/brand/KadalkavachLogo';

const isApiMode = import.meta.env.VITE_DATA_MODE === 'api';

type Status = 'checking' | 'operational' | 'unavailable' | 'off';

/** Live backend health indicator — only meaningful when the API is reachable. */
function SystemStatus() {
  const [status, setStatus] = useState<Status>(isApiMode ? 'checking' : 'off');

  useEffect(() => {
    if (!isApiMode) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch(`${API_URL}/health`, { signal: controller.signal })
      .then((res) => setStatus(res.ok ? 'operational' : 'unavailable'))
      .catch(() => setStatus('unavailable'))
      .finally(() => clearTimeout(timeout));
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  if (status === 'off') return null;

  const dotClass =
    status === 'operational' ? 'bg-emerald-500' : status === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500';

  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground" role="status" aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden="true" />
      {status === 'operational' ? 'Systems operational' : status === 'checking' ? 'Checking status…' : 'Status unavailable'}
    </span>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t bg-background" aria-label="Site footer">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <KadalkavachLogo iconClassName="h-5 w-5" wordmarkClassName="text-[15px] font-semibold tracking-tight" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Ocean intelligence from shoreline to response — citizen reports, AI enrichment and
            authority verification working together for South India&rsquo;s coastal communities.
          </p>
          <div className="mt-5">
            <SystemStatus />
          </div>
        </div>

        <nav aria-label="Explore">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Explore</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link className="text-muted-foreground transition-colors hover:text-foreground" to="/about">About</Link></li>
            <li><Link className="text-muted-foreground transition-colors hover:text-foreground" to="/how-it-works">How It Works</Link></li>
            <li><Link className="text-muted-foreground transition-colors hover:text-foreground" to="/public-alerts">Public Alerts</Link></li>
            <li><Link className="text-muted-foreground transition-colors hover:text-foreground" to="/track">Track a Report</Link></li>
          </ul>
        </nav>

        <nav aria-label="Information">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Information</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link className="text-muted-foreground transition-colors hover:text-foreground" to="/about#trust">
                Privacy &amp; trust
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground transition-colors hover:text-foreground" to="/about#trust">
                Accessibility
              </Link>
            </li>
            <li>
              <a
                className="text-muted-foreground transition-colors hover:text-foreground"
                href={`${API_URL}/health`}
                target="_blank"
                rel="noopener noreferrer"
              >
                System status
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t py-5">
        <p className="mx-auto w-full max-w-7xl px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          Kadalkavach · Coastal safety system. AI assists analysis but does not officially verify —
          authorities remain the final decision-makers.
        </p>
      </div>
    </footer>
  );
}
