import { SHIP_COLORS, SHIP_CATEGORY_LABELS } from '../utils';
import type { ShipCategory } from '../types';

interface HUDProps {
  shipCount: number;
  connected: boolean;
  mode: 'live' | 'demo';
  messageCount: number;
  error: string | null;
  onGoLive: () => void;
  onGoDemo: () => void;
}

export function HUD({ shipCount, connected, mode, messageCount, error, onGoLive, onGoDemo }: HUDProps) {
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
