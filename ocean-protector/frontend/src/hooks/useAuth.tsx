import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authService, type AuthProfile } from '@/services/auth-service';
import { isKnownRole, type PortalRole } from '@/navigation/route-access';

export type AuthFailure = 'unreachable' | 'suspended' | null;

interface AuthContextValue {
  session: Session | null;
  /** Trusted profile from GET /api/v1/auth/me — null until resolved. */
  profile: AuthProfile | null;
  /** Backend role (null while resolving or when the profile is unavailable). */
  role: PortalRole | null;
  /** True during initial session/profile boot. */
  loading: boolean;
  /** True while a session exists but the trusted profile is still resolving. */
  resolving: boolean;
  /**
   * Fail-closed marker. 'unreachable' = backend could not verify access;
   * 'suspended' = account_status is not active. When set, protected content
   * must NOT render and the caller must show the appropriate error state.
   */
  authError: AuthFailure;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [authError, setAuthError] = useState<AuthFailure>(null);

  // Role is resolved server-side from the internal users table. The frontend
  // never fabricates, caches or trusts a locally stored role: local storage,
  // query parameters and headers are all ignored by this resolution path.
  const loadProfile = useCallback(async (tokenSession: Session) => {
    setResolving(true);
    setAuthError(null);
    try {
      const me = await authService.getMe();
      if (me.accountStatus !== 'active') {
        // Account exists but is not active → restricted, fail closed.
        setProfile(null);
        setAuthError('suspended');
      } else if (isKnownRole(me.role)) {
        // isKnownRole guards against future/unknown backend roles.
        setProfile(me);
      } else {
        // Backend returned a role this frontend does not know → fail closed.
        setProfile(null);
        setAuthError(null);
      }
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 401) {
        // Stale/expired token — the session is not valid any more.
        setProfile(null);
        setSession(null);
        await supabase.auth.signOut().catch(() => undefined);
      } else {
        // Network / server failure → cannot verify access. FAIL CLOSED.
        setProfile(null);
        setAuthError('unreachable');
      }
    } finally {
      setResolving(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        await loadProfile(data.session);
      }
      if (active) setLoading(false);
    }
    void init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (newSession) {
        await loadProfile(newSession);
      } else {
        setProfile(null);
        setAuthError(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async (): Promise<void> => {
    setProfile(null);
    setAuthError(null);
    await supabase.auth.signOut();
  };

  const role: PortalRole | null = profile ? profile.role : null;

  return (
    <AuthContext.Provider
      value={{ session, profile, role, loading, resolving, authError, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
