import type { PortZone } from '../types';

export const PORT_ZONES: PortZone[] = [
  { code: 'USLAX', name: 'Los Angeles / Long Beach', country: 'United States', latitude: 33.74, longitude: -118.26, radiusKm: 45 },
  { code: 'NLRTM', name: 'Rotterdam', country: 'Netherlands', latitude: 51.95, longitude: 4.13, radiusKm: 32 },
  { code: 'SGSIN', name: 'Singapore', country: 'Singapore', latitude: 1.26, longitude: 103.84, radiusKm: 35 },
  { code: 'CNSHA', name: 'Shanghai', country: 'China', latitude: 31.36, longitude: 121.75, radiusKm: 42 },
  { code: 'AEJEA', name: 'Jebel Ali', country: 'United Arab Emirates', latitude: 25.0, longitude: 55.06, radiusKm: 34 },
  { code: 'USNYC', name: 'New York / New Jersey', country: 'United States', latitude: 40.63, longitude: -74.14, radiusKm: 30 },
  { code: 'PAPTY', name: 'Panama Canal (Pacific)', country: 'Panama', latitude: 8.95, longitude: -79.55, radiusKm: 28 },
  { code: 'EGSUZ', name: 'Suez', country: 'Egypt', latitude: 29.97, longitude: 32.55, radiusKm: 30 },
];
