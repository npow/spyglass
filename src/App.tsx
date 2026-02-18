import { useState, useCallback } from 'react';
import { ShipMap } from './components/ShipMap';
import { ShipPanel } from './components/ShipPanel';
import { HUD } from './components/HUD';
import { ApiKeyModal } from './components/ApiKeyModal';
import { useAISStream } from './hooks/useAISStream';
import { useDemoShips } from './hooks/useDemoShips';
import type { Ship } from './types';

export function App() {
  const [apiKey, setApiKey] = useState<string | null>(
    () => localStorage.getItem('aisstream_key'),
  );
  const [mode, setMode] = useState<'live' | 'demo'>(
    () => (localStorage.getItem('aisstream_key') ? 'live' : 'demo'),
  );
  const [showApiPrompt, setShowApiPrompt] = useState(false);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);

  const { ships: liveShips, connected, messageCount, error } = useAISStream(
    mode === 'live' ? apiKey : null,
  );
  const { ships: demoShips } = useDemoShips(mode === 'demo');

  const ships = mode === 'live' ? liveShips : demoShips;

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
        onGoLive={handleGoLive}
        onGoDemo={handleGoDemo}
      />

      <ShipPanel ship={selectedShip} onClose={() => setSelectedShip(null)} />

      {showApiPrompt && (
        <ApiKeyModal onSubmit={handleApiKey} onCancel={handleCancelPrompt} />
      )}
    </>
  );
}
