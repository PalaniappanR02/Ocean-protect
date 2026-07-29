import type { CoastalRegion } from '@/types';
import { coastalRegions, getCoastalRegionByLocation } from '@/mock/coastalRegions';
import { delay } from '@/lib/utils';

const mockRegionService = {
  async list(): Promise<CoastalRegion[]> {
    await delay(200);
    return coastalRegions;
  },

  async getByState(stateCode: string): Promise<CoastalRegion[]> {
    await delay(200);
    return coastalRegions.filter((r) => r.stateCode === stateCode);
  },

  async getByLocation(lat: number, lon: number): Promise<CoastalRegion | null> {
    await delay(100);
    return getCoastalRegionByLocation(lat, lon) || null;
  },
};

export { mockRegionService };