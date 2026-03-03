import { useEffect, useMemo, useState } from 'react';
import { VESSEL_SPECS } from '../data/vesselSpecs';
import type { Ship, VesselSpec } from '../types';

const REMOTE_SPECS_URL = import.meta.env.VITE_VESSEL_SPECS_API_URL as string | undefined;

async function fetchRemoteSpec(imo: number): Promise<VesselSpec | null> {
  if (!REMOTE_SPECS_URL) return null;

  try {
    const url = `${REMOTE_SPECS_URL.replace(/\/$/, '')}/vessels/${imo}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const payload = (await response.json()) as Partial<VesselSpec>;
    if (!payload.imo || !payload.mainEngineKw || !payload.auxEngineKw || !payload.designSpeedKnots || !payload.fuelType) {
      return null;
    }

    return {
      imo: payload.imo,
      fuelType: payload.fuelType,
      designSpeedKnots: payload.designSpeedKnots,
      mainEngineKw: payload.mainEngineKw,
      auxEngineKw: payload.auxEngineKw,
      source: payload.source || 'remote:unknown',
      updatedAt: payload.updatedAt || new Date().toISOString().slice(0, 10),
    };
  } catch {
    return null;
  }
}

export function useVesselSpecs(ships: Map<number, Ship>) {
  const [specsByImo, setSpecsByImo] = useState<Map<number, VesselSpec>>(new Map());

  const imos = useMemo(() => {
    const unique = new Set<number>();
    for (const ship of ships.values()) {
      if (ship.imo > 0) unique.add(ship.imo);
    }
    return Array.from(unique.values());
  }, [ships]);

  useEffect(() => {
    if (imos.length === 0) return;

    let cancelled = false;

    // Stage 1: apply local seeded specs immediately.
    setSpecsByImo((prev) => {
      const next = new Map(prev);
      for (const imo of imos) {
        const local = VESSEL_SPECS[imo];
        if (local) next.set(imo, local);
      }
      return next;
    });

    // Stage 2: fetch remote specs and overwrite seed entries when available.
    if (!REMOTE_SPECS_URL) return;

    void Promise.all(
      imos.map(async (imo) => {
        const remote = await fetchRemoteSpec(imo);
        if (!remote || cancelled) return;

        setSpecsByImo((prev) => {
          const next = new Map(prev);
          next.set(imo, remote);
          return next;
        });
      }),
    );

    return () => {
      cancelled = true;
    };
  }, [imos]);

  return { specsByImo };
}
