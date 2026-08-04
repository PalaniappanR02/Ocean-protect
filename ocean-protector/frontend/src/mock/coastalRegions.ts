import type { CoastalRegion } from '@/types';

export const coastalRegions: CoastalRegion[] = [
  // Tamil Nadu
  {
    id: 'cr-tn-chn', stateCode: 'TN', stateName: 'Tamil Nadu', districtName: 'Chennai',
    coastalPriority: 1, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ta'],
    boundingBox: { minLat: 12.87, maxLat: 13.28, minLon: 80.05, maxLon: 80.35 },
    referencePoint: { latitude: 13.0827, longitude: 80.2707 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-tn-cud', stateCode: 'TN', stateName: 'Tamil Nadu', districtName: 'Cuddalore',
    coastalPriority: 2, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ta'],
    boundingBox: { minLat: 11.36, maxLat: 11.98, minLon: 79.37, maxLon: 79.85 },
    referencePoint: { latitude: 11.748, longitude: 79.7565 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-tn-ngp', stateCode: 'TN', stateName: 'Tamil Nadu', districtName: 'Nagapattinam',
    coastalPriority: 1, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ta'],
    boundingBox: { minLat: 10.59, maxLat: 11.31, minLon: 79.37, maxLon: 79.85 },
    referencePoint: { latitude: 10.7656, longitude: 79.8428 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-tn-tut', stateCode: 'TN', stateName: 'Tamil Nadu', districtName: 'Thoothukudi',
    coastalPriority: 2, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ta'],
    boundingBox: { minLat: 8.09, maxLat: 8.86, minLon: 77.72, maxLon: 78.42 },
    referencePoint: { latitude: 8.7642, longitude: 78.1348 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-tn-rmt', stateCode: 'TN', stateName: 'Tamil Nadu', districtName: 'Ramanathapuram',
    coastalPriority: 2, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ta'],
    boundingBox: { minLat: 9.09, maxLat: 9.97, minLon: 78.47, maxLon: 79.35 },
    referencePoint: { latitude: 9.3677, longitude: 78.8386 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-tn-kan', stateCode: 'TN', stateName: 'Tamil Nadu', districtName: 'Kanyakumari',
    coastalPriority: 1, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ta'],
    boundingBox: { minLat: 7.92, maxLat: 8.59, minLon: 77.09, maxLon: 77.62 },
    referencePoint: { latitude: 8.3833, longitude: 77.3500 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  // Kerala
  {
    id: 'cr-kl-trv', stateCode: 'KL', stateName: 'Kerala', districtName: 'Thiruvananthapuram',
    coastalPriority: 1, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ml'],
    boundingBox: { minLat: 8.17, maxLat: 8.90, minLon: 76.71, maxLon: 77.35 },
    referencePoint: { latitude: 8.5241, longitude: 76.9366 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-kl-alp', stateCode: 'KL', stateName: 'Kerala', districtName: 'Alappuzha',
    coastalPriority: 1, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ml'],
    boundingBox: { minLat: 9.08, maxLat: 9.72, minLon: 76.17, maxLon: 76.72 },
    referencePoint: { latitude: 9.4913, longitude: 76.3400 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-kl-ekm', stateCode: 'KL', stateName: 'Kerala', districtName: 'Ernakulam',
    coastalPriority: 1, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ml'],
    boundingBox: { minLat: 9.62, maxLat: 10.32, minLon: 76.17, maxLon: 76.85 },
    referencePoint: { latitude: 9.9816, longitude: 76.2922 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-kl-kzh', stateCode: 'KL', stateName: 'Kerala', districtName: 'Kozhikode',
    coastalPriority: 2, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ml'],
    boundingBox: { minLat: 11.08, maxLat: 11.70, minLon: 75.58, maxLon: 76.12 },
    referencePoint: { latitude: 11.2588, longitude: 75.7804 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-kl-kan', stateCode: 'KL', stateName: 'Kerala', districtName: 'Kannur',
    coastalPriority: 2, primaryLanguageCode: 'en', secondaryLanguageCodes: ['ml'],
    boundingBox: { minLat: 11.70, maxLat: 12.30, minLon: 75.05, maxLon: 75.68 },
    referencePoint: { latitude: 11.8745, longitude: 75.3704 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  // Karnataka
  {
    id: 'cr-ka-mng', stateCode: 'KA', stateName: 'Karnataka', districtName: 'Dakshina Kannada',
    coastalPriority: 2, primaryLanguageCode: 'en', secondaryLanguageCodes: ['kn'],
    boundingBox: { minLat: 12.47, maxLat: 13.15, minLon: 74.47, maxLon: 75.12 },
    referencePoint: { latitude: 12.8700, longitude: 74.8420 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-ka-udu', stateCode: 'KA', stateName: 'Karnataka', districtName: 'Udupi',
    coastalPriority: 2, primaryLanguageCode: 'en', secondaryLanguageCodes: ['kn'],
    boundingBox: { minLat: 13.05, maxLat: 13.70, minLon: 74.38, maxLon: 75.05 },
    referencePoint: { latitude: 13.3409, longitude: 74.7421 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-ka-ukr', stateCode: 'KA', stateName: 'Karnataka', districtName: 'Uttara Kannada',
    coastalPriority: 3, primaryLanguageCode: 'en', secondaryLanguageCodes: ['kn'],
    boundingBox: { minLat: 13.82, maxLat: 15.05, minLon: 73.87, maxLon: 74.75 },
    referencePoint: { latitude: 14.5676, longitude: 74.7139 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  // Andhra Pradesh
  {
    id: 'cr-ap-nel', stateCode: 'AP', stateName: 'Andhra Pradesh', districtName: 'Sri Potti Sriramulu Nellore',
    coastalPriority: 1, primaryLanguageCode: 'en', secondaryLanguageCodes: ['te'],
    boundingBox: { minLat: 13.30, maxLat: 15.25, minLon: 79.37, maxLon: 80.42 },
    referencePoint: { latitude: 14.4381, longitude: 79.9900 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-ap-vsp', stateCode: 'AP', stateName: 'Andhra Pradesh', districtName: 'Visakhapatnam',
    coastalPriority: 1, primaryLanguageCode: 'en', secondaryLanguageCodes: ['te'],
    boundingBox: { minLat: 17.15, maxLat: 18.35, minLon: 82.42, maxLon: 83.42 },
    referencePoint: { latitude: 17.6868, longitude: 82.7189 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-ap-krn', stateCode: 'AP', stateName: 'Andhra Pradesh', districtName: 'Krishna',
    coastalPriority: 2, primaryLanguageCode: 'en', secondaryLanguageCodes: ['te'],
    boundingBox: { minLat: 15.37, maxLat: 16.62, minLon: 79.47, maxLon: 81.35 },
    referencePoint: { latitude: 16.1700, longitude: 80.6200 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-tn-myd', stateCode: 'TN', stateName: 'Tamil Nadu', districtName: 'Mayiladuthurai',
    coastalPriority: 2, primaryLanguageCode: 'ta', secondaryLanguageCodes: ['en'],
    boundingBox: { minLat: 10.98, maxLat: 11.35, minLon: 79.48, maxLon: 79.92 },
    referencePoint: { latitude: 11.1037, longitude: 79.6497 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-kl-ksd', stateCode: 'KL', stateName: 'Kerala', districtName: 'Kasaragod',
    coastalPriority: 2, primaryLanguageCode: 'ml', secondaryLanguageCodes: ['en'],
    boundingBox: { minLat: 12.18, maxLat: 12.78, minLon: 74.82, maxLon: 75.35 },
    referencePoint: { latitude: 12.4996, longitude: 74.9867 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cr-ap-skl', stateCode: 'AP', stateName: 'Andhra Pradesh', districtName: 'Srikakulam',
    coastalPriority: 2, primaryLanguageCode: 'te', secondaryLanguageCodes: ['en'],
    boundingBox: { minLat: 18.05, maxLat: 19.12, minLon: 83.42, maxLon: 84.60 },
    referencePoint: { latitude: 18.2969, longitude: 83.8993 }, isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z',
  },
];

export function getCoastalRegionByLocation(lat: number, lon: number): CoastalRegion | undefined {
  return coastalRegions.find((r) => {
    const bb = r.boundingBox;
    return lat >= bb.minLat && lat <= bb.maxLat && lon >= bb.minLon && lon <= bb.maxLon;
  });
}

export function getCoastalRegionsByState(stateCode: string): CoastalRegion[] {
  return coastalRegions.filter((r) => r.stateCode === stateCode);
}
