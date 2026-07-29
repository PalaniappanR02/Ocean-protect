import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

import { MainLayout } from '@/components/layout/MainLayout';
import { AppShell } from '@/components/layout/AppShell';

// Citizen
import { CitizenDashboard } from '@/pages/citizen/CitizenDashboard';
import { ReportHazard } from '@/pages/citizen/ReportHazard';
import { ReportTracking } from '@/pages/citizen/ReportTracking';
import { CitizenAlerts } from '@/pages/citizen/CitizenAlerts';
import { CitizenMap } from '@/pages/citizen/CitizenMap';
import { OfflineQueue } from '@/pages/citizen/OfflineQueue';

// Analyst
import { AnalystDashboard } from '@/pages/analyst/AnalystDashboard';
import { AnalystReports } from '@/pages/analyst/AnalystReports';
import { ReportDetail } from '@/pages/analyst/ReportDetail';
import { AnalystIncidents } from '@/pages/analyst/AnalystIncidents';
import { AnalystMap } from '@/pages/analyst/AnalystMap';
import { SocialSignalsPage } from '@/pages/analyst/SocialSignals';

// Authority
import { AuthorityDashboard } from '@/pages/authority/AuthorityDashboard';
import { AuthorityIncidents } from '@/pages/authority/AuthorityIncidents';
import { AuthorityIncidentDetail } from '@/pages/authority/IncidentsDetail';
import { AuthorityAlert } from '@/pages/authority/AuthorityAlerts';
import { AuthorityMap } from '@/pages/authority/AuthorityMap';
import { ResponseTeams } from '@/pages/authority/ResponsesTeams';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              {/* Citizen */}
              <Route path="/citizen" element={<MainLayout role="citizen" />}>
                <Route index element={<CitizenDashboard />} />
                <Route path="report" element={<ReportHazard />} />
                <Route path="tracking" element={<ReportTracking />} />
                <Route path="tracking/:trackingId" element={<ReportTracking />} />
                <Route path="alerts" element={<CitizenAlerts />} />
                <Route path="map" element={<CitizenMap />} />
                <Route path="offline" element={<OfflineQueue />} />
              </Route>

              {/* Analyst */}
              <Route path="/analyst" element={<MainLayout role="analyst" />}>
                <Route index element={<AnalystDashboard />} />
                <Route path="reports" element={<AnalystReports />} />
                <Route path="reports/:reportId" element={<ReportDetail />} />
                <Route path="incidents" element={<AnalystIncidents />} />
                <Route path="map" element={<AnalystMap />} />
                <Route path="social" element={<SocialSignalsPage />} />
              </Route>

              {/* Authority */}
              <Route path="/authority" element={<MainLayout role="authority" />}>
                <Route index element={<AuthorityDashboard />} />
                <Route path="incidents" element={<AuthorityIncidents />} />
                <Route path="incidents/:incidentId" element={<AuthorityIncidentDetail />} />
                <Route path="incidents/:incidentId/alert" element={<AuthorityAlert />} />
                <Route path="map" element={<AuthorityMap />} />
                <Route path="teams" element={<ResponseTeams />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/citizen" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
