import { KadalkavachLogo } from '@/components/brand/KadalkavachLogo';

/**
 * Branded loading shell shown while Supabase session and /auth/me resolve.
 * No portal chrome is rendered here, so the wrong portal can never flash.
 */
export function AuthLoadingShell() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background" role="status" aria-live="polite" aria-label="Loading Kadalkavach">
      <KadalkavachLogo iconClassName="h-8 w-8" wordmarkClassName="text-lg font-semibold tracking-tight" />
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-400 border-t-transparent" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Verifying secure access…</p>
    </div>
  );
}
