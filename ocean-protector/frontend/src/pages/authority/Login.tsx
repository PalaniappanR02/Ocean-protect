import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { KadalkavachLogo } from '@/components/brand/KadalkavachLogo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { resolveRoleHome } from '@/navigation/role-home';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { session, role, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Already authenticated → go to the trusted role home (or the page they
  // originally wanted, when it is one their role may open).
  useEffect(() => {
    if (!loading && session && role) {
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? resolveRoleHome(role) ?? '/', { replace: true });
    }
  }, [session, role, loading, navigate, location.state]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await signIn(email, password);
    // On success the auth listener resolves the trusted role and this page
    // redirects via the effect above — the frontend never picks a role.
    if (error) setError(error);
  }

  return (
    <div className="relative min-h-[82vh] overflow-hidden">
      {/* Full-page coastal backdrop — visible on every screen size */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=60"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-[0.28]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/55 to-background" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
      <div className="hidden lg:block" aria-hidden="true">
        <div className="landing-hero relative overflow-hidden rounded-3xl p-10">
          <img
            src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=60"
            alt=""
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.22]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#03141f]/60 to-[#03141f]/85" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <KadalkavachLogo iconClassName="h-7 w-7" wordmarkClassName="text-lg font-semibold tracking-tight text-white" />
            </div>
            <h2 className="mt-8 max-w-sm text-3xl font-semibold leading-tight tracking-[-0.03em] text-white">
              Your workspace follows your verified role.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              Sign in to reach the portal your account is authorized for — citizen,
              analyst, authority or admin. Access is decided by the backend, not by
              your browser.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 lg:hidden">
          <KadalkavachLogo iconClassName="h-6 w-6" wordmarkClassName="text-lg font-semibold tracking-tight" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to your Kadalkavach workspace.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium">Email</label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium">Password</label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
          <Button type="submit" className="w-full" size="lg">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          No account?{' '}
          <Link to="/signup" className="font-medium text-foreground underline underline-offset-4 hover:text-ocean-400">
            Create one
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
