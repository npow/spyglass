import type { FuelType, ShipCategory } from '../types';

export interface VesselProfile {
  defaultFuel: FuelType;
  designSpeedKnots: number;
  defaultLengthM: number;
  defaultBeamM: number;
  mainEngineBaseKw: number;
  auxEngineBaseKw: number;
}

export const CATEGORY_PROFILES: Record<ShipCategory, VesselProfile> = {
  cargo: {
    defaultFuel: 'HFO',
    designSpeedKnots: 19,
    defaultLengthM: 220,
    defaultBeamM: 34,
    mainEngineBaseKw: 16000,
    auxEngineBaseKw: 1400,
  },
  tanker: {
    defaultFuel: 'HFO',
    designSpeedKnots: 15,
    defaultLengthM: 240,
    defaultBeamM: 42,
    mainEngineBaseKw: 13000,
    auxEngineBaseKw: 1600,
  },
  passenger: {
    defaultFuel: 'MDO',
    designSpeedKnots: 22,
    defaultLengthM: 270,
    defaultBeamM: 36,
    mainEngineBaseKw: 26000,
    auxEngineBaseKw: 2800,
  },
  fishing: {
    defaultFuel: 'MDO',
    designSpeedKnots: 11,
    defaultLengthM: 40,
    defaultBeamM: 9,
    mainEngineBaseKw: 1400,
    auxEngineBaseKw: 220,
  },
  military: {
    defaultFuel: 'MDO',
    designSpeedKnots: 24,
    defaultLengthM: 125,
    defaultBeamM: 16,
    mainEngineBaseKw: 12000,
    auxEngineBaseKw: 1400,
  },
  tug: {
    defaultFuel: 'MDO',
    designSpeedKnots: 12,
    defaultLengthM: 32,
    defaultBeamM: 11,
    mainEngineBaseKw: 3200,
    auxEngineBaseKw: 350,
  },
  sailing: {
    defaultFuel: 'MDO',
    designSpeedKnots: 9,
    defaultLengthM: 28,
    defaultBeamM: 7,
    mainEngineBaseKw: 460,
    auxEngineBaseKw: 90,
  },
  highspeed: {
    defaultFuel: 'MDO',
    designSpeedKnots: 28,
    defaultLengthM: 80,
    defaultBeamM: 20,
    mainEngineBaseKw: 15000,
    auxEngineBaseKw: 900,
  },
  other: {
    defaultFuel: 'MDO',
    designSpeedKnots: 12,
    defaultLengthM: 70,
    defaultBeamM: 14,
    mainEngineBaseKw: 2400,
    auxEngineBaseKw: 300,
  },
};

export const FUEL_CO2_G_PER_KWH: Record<FuelType, number> = {
  HFO: 620,
  MDO: 650,
  LNG: 450,
};
