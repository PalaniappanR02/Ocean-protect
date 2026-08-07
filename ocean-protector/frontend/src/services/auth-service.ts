import { api } from './api-client';
import type { PortalRole } from '@/navigation/navigation.types';

export interface AuthProfile {
  id: string;
  email: string | null;
  /** Backend-issued role. Unknown values fail closed at the gate. */
  role: PortalRole;
  accountStatus: string;
  organisationName: string | null;
  jurisdictionStateCode: string | null;
}

export const authService = {
  async getMe(): Promise<AuthProfile> {
    const response = await api.get<{ success: boolean; data: AuthProfile }>('/api/v1/auth/me');
    return response.data;
  },
};
