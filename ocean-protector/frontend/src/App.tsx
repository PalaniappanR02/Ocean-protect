import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

import { AppShell } from '@/components/layout/AppShell';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AuthGate } from '@/auth/AuthGate';
import { ErrorBoundary } from '@/auth/ErrorBoundary';
import { RoleRoute } from '@/auth/RoleRoute';
import { PublicLayout } from '@/layouts/PublicLayout';
import { RoleWorkspaceLayout } from '@/layouts/RoleWorkspaceLayout';
import { resolveRoleHome } from '@/navigation/role-home';
import { LoadingSkeleton } from '@/components/layout/LoadingSkeleton';

// Public
import { LandingPage } from '@/pages/public/LandingPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { PublicAlertsPage } from '@/pages/public/PublicAlertsPage';
import { PublicTrackPage } from '@/pages/public/PublicTrackPage';
import { Login } from '@/pages/authority/Login';
import { Signup } from '@/pages/authority/Signup';

// Errors
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

// Citizen (static)
import { CitizenDashboard } from '@/pages/citizen/CitizenDashboard';
import { ReportHazard } from '@/pages/citizen/ReportHazard';
import { ReportTracking } from '@/pages/citizen/ReportTracking';
import { CitizenAlerts } from '@/pages/citizen/CitizenAlerts';
import { CitizenReports } from '@/pages/citizen/CitizenReports';
import { OfflineQueue } from '@/pages/citizen/OfflineQueue';
import { CitizenNotifications } from '@/pages/citizen/CitizenNotifications';
import { CitizenSettings } from '@/pages/citizen/CitizenSettings';

// Analyst (static)
import { AnalystDashboard } from '@/pages/analyst/AnalystDashboard';
import { AnalystReports } from '@/pages/analyst/AnalystReports';
import { ReportDetail } from '@/pages/analyst/ReportDetail';
import { AnalystIncidents } from '@/pages/analyst/AnalystIncidents';
import { SocialSignalsPage } from '@/pages/analyst/SocialSignals';

// Authority (static)
import { AuthorityDashboard } from '@/pages/authority/AuthorityDashboard';
import { AuthorityIncidents } from '@/pages/authority/AuthorityIncidents';
import { AuthorityIncidentDetail } from '@/pages/authority/IncidentsDetail';
import { AuthorityAlert } from '@/pages/authority/AuthorityAlerts';
import { ResponseTeams } from '@/pages/authority/ResponsesTeams';

// Admin
import { AdminOverview } from '@/pages/admin/AdminOverview';

// Map pages are lazy-loaded (Leaflet is the largest dependency).
const CitizenMap = lazy(() => import('@/pages/citizen/CitizenMap').then((m) => ({ default: m.CitizenMap })));
const AnalystMap = lazy(() => import('@/pages/analyst/AnalystMap').then((m) => ({ default: m.AnalystMap })));
const AuthorityMap = lazy(() => import('@/pages/authority/AuthorityMap').then((m) => ({ default: m.AuthorityMap })));

import { ThemeProvider } from 'next-themes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const CITIZEN_ROLES = ['citizen', 'verified_volunteer'] as const;
const ANALYST_ROLES = ['analyst'] as const;
const AUTHORITY_ROLES = ['authority_operator', 'authority_supervisor'] as const;
const ADMIN_ROLES = ['system_admin'] as const;

const MapFallback = () => (
  <div className="py-10">
    <LoadingSkeleton rows={2} label="Loading hazard map" />
  </div>
);

/**
 * Root route: unauthenticated visitors see the public landing page;
 * authenticated users are routed straight to their trusted role home.
 * No visible role-selection screen exists anywhere.
 */
function RootRoute() {
  const { session, role, loading, resolving, authError } = useAuth();

  if (loading || resolving || authError) return null; // AuthGate owns these states
  if (!session) return <LandingPage />;

  const home = resolveRoleHome(role);
  return home ? <Navigate to={home} replace /> : <Navigate to="/403" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <AuthProvider>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AuthGate>
                <ErrorBoundary>
                  <Routes>
                  {/* Public landing */}
                  <Route path="/" element={<RootRoute />} />

                  {/* Public pages */}
                  <Route element={<PublicLayout />}>
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/public-alerts" element={<PublicAlertsPage />} />
                    <Route path="/track" element={<PublicTrackPage />} />
                    <Route path="/track/:trackingId" element={<PublicTrackPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/403" element={<ForbiddenPage />} />
                  </Route>

                  {/* Authenticated role portals */}
                  <Route element={<AppShell />}>
                    {/* Citizen */}
                    <Route
                      path="/citizen"
                      element={
                        <RoleRoute allowed={CITIZEN_ROLES}>
                          <RoleWorkspaceLayout portal="citizen" />
                        </RoleRoute>
                      }
                    >
                      <Route index element={<CitizenDashboard />} />
                      <Route path="report" element={<ReportHazard />} />
                      <Route path="tracking" element={<ReportTracking />} />
                      <Route path="tracking/:trackingId" element={<ReportTracking />} />
                      <Route path="alerts" element={<CitizenAlerts />} />
                      <Route path="map" element={<Suspense fallback={<MapFallback />}><CitizenMap /></Suspense>} />
                      <Route path="reports" element={<CitizenReports />} />
                      <Route path="offline" element={<OfflineQueue />} />
                      <Route path="notifications" element={<CitizenNotifications />} />
                      <Route path="settings" element={<CitizenSettings />} />
                    </Route>

                    {/* Analyst */}
                    <Route
                      path="/analyst"
                      element={
                        <RoleRoute allowed={ANALYST_ROLES}>
                          <RoleWorkspaceLayout portal="analyst" />
                        </RoleRoute>
                      }
                    >
                      <Route index element={<AnalystDashboard />} />
                      <Route path="reports" element={<AnalystReports />} />
                      <Route path="reports/:reportId" element={<ReportDetail />} />
                      <Route path="incidents" element={<AnalystIncidents />} />
                      <Route path="map" element={<Suspense fallback={<MapFallback />}><AnalystMap /></Suspense>} />
                      <Route path="social" element={<SocialSignalsPage />} />
                    </Route>

                    {/* Authority */}
                    <Route
                      path="/authority"
                      element={
                        <RoleRoute allowed={AUTHORITY_ROLES}>
                          <RoleWorkspaceLayout portal="authority" />
                        </RoleRoute>
                      }
                    >
                      <Route index element={<AuthorityDashboard />} />
                      <Route path="incidents" element={<AuthorityIncidents />} />
                      <Route path="incidents/:incidentId" element={<AuthorityIncidentDetail />} />
                      <Route path="incidents/:incidentId/alert" element={<AuthorityAlert />} />
                      <Route path="map" element={<Suspense fallback={<MapFallback />}><AuthorityMap /></Suspense>} />
                      <Route path="teams" element={<ResponseTeams />} />
                    </Route>

                    {/* System admin */}
                    <Route
                      path="/admin"
                      element={
                        <RoleRoute allowed={ADMIN_ROLES}>
                          <RoleWorkspaceLayout portal="admin" />
                        </RoleRoute>
                      }
                    >
                      <Route index element={<AdminOverview />} />
                    </Route>
                  </Route>

                  {/* 404 (inside the public shell so unauthenticated visitors keep site chrome) */}
                  <Route element={<PublicLayout />}>
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
                </ErrorBoundary>
              </AuthGate>
            </BrowserRouter>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
