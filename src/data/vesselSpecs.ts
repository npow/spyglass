import type { VesselSpec } from '../types';

// Seed datasource keyed by IMO for deterministic overrides.
// Replace/extend this with your regulator dataset export.
export const VESSEL_SPECS: Record<number, VesselSpec> = {
  9726536: {
    imo: 9726536,
    fuelType: 'HFO',
    designSpeedKnots: 22,
    mainEngineKw: 59000,
    auxEngineKw: 6000,
    source: 'seed:carrier-profile',
    updatedAt: '2026-03-01',
  },
  9839179: {
    imo: 9839179,
    fuelType: 'LNG',
    designSpeedKnots: 19,
    mainEngineKw: 42000,
    auxEngineKw: 4100,
    source: 'seed:lng-container-profile',
    updatedAt: '2026-03-01',
  },
  9298686: {
    imo: 9298686,
    fuelType: 'HFO',
    designSpeedKnots: 15,
    mainEngineKw: 17000,
    auxEngineKw: 1800,
    source: 'seed:tanker-profile',
    updatedAt: '2026-03-01',
  },
  9074729: {
    imo: 9074729,
    fuelType: 'MDO',
    designSpeedKnots: 20,
    mainEngineKw: 8700,
    auxEngineKw: 1300,
    source: 'seed:ro-ro-profile',
    updatedAt: '2026-03-01',
  },
};
