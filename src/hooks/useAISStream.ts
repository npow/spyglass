import { useEffect, useRef, useState } from 'react';
import type { Ship, AISStreamMessage } from '../types';

const WS_URL = import.meta.env.DEV
  ? 'ws://localhost:9876'               // local proxy strips Origin header
  : 'wss://stream.aisstream.io/v0/stream';
const MAX_RETRIES = 5;
const BASE_DELAY = 2000;

export function useAISStream(apiKey: string | null) {
  const [ships, setShips] = useState<Map<number, Ship>>(new Map());
  const [connected, setConnected] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const bufferRef = useRef<Map<number, Partial<Ship>>>(new Map());
  const countRef = useRef(0);

  useEffect(() => {
    if (!apiKey) return;

    let ws: WebSocket | null = null;
    let flushInterval: ReturnType<typeof setInterval>;
    let retryCount = 0;
    let retryTimeout: ReturnType<typeof setTimeout>;
    let disposed = false;

    function connect() {
      if (disposed) return;

      setError(null);
      console.log('[AISStream] Connecting to', WS_URL);
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[AISStream] Connected, sending subscription');
        retryCount = 0;
        ws!.send(JSON.stringify({
          APIKey: apiKey,
          BoundingBoxes: [[[-90, -180], [90, 180]]],
          FilterMessageTypes: ['PositionReport', 'ShipStaticData', 'StandardClassBPositionReport'],
        }));
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg: AISStreamMessage = JSON.parse(event.data);
          const mmsi = msg.MetaData?.MMSI;
          if (!mmsi || mmsi <= 0) return;

          const existing = bufferRef.current.get(mmsi) || {};

          if (msg.Message.PositionReport || msg.Message.StandardClassBPositionReport) {
            const pos = msg.Message.PositionReport || msg.Message.StandardClassBPositionReport!;
            if (pos.Latitude === 91 || pos.Longitude === 181) return;
            if (pos.Latitude === 0 && pos.Longitude === 0) return;

            bufferRef.current.set(mmsi, {
              ...existing,
              mmsi,
              name: existing.name || msg.MetaData.ShipName?.trim() || '',
              latitude: pos.Latitude,
              longitude: pos.Longitude,
              sog: pos.Sog,
              cog: pos.Cog,
              heading: pos.TrueHeading,
              navStatus: (pos as Record<string, unknown>).NavigationalStatus as number ?? pos.NavigationStatus,
              lastUpdate: Date.now(),
            });
          }

          if (msg.Message.ShipStaticData) {
            const sd = msg.Message.ShipStaticData;
            const eta = sd.Eta;
            const etaStr = eta?.Month > 0
              ? `${String(eta.Month).padStart(2, '0')}/${String(eta.Day).padStart(2, '0')} ${String(eta.Hour).padStart(2, '0')}:${String(eta.Minute).padStart(2, '0')}`
              : '';

            bufferRef.current.set(mmsi, {
              ...existing,
              mmsi,
              name: sd.Name?.trim() || existing.name || msg.MetaData.ShipName?.trim() || '',
              shipType: sd.Type,
              callSign: sd.CallSign?.trim() || '',
              imo: sd.ImoNumber,
              destination: sd.Destination?.trim() || '',
              draught: sd.MaximumStaticDraught,
              eta: etaStr,
              dimA: sd.Dimension?.A ?? 0,
              dimB: sd.Dimension?.B ?? 0,
              dimC: sd.Dimension?.C ?? 0,
              dimD: sd.Dimension?.D ?? 0,
              latitude: existing.latitude ?? msg.MetaData.latitude,
              longitude: existing.longitude ?? msg.MetaData.longitude,
              lastUpdate: Date.now(),
            });
          }

          countRef.current++;
        } catch (e) {
          console.warn('[AISStream] Failed to process message:', e);
        }
      };

      ws.onclose = (event) => {
        console.log('[AISStream] Closed, code:', event.code, 'reason:', event.reason);
        setConnected(false);

        if (disposed) return;

        if (event.code !== 1000 && retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = BASE_DELAY * Math.pow(2, retryCount - 1);
          setError(`Connection lost. Reconnecting in ${Math.round(delay / 1000)}s... (attempt ${retryCount}/${MAX_RETRIES})`);
          console.log(`[AISStream] Reconnecting in ${delay}ms (attempt ${retryCount})`);
          retryTimeout = setTimeout(connect, delay);
        } else if (retryCount >= MAX_RETRIES) {
          setError('Connection failed after multiple attempts. Check your API key or try again later.');
        }
      };

      ws.onerror = (event) => {
        console.error('[AISStream] WebSocket error:', event);
      };
    }

    connect();

    flushInterval = setInterval(() => {
      if (bufferRef.current.size > 0) {
        const updates = new Map(bufferRef.current);
        bufferRef.current.clear();

        setShips((prev) => {
          const next = new Map(prev);
          for (const [mmsi, partial] of updates) {
            const old = next.get(mmsi);
            const ship: Ship = {
              mmsi,
              name: partial.name || old?.name || '',
              shipType: partial.shipType ?? old?.shipType ?? 0,
              latitude: partial.latitude ?? old?.latitude ?? 0,
              longitude: partial.longitude ?? old?.longitude ?? 0,
              sog: partial.sog ?? old?.sog ?? 0,
              cog: partial.cog ?? old?.cog ?? 0,
              heading: partial.heading ?? old?.heading ?? 511,
              navStatus: partial.navStatus ?? old?.navStatus ?? 15,
              destination: partial.destination ?? old?.destination ?? '',
              callSign: partial.callSign ?? old?.callSign ?? '',
              imo: partial.imo ?? old?.imo ?? 0,
              draught: partial.draught ?? old?.draught ?? 0,
              eta: partial.eta ?? old?.eta ?? '',
              dimA: partial.dimA ?? old?.dimA ?? 0,
              dimB: partial.dimB ?? old?.dimB ?? 0,
              dimC: partial.dimC ?? old?.dimC ?? 0,
              dimD: partial.dimD ?? old?.dimD ?? 0,
              lastUpdate: partial.lastUpdate ?? Date.now(),
            };
            if (ship.latitude !== 0 || ship.longitude !== 0) {
              next.set(mmsi, ship);
            }
          }
          return next;
        });

        setMessageCount(countRef.current);
      }
    }, 500);

    return () => {
      disposed = true;
      clearTimeout(retryTimeout);
      clearInterval(flushInterval);
      ws?.close();
    };
  }, [apiKey]);

  return { ships, connected, messageCount, error };
}
