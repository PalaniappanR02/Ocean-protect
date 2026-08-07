import { Settings, Sun, Moon, Globe, CircleUserRound } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLE_LABELS } from '@/navigation/navigation.types';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
];

export function CitizenSettings() {
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();
  const { profile } = useAuth();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ] as const;

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <PageHeader
        title="Settings"
        description="Your account, appearance and language preferences."
        icon={Settings}
      />

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleUserRound className="h-5 w-5 text-ocean-400" aria-hidden="true" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{profile?.email ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Verified role</span>
              <span className="font-medium">{profile ? ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS] ?? profile.role : '—'}</span>
            </div>
            {profile?.organisationName && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Organisation</span>
                <span className="font-medium">{profile.organisationName}</span>
              </div>
            )}
            {profile?.jurisdictionStateCode && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Jurisdiction</span>
                <span className="font-medium">{profile.jurisdictionStateCode}</span>
              </div>
            )}
            <p className="pt-1 text-xs leading-5 text-muted-foreground">
              Roles are assigned and verified by the Kadalkavach backend. Changing this view cannot change your access.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-ocean-400" aria-hidden="true" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Theme">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    theme === value ? 'border-ocean-400/50 bg-ocean-400/10 text-foreground' : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-ocean-400" aria-hidden="true" />
              Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Language">
              {LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => void i18n.changeLanguage(code)}
                  aria-pressed={i18n.language === code}
                  className={cn(
                    'inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    i18n.language === code ? 'border-ocean-400/50 bg-ocean-400/10 text-foreground' : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
