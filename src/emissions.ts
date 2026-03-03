import { CATEGORY_PROFILES, FUEL_CO2_G_PER_KWH } from './data/vesselProfiles';
import type { EmissionEstimate, PortZone, Ship, VesselSpec } from './types';
import { getShipCategory } from './utils';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNavMultiplier(navStatus: number): { main: number; aux: number } {
  if (navStatus === 0) return { main: 1, aux: 0.35 };
  if (navStatus === 1 || navStatus === 5) return { main: 0.08, aux: 0.6 };
  if (navStatus === 7) return { main: 0.45, aux: 0.4 };
  return { main: 0.25, aux: 0.45 };
}

export function estimateShipEmissions(ship: Ship, vesselSpec?: VesselSpec): EmissionEstimate {
  const category = getShipCategory(ship.shipType);
  const profile = CATEGORY_PROFILES[category];

  const length = ship.dimA + ship.dimB || profile.defaultLengthM;
  const beam = ship.dimC + ship.dimD || profile.defaultBeamM;

  const sizeScale = clamp(Math.pow(length / profile.defaultLengthM, 1.7), 0.35, 4);
  const beamScale = clamp(Math.pow(beam / profile.defaultBeamM, 0.6), 0.55, 2);

  const estimatedMainPowerKw = vesselSpec?.mainEngineKw ?? profile.mainEngineBaseKw * sizeScale * beamScale;
  const estimatedAuxPowerKw = vesselSpec?.auxEngineKw ?? profile.auxEngineBaseKw * beamScale;

  const designSpeedKnots = vesselSpec?.designSpeedKnots ?? profile.designSpeedKnots;
  const speedRatio = clamp(ship.sog / Math.max(designSpeedKnots, 1), 0, 1.15);
  const baseLoadFactor = clamp(Math.pow(speedRatio, 3), 0.05, 1);
  const nav = getNavMultiplier(ship.navStatus);
  const loadFactor = clamp(baseLoadFactor * nav.main, 0.04, 1);

  const effectivePowerKw = estimatedMainPowerKw * loadFactor + estimatedAuxPowerKw * nav.aux;
  const fuelType = vesselSpec?.fuelType ?? profile.defaultFuel;
  const co2TonnesPerHour = (effectivePowerKw * FUEL_CO2_G_PER_KWH[fuelType]) / 1_000_000;

  let confidence = 100;
  const assumptions: string[] = [];

  if (vesselSpec) {
    assumptions.push(`Vessel spec datasource: ${vesselSpec.source} (updated ${vesselSpec.updatedAt})`);
  } else {
    assumptions.push(`Fuel type inferred as ${fuelType} from ${category} class profile`);
  }
  assumptions.push(`Design speed baseline ${designSpeedKnots} kn`);
  assumptions.push(`Main engine load factor estimated via speed-cubed model`);

  if (ship.dimA + ship.dimB === 0 || ship.dimC + ship.dimD === 0) {
    confidence -= 22;
    assumptions.push('Missing AIS dimensions; fallback class dimensions applied');
  }

  if (ship.draught <= 0) {
    confidence -= 8;
    assumptions.push('Draught unavailable; no loading correction applied');
  }

  const ageMinutes = (Date.now() - ship.lastUpdate) / 60000;
  if (ageMinutes > 15) {
    confidence -= 18;
    assumptions.push('AIS update older than 15 minutes');
  } else if (ageMinutes > 5) {
    confidence -= 10;
    assumptions.push('AIS update older than 5 minutes');
  }

  if (ship.shipType === 0 && !vesselSpec) {
    confidence -= 16;
    assumptions.push('Ship type unknown; generic class profile used');
  }

  if (ship.sog >= 102) {
    confidence -= 10;
    assumptions.push('Speed over ground invalid/missing; conservative minimum load applied');
  }

  return {
    mmsi: ship.mmsi,
    fuelType,
    estimatedMainPowerKw,
    estimatedAuxPowerKw,
    loadFactor,
    co2TonnesPerHour,
    confidence: clamp(Math.round(confidence), 20, 100),
    assumptions,
  };
}

export function isShipInPort(ship: Ship, port: PortZone): boolean {
  const distance = haversineKm(ship.latitude, ship.longitude, port.latitude, port.longitude);
  return distance <= port.radiusKm;
}

export function priorityScore(estimate: EmissionEstimate): number {
  const uncertaintyWeight = 1 + (100 - estimate.confidence) / 120;
  return estimate.co2TonnesPerHour * uncertaintyWeight;
}
