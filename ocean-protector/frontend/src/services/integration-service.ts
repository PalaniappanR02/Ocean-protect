import { api } from './api-client';

export interface IntegrationStatus {
  voice: {
    twilio: { configured: boolean; requiredEnv: string[] };
    vapi: { configured: boolean; requiredEnv: string[] };
  };
  incois: { configured: boolean; feedUrl: string | null; requiredEnv: string[] };
  earlyWarning: { configured: boolean; feedUrl: string | null; requiredEnv: string[] };
}

export const integrationService = {
  /** Returns null when the API is unreachable (the UI shows an unknown state). */
  async status(): Promise<IntegrationStatus | null> {
    try {
      const response = await api.get<{ success: boolean; data: IntegrationStatus }>(
        '/api/v1/integrations/status',
      );
      return response.data;
    } catch {
      return null;
    }
  },
};
