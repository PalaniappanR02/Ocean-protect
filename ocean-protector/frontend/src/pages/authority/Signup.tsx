import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { KadalkavachLogo } from '@/components/brand/KadalkavachLogo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { resolveRoleHome } from '@/navigation/role-home';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { session, role, loading, signUp } = useAuth();
  const navigate = useNavigate();

  // New accounts start as citizen (backend default). If a session is already
  // active, go to the trusted role home.
  useEffect(() => {
    if (!loading && session && role) {
      navigate(resolveRoleHome(role) ?? '/', { replace: true });
    }
  }, [session, role, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await signUp(email, password);
    if (error) setError(error);
    // On success, navigate to the root and let the auth resolver route by role.
    else navigate('/', { replace: true });
  }

  return (
    <div className="relative min-h-[82vh] overflow-hidden">
      {/* Full-page coastal backdrop — visible on every screen size */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1920&q=60"
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
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=60"
            alt=""
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.2]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#03141f]/60 to-[#03141f]/85" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <KadalkavachLogo iconClassName="h-7 w-7" wordmarkClassName="text-lg font-semibold tracking-tight text-white" />
            </div>
            <h2 className="mt-8 max-w-sm text-3xl font-semibold leading-tight tracking-[-0.03em] text-white">
              Join the coastal safety network.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              Every report starts with someone on the shore. Create a citizen account to
              report hazards, capture evidence offline and follow your reports.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 lg:hidden">
          <KadalkavachLogo iconClassName="h-6 w-6" wordmarkClassName="text-lg font-semibold tracking-tight" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">New accounts start with citizen access, assigned by the backend.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium">Password</label>
            <Input
              id="signup-password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
          <Button type="submit" className="w-full" size="lg">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4 hover:text-ocean-400">
            Sign in
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
