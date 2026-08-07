import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { RoleRoute } from '@/auth/RoleRoute';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';

const mockedUseAuth = vi.mocked(useAuth);

interface AuthState {
  session: unknown;
  role: string | null;
  loading: boolean;
  resolving: boolean;
  authError: string | null;
}

const session = { access_token: 't' };

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="probe">{location.pathname}</div>;
}

function makeAuth(overrides: Partial<AuthState>): AuthState {
  return { session: null, role: null, loading: false, resolving: false, authError: null, ...overrides };
}

let container: HTMLDivElement;
let root: Root;

function renderGuard(initialEntry: string, auth: AuthState) {
  mockedUseAuth.mockReturnValue(auth as never);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/analyst"
            element={
              <RoleRoute allowed={['analyst']}>
                <div data-testid="analyst-content">analyst workspace</div>
              </RoleRoute>
            }
          />
          <Route path="/citizen" element={<div data-testid="citizen-content">citizen home</div>} />
          <Route path="/login" element={<div data-testid="login-content">login page</div>} />
          <Route path="/403" element={<div data-testid="forbidden-content">forbidden page</div>} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>,
    );
  });
}

function text(selector: string): string | null {
  return container.querySelector(selector)?.textContent ?? null;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  if (root) {
    act(() => root.unmount());
  }
  vi.clearAllMocks();
});

describe('RoleRoute — authorization matrix', () => {
  it('UNAUTHENTICATED: protected route redirects to /login', () => {
    renderGuard('/analyst', makeAuth({}));
    expect(text('[data-testid="login-content"]')).toBe('login page');
    expect(text('[data-testid="probe"]')).toBe('/login');
  });

  it('CITIZEN: denied from /analyst, redirected to own home', () => {
    renderGuard('/analyst', makeAuth({ session, role: 'citizen' }));
    expect(text('[data-testid="citizen-content"]')).toBe('citizen home');
    expect(text('[data-testid="probe"]')).toBe('/citizen');
  });

  it('ANALYST: allowed into /analyst', () => {
    renderGuard('/analyst', makeAuth({ session, role: 'analyst' }));
    expect(text('[data-testid="analyst-content"]')).toBe('analyst workspace');
  });

  it('AUTHORITY_OPERATOR: denied from /analyst, redirected to /authority home', () => {
    renderGuard('/analyst', makeAuth({ session, role: 'authority_operator' }));
    // Authority home is not a route in this fixture — RoleRoute redirects there,
    // which falls through to the location probe.
    expect(text('[data-testid="probe"]')).toBe('/authority');
  });

  it('SYSTEM_ADMIN: denied from /analyst, redirected to /admin home', () => {
    renderGuard('/analyst', makeAuth({ session, role: 'system_admin' }));
    expect(text('[data-testid="probe"]')).toBe('/admin');
  });

  it('UNKNOWN ROLE: fails closed to the 403 page (no portal renders)', () => {
    renderGuard('/analyst', makeAuth({ session, role: 'root' }));
    expect(text('[data-testid="analyst-content"]')).toBeNull();
    // ForbiddenPage renders inline (not via redirect) with its own copy.
    expect(container.textContent).toContain('You do not have access to this workspace');
    expect(container.textContent).toContain('root');
  });

  it('AUTH LOADING: renders nothing (no flash of the wrong portal)', () => {
    renderGuard('/analyst', makeAuth({ session, role: null, loading: true }));
    expect(text('[data-testid="analyst-content"]')).toBeNull();
    expect(text('[data-testid="login-content"]')).toBeNull();
  });

  it('FAIL CLOSED: backend unavailable renders nothing here (AuthGate owns it)', () => {
    renderGuard('/analyst', makeAuth({ session, role: null, authError: 'unreachable' }));
    expect(text('[data-testid="analyst-content"]')).toBeNull();
  });

  it('SUSPENDED: renders nothing here (AuthGate owns it)', () => {
    renderGuard('/analyst', makeAuth({ session, role: null, authError: 'suspended' }));
    expect(text('[data-testid="analyst-content"]')).toBeNull();
  });
});
