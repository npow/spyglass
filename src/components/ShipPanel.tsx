import type { EmissionEstimate, Ship } from '../types';
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
  emission: EmissionEstimate | null;
  onClose: () => void;
}

export function ShipPanel({ ship, emission, onClose }: ShipPanelProps) {
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

              {/* Emissions */}
              <div className="detail-section">
                <h3>Emissions Estimate</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">CO2 per hour</span>
                    <span className="info-hint" title="Estimated tonnes of CO2 emitted by this vessel per hour using current AIS speed/status and vessel specs/assumptions.">
                      i
                    </span>
                    <span className="value">
                      {emission ? `${emission.co2TonnesPerHour.toFixed(2)} t` : <span className="dim">N/A</span>}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Confidence</span>
                    <span className="info-hint" title="Heuristic confidence score (0-100) based on AIS freshness and data completeness; this is not a statistical confidence interval.">
                      i
                    </span>
                    <span className="value">
                      {emission ? `${emission.confidence}%` : <span className="dim">N/A</span>}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Fuel assumption</span>
                    <span className="value">
                      {emission ? emission.fuelType : <span className="dim">N/A</span>}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Engine load factor</span>
                    <span className="info-hint" title="Estimated fraction of main engine utilization derived from speed-cubed behavior and navigation status.">
                      i
                    </span>
                    <span className="value">
                      {emission ? `${(emission.loadFactor * 100).toFixed(1)}%` : <span className="dim">N/A</span>}
                    </span>
                  </div>
                  <div className="detail-item full">
                    <span className="label">Main / Aux power</span>
                    <span className="info-hint" title="Estimated installed power ratings in kilowatts (kW): main propulsion engine and auxiliary engines.">
                      i
                    </span>
                    <span className="value">
                      {emission
                        ? `${Math.round(emission.estimatedMainPowerKw).toLocaleString()} kW / ${Math.round(emission.estimatedAuxPowerKw).toLocaleString()} kW`
                        : <span className="dim">N/A</span>}
                    </span>
                  </div>
                  <div className="detail-item full">
                    <span className="label">Assumptions</span>
                    <span className="value assumptions">
                      {emission ? emission.assumptions.join(' | ') : <span className="dim">N/A</span>}
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
