import Dexie, { type Table } from 'dexie';
import type { OfflineQueueItem, MediaUrl } from '@/types';

export interface DraftReport {
  id?: number;
  clientReportId: string;
  hazardType: string;
  title: string;
  description: string;
  languageCode: string;
  isAnonymous: boolean;
  reporterName?: string;
  reporterPhone?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracyMeters?: number;
  locationSource: string;
  stateCode?: string;
  districtName?: string;
  observedAt?: string;
  mediaUrls: MediaUrl[];
  createdAt: string;
  updatedAt: string;
}

export class OceanGuardDB extends Dexie {
  drafts!: Table<DraftReport, number>;
  queue!: Table<OfflineQueueItem, string>;
  cache!: Table<{ key: string; value: unknown; expiresAt: number }, string>;

  constructor() {
    super('oceanguard');
    this.version(1).stores({
      drafts: '++id, clientReportId, updatedAt',
      queue: 'id, clientReportId, state, createdAt',
      cache: 'key, expiresAt',
    });
  }
}

export const db = new OceanGuardDB();