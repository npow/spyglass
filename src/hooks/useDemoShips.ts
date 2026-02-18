import { useEffect, useRef, useState } from 'react';
import type { Ship } from '../types';

// Major shipping lane waypoints: [lat, lon, spread]
const SHIPPING_LANES: [number, number, number][][] = [
  // English Channel
  [[50.5, -2, 0.3], [51.0, 1.5, 0.3]],
  // North Sea
  [[52.5, 3, 0.5], [56, 5, 0.5], [58, 6, 0.5]],
  // Mediterranean
  [[36, -5, 0.5], [37, 5, 0.5], [35, 15, 0.5], [34, 25, 0.5], [33, 32, 0.3]],
  // Suez - Red Sea - Gulf of Aden
  [[30, 32.5, 0.2], [27, 34, 0.2], [22, 38, 0.3], [14, 43, 0.3], [12, 45, 0.3]],
  // Persian Gulf
  [[26.5, 50, 0.3], [25, 53, 0.3], [24, 56, 0.3]],
  // Indian Ocean
  [[10, 55, 1], [5, 70, 1], [2, 80, 1], [0, 90, 1]],
  // Strait of Malacca
  [[3, 100, 0.3], [1.5, 103, 0.2], [1.2, 104, 0.2]],
  // South China Sea
  [[2, 106, 0.5], [8, 110, 0.5], [15, 112, 0.5], [20, 114, 0.5]],
  // East China Sea / Japan
  [[25, 120, 0.5], [30, 122, 0.5], [33, 130, 0.5], [35, 135, 0.5], [35, 140, 0.5]],
  // Korea Strait
  [[34, 128, 0.3], [35, 129.5, 0.3], [36, 130, 0.3]],
  // North Pacific
  [[35, 145, 1], [40, 160, 1], [42, 175, 1], [45, -170, 1], [47, -155, 1], [48, -140, 1], [48, -128, 0.5]],
  // US West Coast
  [[48, -125, 0.3], [45, -124.5, 0.3], [38, -123, 0.3], [34, -118.5, 0.3]],
  // Panama approach (Pacific)
  [[32, -117, 0.5], [25, -110, 0.5], [15, -100, 0.5], [9, -80, 0.3]],
  // Gulf of Mexico
  [[25, -90, 0.5], [28, -88, 0.5], [29, -85, 0.3]],
  // US East Coast
  [[25, -80, 0.3], [30, -79, 0.3], [35, -75, 0.3], [40, -73, 0.3], [42, -70, 0.3]],
  // North Atlantic
  [[42, -65, 1], [45, -50, 1], [48, -30, 1], [50, -10, 1]],
  // Caribbean
  [[10, -62, 0.5], [12, -68, 0.5], [15, -75, 0.5], [18, -78, 0.5]],
  // West Africa
  [[5, -2, 0.5], [2, 5, 0.5], [-5, 10, 0.5], [-15, 12, 0.5]],
  // Cape of Good Hope
  [[-25, 15, 0.5], [-34, 18, 0.3], [-35, 20, 0.3], [-30, 32, 0.5]],
  // Baltic
  [[55, 12, 0.3], [56, 14, 0.3], [58, 18, 0.3], [59.5, 22, 0.3]],
  // South Atlantic
  [[-35, -55, 1], [-25, -40, 1], [-15, -30, 1], [-5, -15, 1]],
  // Australia
  [[-34, 151, 0.3], [-38, 145, 0.3], [-35, 137, 0.5], [-32, 115, 0.3]],
];

const SHIP_TYPES_WEIGHTED = [
  ...Array(40).fill(70), // cargo
  ...Array(25).fill(80), // tanker
  ...Array(5).fill(60),  // passenger
  ...Array(10).fill(30), // fishing
  ...Array(3).fill(52),  // tug
  ...Array(5).fill(36),  // sailing
  ...Array(2).fill(40),  // highspeed
  ...Array(10).fill(0),  // other
];

const NAME_PREFIXES: Record<number, string[]> = {
  70: ['MSC', 'MAERSK', 'CMA CGM', 'COSCO', 'EVER', 'ONE', 'HAPAG', 'OOCL', 'ZIM', 'YANG MING'],
  80: ['NORDIC', 'STENA', 'CRUDE', 'PACIFIC', 'ATLANTIC', 'BW', 'TORM', 'EURONAV', 'HAFNIA', 'SCORPIO'],
  60: ['CELEBRITY', 'ROYAL', 'CARNIVAL', 'COSTA', 'MSC', 'DISNEY', 'NORWEGIAN', 'PRINCESS'],
  30: ['FV', 'TRAWLER', 'SEINER', 'LONGLINER'],
  52: ['VB', 'SVITZER', 'BOLUDA', 'SMIT', 'FAIRPLAY'],
  36: ['SV', 'SY', 'KETCH', 'SCHOONER'],
  40: ['HSC', 'CAT', 'FASTCAT', 'CONDOR', 'FRED OLSEN'],
  0: ['VESSEL', 'BOAT', 'CRAFT'],
};

const SUFFIXES = [
  'FORTUNE', 'GLORY', 'SPIRIT', 'STAR', 'VOYAGER', 'PIONEER', 'AURORA',
  'DIAMOND', 'HORIZON', 'TITAN', 'MERIDIAN', 'PHOENIX', 'VENTURE',
  'HARMONY', 'LIBERTY', 'TRIUMPH', 'MAJESTY', 'EXPLORER', 'NAVIGATOR',
  'SENTINEL', 'GUARDIAN', 'ENDEAVOUR', 'RESOLVE', 'PROGRESS',
  'BREEZE', 'WAVE', 'CORAL', 'OCEAN', 'PEARL', 'EAGLE', 'FALCON',
];

const DESTINATIONS = [
  'SINGAPORE', 'SHANGHAI', 'ROTTERDAM', 'ANTWERP', 'HAMBURG', 'HONG KONG',
  'BUSAN', 'TOKYO', 'LOS ANGELES', 'LONG BEACH', 'NEW YORK', 'DUBAI',
  'PIRAEUS', 'VALENCIA', 'FELIXSTOWE', 'ALGECIRAS', 'TANJUNG PELEPAS',
  'PORT KLANG', 'COLOMBO', 'MUMBAI', 'JEDDAH', 'SUEZ CANAL', 'PANAMA',
  'SANTOS', 'DURBAN', 'CAPE TOWN', 'SYDNEY', 'MELBOURNE', 'YOKOHAMA',
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function generateShipName(shipType: number): string {
  const baseType = shipType >= 70 && shipType < 80 ? 70
    : shipType >= 80 && shipType < 90 ? 80
    : shipType >= 60 && shipType < 70 ? 60
    : shipType === 30 ? 30
    : shipType >= 50 && shipType <= 53 ? 52
    : shipType === 36 || shipType === 37 ? 36
    : shipType >= 40 && shipType < 50 ? 40
    : 0;
  const prefixes = NAME_PREFIXES[baseType] || NAME_PREFIXES[0];
  return `${randomItem(prefixes)} ${randomItem(SUFFIXES)}`;
}

function generateMMSI(): number {
  const mids = [211, 219, 226, 244, 247, 257, 265, 271, 308, 338, 351, 366, 412, 431, 440, 477, 538, 563, 636];
  const mid = randomItem(mids);
  return mid * 1000000 + randomInt(100000, 999999);
}

function generateShips(): Map<number, Ship> {
  const ships = new Map<number, Ship>();

  for (const lane of SHIPPING_LANES) {
    const shipsPerLane = Math.max(5, Math.floor(20 * Math.random() + 8));

    for (let i = 0; i < shipsPerLane; i++) {
      // Pick a random segment along the lane
      const segIdx = Math.floor(Math.random() * (lane.length - 1));
      const t = Math.random();
      const [lat1, lon1, spread1] = lane[segIdx];
      const [lat2, lon2, spread2] = lane[segIdx + 1];

      const spread = lerp(spread1, spread2, t);
      const lat = lerp(lat1, lat2, t) + (Math.random() - 0.5) * spread;
      const lon = lerp(lon1, lon2, t) + (Math.random() - 0.5) * spread;

      const shipType = randomItem(SHIP_TYPES_WEIGHTED);
      const mmsi = generateMMSI();
      const sog = shipType === 60 ? randomInt(15, 23) :
                  shipType === 30 ? randomInt(2, 8) :
                  shipType >= 40 && shipType < 50 ? randomInt(20, 35) :
                  randomInt(8, 18);

      // Heading roughly along the lane direction
      const dlat = lat2 - lat1;
      const dlon = lon2 - lon1;
      const baseCog = ((Math.atan2(dlon, dlat) * 180 / Math.PI) + 360) % 360;
      const cog = (baseCog + (Math.random() - 0.5) * 30 + 360) % 360;

      ships.set(mmsi, {
        mmsi,
        name: generateShipName(shipType),
        shipType,
        latitude: lat,
        longitude: lon,
        sog,
        cog,
        heading: Math.round(cog),
        navStatus: sog > 0.5 ? 0 : (Math.random() > 0.5 ? 1 : 5),
        destination: randomItem(DESTINATIONS),
        callSign: `${String.fromCharCode(65 + randomInt(0, 25))}${String.fromCharCode(65 + randomInt(0, 25))}${randomInt(1000, 9999)}`,
        imo: randomInt(9000000, 9999999),
        draught: +(Math.random() * 15 + 2).toFixed(1),
        eta: `${String(randomInt(1, 12)).padStart(2, '0')}/${String(randomInt(1, 28)).padStart(2, '0')} ${String(randomInt(0, 23)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`,
        dimA: randomInt(50, 200),
        dimB: randomInt(20, 100),
        dimC: randomInt(10, 30),
        dimD: randomInt(10, 30),
        lastUpdate: Date.now(),
      });
    }
  }

  return ships;
}

export function useDemoShips(active: boolean) {
  const [ships, setShips] = useState<Map<number, Ship>>(() => active ? generateShips() : new Map());
  const shipsRef = useRef(ships);
  shipsRef.current = ships;

  useEffect(() => {
    if (!active) return;

    if (shipsRef.current.size === 0) {
      const initial = generateShips();
      shipsRef.current = initial;
      setShips(initial);
    }

    // Animate ships every 2 seconds
    const interval = setInterval(() => {
      setShips((prev) => {
        const next = new Map(prev);
        for (const [mmsi, ship] of next) {
          if (ship.sog < 0.5) continue;

          // Move ship in heading direction
          const speedDegPerSec = (ship.sog * 1.852) / 111000; // rough deg/sec
          const dt = 2; // seconds
          const headRad = (ship.cog * Math.PI) / 180;
          const newLat = ship.latitude + Math.cos(headRad) * speedDegPerSec * dt;
          let newLon = ship.longitude + Math.sin(headRad) * speedDegPerSec * dt / Math.cos(ship.latitude * Math.PI / 180);

          // Wrap longitude
          if (newLon > 180) newLon -= 360;
          if (newLon < -180) newLon += 360;

          // Small random course variation
          const newCog = (ship.cog + (Math.random() - 0.5) * 2 + 360) % 360;

          next.set(mmsi, {
            ...ship,
            latitude: newLat,
            longitude: newLon,
            cog: newCog,
            heading: Math.round(newCog),
            lastUpdate: Date.now(),
          });
        }
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [active]);

  return { ships };
}
