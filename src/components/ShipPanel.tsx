import type { Ship } from '../types';
import {
  getShipCategory,
  SHIP_COLORS,
  SHIP_CATEGORY_LABELS,
  NAV_STATUS_LABELS,
  getCountryFromMMSI,
  formatCoordinate,
  formatSpeed,
  formatHeading,
  formatDimensions,
} from '../utils';

interface ShipPanelProps {
  ship: Ship | null;
  onClose: () => void;
}

export function ShipPanel({ ship, onClose }: ShipPanelProps) {
  const isOpen = ship !== null;
  const category = ship ? getShipCategory(ship.shipType) : 'other';
  const color = SHIP_COLORS[category];

  return (
    <div className={`ship-panel-overlay ${isOpen ? 'open' : ''}`}>
      <div className="ship-panel-backdrop" onClick={onClose} />
      <div className="ship-panel">
        {ship && (
          <>
            <div className="ship-panel-header">
              <div>
                <h2>{ship.name || 'Unknown Vessel'}</h2>
                <span
                  className="ship-type-badge"
                  style={{
                    background: `${color}18`,
                    color: color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {SHIP_CATEGORY_LABELS[category]}
                </span>
              </div>
              <button className="ship-panel-close" onClick={onClose}>
                &#x2715;
              </button>
            </div>

            <div className="ship-panel-body">
              {/* Identity */}
              <div className="detail-section">
                <h3>Identity</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">MMSI</span>
                    <span className="value">{ship.mmsi}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">IMO</span>
                    <span className="value">{ship.imo || <span className="dim">N/A</span>}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Call Sign</span>
                    <span className="value">{ship.callSign || <span className="dim">N/A</span>}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Flag</span>
                    <span className="value">{getCountryFromMMSI(ship.mmsi)}</span>
                  </div>
                </div>
              </div>

              {/* Position */}
              <div className="detail-section">
                <h3>Position</h3>
                <div className="detail-grid">
                  <div className="detail-item full">
                    <span className="label">Coordinates</span>
                    <span className="value">{formatCoordinate(ship.latitude, ship.longitude)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Speed</span>
                    <span className="value">{formatSpeed(ship.sog)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Course</span>
                    <span className="value">{formatHeading(ship.cog)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Heading</span>
                    <span className="value">{formatHeading(ship.heading)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Nav Status</span>
                    <span className="value" style={{ fontSize: 12 }}>
                      {NAV_STATUS_LABELS[ship.navStatus] || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Voyage */}
              <div className="detail-section">
                <h3>Voyage</h3>
                <div className="detail-grid">
                  <div className="detail-item full">
                    <span className="label">Destination</span>
                    <span className="value">{ship.destination || <span className="dim">N/A</span>}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">ETA</span>
                    <span className="value">{ship.eta || <span className="dim">N/A</span>}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Draught</span>
                    <span className="value">{ship.draught ? `${ship.draught}m` : <span className="dim">N/A</span>}</span>
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="detail-section">
                <h3>Vessel</h3>
                <div className="detail-grid">
                  <div className="detail-item full">
                    <span className="label">Dimensions (L x B)</span>
                    <span className="value">{formatDimensions(ship.dimA, ship.dimB, ship.dimC, ship.dimD)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Type Code</span>
                    <span className="value">{ship.shipType || <span className="dim">N/A</span>}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Update</span>
                    <span className="value" style={{ fontSize: 11 }}>
                      {new Date(ship.lastUpdate).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
