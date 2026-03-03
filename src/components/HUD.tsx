import { useState } from 'react';
import { SHIP_COLORS, SHIP_CATEGORY_LABELS } from '../utils';
import type { PortZone, ShipCategory } from '../types';

interface PortEmitter {
  mmsi: number;
  shipName: string;
  categoryLabel: string;
  co2TonnesPerHour: number;
  confidence: number;
  priorityScore: number;
}

interface PortSummary {
  vesselCount: number;
  specBackedCount: number;
  totalHourlyTonnes: number;
  topEmitters: PortEmitter[];
}

interface HUDProps {
  shipCount: number;
  connected: boolean;
  mode: 'live' | 'demo';
  messageCount: number;
  error: string | null;
  selectedPortCode: string;
  ports: PortZone[];
  fleetHourlyTonnes: number;
  portSummary: PortSummary;
  onSelectPort: (portCode: string) => void;
  onGoLive: () => void;
  onGoDemo: () => void;
}

export function HUD({
  shipCount,
  connected,
  mode,
  messageCount,
  error,
  selectedPortCode,
  ports,
  fleetHourlyTonnes,
  portSummary,
  onSelectPort,
  onGoLive,
  onGoDemo,
}: HUDProps) {
  const [portOversightOpen, setPortOversightOpen] = useState(false);

  return (
    <div className="hud">
      {/* Stats bar */}
      <div className="stats-bar">
        <span className="logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 20a2 2 0 0 0 2-2V8l4 1 4-2 4 2 4-1v10a2 2 0 0 1-2 2Z"/>
            <path d="M6 15l4-2 4 2 4-2"/>
          </svg>
          Spyglass
        </span>
        <span className="divider" />

        <span className="stat">
          <span
            className={`status-dot ${mode === 'demo' ? 'demo' : connected ? 'connected' : 'disconnected'}`}
          />
          <span>{mode === 'demo' ? 'Demo' : connected ? 'Live' : 'Offline'}</span>
        </span>

        <span className="stat">
          Vessels <span className="value">{shipCount.toLocaleString()}</span>
        </span>

        {mode === 'live' && (
          <span className="stat">
            Messages <span className="value">{messageCount.toLocaleString()}</span>
          </span>
        )}

        <span className="stat">
          Fleet CO2/h
          <span className="info-hint" title="Estimated tonnes of CO2 emitted per hour across all tracked vessels.">
            i
          </span>
          <span className="value">{fleetHourlyTonnes.toFixed(1)}t</span>
        </span>
      </div>

      {error && (
        <div className="stats-bar" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: 12 }}>
          <span style={{ color: '#ef4444' }}>{error}</span>
        </div>
      )}

      {/* Legend */}
      <div className="legend">
        {(Object.entries(SHIP_CATEGORY_LABELS) as [ShipCategory, string][]).map(([key, label]) => (
          <span className="legend-item" key={key}>
            <span className="legend-dot" style={{ background: SHIP_COLORS[key] }} />
            {label}
          </span>
        ))}
      </div>

      {!portOversightOpen && (
        <button className="open-port-btn" onClick={() => setPortOversightOpen(true)}>
          Open Port Oversight
        </button>
      )}

      {portOversightOpen && (
        <div className="emissions-card">
          <div className="emissions-card-header">
            <div>
              <h4>Port Oversight</h4>
              <p>Transparent vessel-level estimation</p>
            </div>
            <button
              className="panel-close-btn"
              onClick={() => setPortOversightOpen(false)}
              aria-label="Close port oversight"
              title="Close"
            >
              \u00d7
            </button>
          </div>

            <select
              value={selectedPortCode}
              onChange={(event) => onSelectPort(event.target.value)}
            >
              {ports.map((port) => (
                <option key={port.code} value={port.code}>
                  {port.name}
                </option>
              ))}
            </select>

            <div className="emissions-summary-grid">
              <div>
                <span className="label">In-port vessels</span>
                <span className="value">{portSummary.vesselCount}</span>
              </div>
              <div>
                <span className="label">Spec-backed</span>
                <span className="value">{portSummary.specBackedCount}</span>
              </div>
              <div>
                <span className="label">Estimated CO2/h</span>
                <span className="info-hint" title="Estimated tonnes of CO2 emitted per hour by vessels currently inside this selected port zone.">
                  i
                </span>
                <span className="value">{portSummary.totalHourlyTonnes.toFixed(2)} t</span>
              </div>
            </div>

            <div className="emitter-list">
              {portSummary.topEmitters.length === 0 && (
                <div className="emitter-empty">No vessels currently in selected zone.</div>
              )}
              {portSummary.topEmitters.map((ship) => (
                <div className="emitter-item" key={ship.mmsi}>
                  <div className="emitter-title">
                    <span>{ship.shipName}</span>
                    <span>{ship.co2TonnesPerHour.toFixed(2)} t/h</span>
                  </div>
                  <div className="emitter-meta">
                    <span>{ship.categoryLabel}</span>
                    <span title="Priority = CO2/h adjusted upward for lower-confidence estimates to support triage.">
                      Priority {ship.priorityScore.toFixed(2)}
                    </span>
                    <span title="Heuristic data-quality score based on AIS completeness and freshness.">
                      Confidence {ship.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
        </div>
      )}

      {/* Mode switch */}
      {mode === 'demo' ? (
        <button className="mode-btn" onClick={onGoLive}>
          Switch to Live Data
        </button>
      ) : (
        <button className="mode-btn" onClick={onGoDemo}>
          Switch to Demo
        </button>
      )}
    </div>
  );
}
