import { RegionRecord } from './region.repository';

export const mapRegionToResponse = (region: RegionRecord) => ({
  id: region.id,
  stateCode: region.stateCode,
  stateName: region.stateName,
  districtName: region.districtName,
  displayName: region.displayName,
  primaryLanguageCode: region.primaryLanguageCode,
  secondaryLanguageCodes: region.secondaryLanguageCodes,
  latitude: region.latitude,
  longitude: region.longitude,
  coastalPriority: region.coastalPriority,
  isActive: region.isActive,
});