import { api } from './api-client';

export interface AppNotification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async list(): Promise<{ items: AppNotification[]; unread: number }> {
    const response = await api.get<{ success: boolean; data: AppNotification[]; meta: { unread: number } }>(
      '/api/v1/notifications',
    );
    return { items: response.data, unread: response.meta.unread ?? 0 };
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/api/v1/notifications/${id}/read`, {});
  },

  async markAllRead(): Promise<void> {
    await api.post('/api/v1/notifications/read-all', {});
  },
};
