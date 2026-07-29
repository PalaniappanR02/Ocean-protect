import { useState, useCallback, useEffect } from 'react';
import { db, type DraftReport } from '@/lib/db';
import { reportService } from '@/services';
import { useNetworkStatus } from './useNetworkStatus';
import { useToast } from './useToast';
import type { OfflineQueueItem, HazardReport } from '@/types';
import { generateClientReportId } from '@/lib/utils';

const MAX_SYNC_RETRIES = 5;
const SYNC_RETRY_DELAY = 5000;

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const isOnline = useNetworkStatus();
  const { toast } = useToast();

  // Load queue from IndexedDB on mount
  useEffect(() => {
    loadQueue();
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !syncing) {
      syncQueue();
    }
  }, [isOnline, pendingCount, syncing]);

  const loadQueue = useCallback(async () => {
    const items = await db.queue.toArray();
    const sorted = items.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setQueue(sorted);
    const pending = items.filter(
      (item) => item.state === 'saved_offline' || item.state === 'sync_failed'
    ).length;
    setPendingCount(pending);
  }, []);

  const addToQueue = useCallback(
    async (item: Omit<OfflineQueueItem, 'id' | 'clientReportId' | 'trackingId' | 'receivedAt' | 'state' | 'syncAttempts' | 'createdAt' | 'updatedAt'>) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      const queueItem: OfflineQueueItem = {
        ...item,
        id,
        clientReportId: generateClientReportId(),
        receivedAt: now,
        state: 'saved_offline',
        syncAttempts: 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.queue.add(queueItem);
      await loadQueue();

      toast({
        title: 'Report Saved Offline',
        description: 'Your report will be synced automatically when you are back online.',
        variant: 'success',
      });

      if (isOnline) {
        syncQueue();
      }

      return id;
    },
    [isOnline, loadQueue, toast]
  );

  const syncQueue = useCallback(async () => {
    if (syncing || !isOnline) return;

    setSyncing(true);

    try {
      const pendingItems = await db.queue
        .where('state')
        .anyOf(['saved_offline', 'sync_failed'])
        .toArray();

      for (const item of pendingItems) {
        await syncItem(item);
      }

      await loadQueue();
    } catch (error) {
      console.error('Queue sync error:', error);
    } finally {
      setSyncing(false);
    }
  }, [syncing, isOnline, loadQueue]);

  const syncItem = useCallback(
    async (item: OfflineQueueItem): Promise<HazardReport | null> => {
      // Update state to syncing
      await db.queue.update(item.id, {
        state: 'syncing',
        lastSyncAttemptAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      try {
        const response = await reportService.create({
          clientReportId: item.clientReportId,
          hazardType: item.hazardType as any,
          title: item.title,
          description: item.description,
          languageCode: item.languageCode,
          isAnonymous: item.isAnonymous,
          reporterName: item.reporterName,
          reporterPhone: item.reporterPhone,
          latitude: item.latitude,
          longitude: item.longitude,
          locationAccuracyMeters: item.locationAccuracyMeters,
          locationSource: item.locationSource as any,
          stateCode: item.stateCode,
          districtName: item.districtName,
          observedAt: item.observedAt,
          receivedAt: item.receivedAt,
          mediaUrls: item.mediaUrls.map((m) => ({
            url: m.url,
            filename: m.filename,
            contentType: m.contentType,
            size: m.size,
          })),
        });

        // Mark as synced
        await db.queue.update(item.id, {
          state: 'synced',
          trackingId: response.trackingId,
          syncDelayMinutes: Math.round(
            (new Date(response.syncedAt || new Date().toISOString()).getTime() -
              new Date(item.observedAt).getTime()) /
              60000
          ),
          updatedAt: new Date().toISOString(),
        });

        toast({
          title: 'Report Synced',
          description: `Tracking ID: ${response.trackingId}`,
          variant: 'success',
        });

        return response;
      } catch (error) {
        console.error('Sync error for item', item.id, error);

        const newAttempts = item.syncAttempts + 1;

        if (newAttempts >= MAX_SYNC_RETRIES) {
          await db.queue.update(item.id, {
            state: 'sync_failed',
            syncAttempts: newAttempts,
            syncError: (error as Error).message,
            updatedAt: new Date().toISOString(),
          });

          toast({
            title: 'Sync Failed',
            description: `Failed after ${MAX_SYNC_RETRIES} attempts. Please try again later.`,
            variant: 'destructive',
          });
        } else {
          await db.queue.update(item.id, {
            state: 'sync_failed',
            syncAttempts: newAttempts,
            syncError: (error as Error).message,
            updatedAt: new Date().toISOString(),
          });

          // Schedule retry
          setTimeout(() => {
            if (isOnline) {
              syncQueue();
            }
          }, SYNC_RETRY_DELAY);
        }

        return null;
      }
    },
    [isOnline, toast]
  );

  const removeFromQueue = useCallback(async (id: string) => {
    await db.queue.delete(id);
    await loadQueue();
  }, [loadQueue]);

  const retrySync = useCallback(async (id: string) => {
    const item = await db.queue.get(id);
    if (!item) return;

    await db.queue.update(id, {
      state: 'saved_offline',
      syncError: undefined,
      updatedAt: new Date().toISOString(),
    });

    await loadQueue();

    if (isOnline) {
      syncQueue();
    }
  }, [isOnline, loadQueue, syncQueue]);

  const clearSynced = useCallback(async () => {
    await db.queue.where('state').equals('synced').delete();
    await loadQueue();
  }, [loadQueue]);

  return {
    queue,
    syncing,
    pendingCount,
    addToQueue,
    syncQueue,
    removeFromQueue,
    retrySync,
    clearSynced,
  };
}