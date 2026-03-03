import { useState, useCallback, useMemo } from 'react';
import { ShipMap } from './components/ShipMap';
import { ShipPanel } from './components/ShipPanel';
import { HUD } from './components/HUD';
import { ApiKeyModal } from './components/ApiKeyModal';
import { useAISStream } from './hooks/useAISStream';
import { useDemoShips } from './hooks/useDemoShips';
import { useVesselSpecs } from './hooks/useVesselSpecs';
import { estimateShipEmissions, isShipInPort, priorityScore } from './emissions';
import { PORT_ZONES } from './data/portZones';
import type { EmissionEstimate, Ship } from './types';
import { getShipCategory, SHIP_CATEGORY_LABELS } from './utils';

export function App() {
  const [apiKey, setApiKey] = useState<string | null>(
    () => localStorage.getItem('aisstream_key'),
  );
  const [mode, setMode] = useState<'live' | 'demo'>(
    () => (localStorage.getItem('aisstream_key') ? 'live' : 'demo'),
  );
  const [showApiPrompt, setShowApiPrompt] = useState(false);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [selectedPortCode, setSelectedPortCode] = useState(PORT_ZONES[0].code);

  const { ships: liveShips, connected, messageCount, error } = useAISStream(
    mode === 'live' ? apiKey : null,
  );
  const { ships: demoShips } = useDemoShips(mode === 'demo');
  const { specsByImo } = useVesselSpecs(mode === 'live' ? liveShips : demoShips);

  const ships = mode === 'live' ? liveShips : demoShips;
  const selectedPort = useMemo(
    () => PORT_ZONES.find((p) => p.code === selectedPortCode) || PORT_ZONES[0],
    [selectedPortCode],
  );

  const emissionsByMmsi = useMemo(() => {
    const estimates = new Map<number, EmissionEstimate>();
    for (const ship of ships.values()) {
      estimates.set(ship.mmsi, estimateShipEmissions(ship, specsByImo.get(ship.imo)));
    }
    return estimates;
  }, [ships, specsByImo]);

  const fleetTotals = useMemo(() => {
    let total = 0;
    for (const estimate of emissionsByMmsi.values()) total += estimate.co2TonnesPerHour;
    return { hourlyTonnes: total };
  }, [emissionsByMmsi]);

  const portSummary = useMemo(() => {
    const inPort = Array.from(ships.values()).filter((ship) => isShipInPort(ship, selectedPort));
    const specBackedCount = inPort.filter((ship) => specsByImo.has(ship.imo)).length;

    const topEmitters = inPort
      .map((ship) => {
        const estimate = emissionsByMmsi.get(ship.mmsi)!;
        return {
          mmsi: ship.mmsi,
          shipName: ship.name || 'Unknown Vessel',
          categoryLabel: SHIP_CATEGORY_LABELS[getShipCategory(ship.shipType)],
          co2TonnesPerHour: estimate.co2TonnesPerHour,
          confidence: estimate.confidence,
          priorityScore: priorityScore(estimate),
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 8);

    const totalHourlyTonnes = inPort.reduce((sum, ship) => {
      const estimate = emissionsByMmsi.get(ship.mmsi);
      return sum + (estimate?.co2TonnesPerHour || 0);
    }, 0);

    return {
      vesselCount: inPort.length,
      specBackedCount,
      totalHourlyTonnes,
      topEmitters,
    };
  }, [ships, selectedPort, emissionsByMmsi, specsByImo]);

  const handleGoLive = useCallback(() => {
    if (apiKey) {
      setMode('live');
    } else {
      setShowApiPrompt(true);
    }
  }, [apiKey]);

  const handleGoDemo = useCallback(() => {
    setMode('demo');
  }, []);

  const handleApiKey = useCallback((key: string) => {
    localStorage.setItem('aisstream_key', key);
    setApiKey(key);
    setMode('live');
    setShowApiPrompt(false);
  }, []);

  const handleCancelPrompt = useCallback(() => {
    setShowApiPrompt(false);
  }, []);

  return (
    <>
      <ShipMap
        ships={ships}
        selectedShip={selectedShip}
        onSelectShip={setSelectedShip}
      />

      <HUD
        shipCount={ships.size}
        connected={connected}
        mode={mode}
        messageCount={messageCount}
        error={error}
        selectedPortCode={selectedPort.code}
        ports={PORT_ZONES}
        fleetHourlyTonnes={fleetTotals.hourlyTonnes}
        portSummary={portSummary}
        onSelectPort={setSelectedPortCode}
        onGoLive={handleGoLive}
        onGoDemo={handleGoDemo}
      />

      <ShipPanel
        ship={selectedShip}
        emission={selectedShip ? emissionsByMmsi.get(selectedShip.mmsi) || null : null}
        onClose={() => setSelectedShip(null)}
      />

      {showApiPrompt && (
        <ApiKeyModal onSubmit={handleApiKey} onCancel={handleCancelPrompt} />
      )}
    </>
  );
}
