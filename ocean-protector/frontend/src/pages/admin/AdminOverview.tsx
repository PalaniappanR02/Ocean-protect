import { LayoutDashboard, Users, Shield, Building2, ScrollText, Cpu } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

/**
 * System admin overview. Shows only the modules that actually exist — no
 * admin APIs are implemented in the backend yet, so the sections are listed
 * as "not yet available" rather than inventing features.
 */
const MODULES = [
  { icon: Users, title: 'Users', description: 'Manage accounts and account status.' },
  { icon: Shield, title: 'Roles', description: 'Assign portal roles to accounts.' },
  { icon: Building2, title: 'Organisations', description: 'Manage authorities and organisations.' },
  { icon: ScrollText, title: 'Audit', description: 'Review the audit trail of decisions.' },
  { icon: Cpu, title: 'System', description: 'Service health and configuration.' },
];

export function AdminOverview() {
  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Admin Overview"
        description="System management for Kadalkavach. Backend administration APIs are not yet available, so only the modules below are listed — nothing is invented."
        icon={LayoutDashboard}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="opacity-80">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ocean-400/10">
                  <Icon className="h-5 w-5 text-ocean-400" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                  <span className="mt-3 inline-flex rounded-full border border-dashed px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Not yet available
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
