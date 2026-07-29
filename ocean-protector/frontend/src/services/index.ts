import { reportService as apiReportService } from './report-service';
import { mockReportService } from './social-service';
import { mockIncidentService } from './incident-service';
import { mockAlertService } from './alert-service';
import { mockRegionService } from './region-service';
import { mockSocialSignals } from '@/mock/socialSignals';
import { delay } from '@/lib/utils';

const useApi = import.meta.env.VITE_DATA_MODE === 'api';

// Reports use the live API in API mode. Other portals remain mock-backed until
// their dedicated API adapters are completed, so the complete UI stays usable.
export const reportService = useApi ? apiReportService : mockReportService;
export const incidentService = mockIncidentService;
export const alertService = mockAlertService;
export const regionService = mockRegionService;
export const socialService = {
  async list(filters: { minRelevance?: number; minUrgency?: number } = {}) {
    await delay(180);
    return mockSocialSignals.filter(
      (signal) =>
        (signal.relevanceScore ?? 0) >= (filters.minRelevance ?? 0) &&
        (signal.urgencyScore ?? 0) >= (filters.minUrgency ?? 0),
    );
  },
  async getTrends() {
    await delay(120);
    const counts = new Map<string, number>();
    mockSocialSignals
      .flatMap((signal) => signal.keywordsMatched || [])
      .forEach((keyword) => counts.set(keyword, (counts.get(keyword) || 0) + 1));
    return {
      totalSignals: mockSocialSignals.length,
      relevantSignals: mockSocialSignals.filter((signal) => signal.relevanceScore >= 60).length,
      highUrgency: mockSocialSignals.filter((signal) => signal.urgencyScore >= 80).length,
      topKeywords: [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count })),
    };
  },
};
