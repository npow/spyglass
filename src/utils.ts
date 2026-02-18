import type { ShipCategory } from './types';

export function getShipCategory(shipType: number): ShipCategory {
  if (shipType >= 70 && shipType <= 79) return 'cargo';
  if (shipType >= 80 && shipType <= 89) return 'tanker';
  if (shipType >= 60 && shipType <= 69) return 'passenger';
  if (shipType === 30) return 'fishing';
  if (shipType === 35 || shipType === 55) return 'military';
  if (shipType >= 50 && shipType <= 53) return 'tug';
  if (shipType === 36 || shipType === 37) return 'sailing';
  if (shipType >= 40 && shipType <= 49) return 'highspeed';
  return 'other';
}

export const SHIP_COLORS: Record<ShipCategory, string> = {
  cargo: '#4ade80',
  tanker: '#60a5fa',
  passenger: '#f97316',
  fishing: '#facc15',
  military: '#ef4444',
  tug: '#a855f7',
  sailing: '#06b6d4',
  highspeed: '#f472b6',
  other: '#94a3b8',
};

export const SHIP_CATEGORY_LABELS: Record<ShipCategory, string> = {
  cargo: 'Cargo',
  tanker: 'Tanker',
  passenger: 'Passenger',
  fishing: 'Fishing',
  military: 'Military',
  tug: 'Tug / Pilot',
  sailing: 'Sailing / Pleasure',
  highspeed: 'High Speed',
  other: 'Other',
};

export const NAV_STATUS_LABELS: Record<number, string> = {
  0: 'Under way using engine',
  1: 'At anchor',
  2: 'Not under command',
  3: 'Restricted manoeuvrability',
  4: 'Constrained by draught',
  5: 'Moored',
  6: 'Aground',
  7: 'Engaged in fishing',
  8: 'Under way sailing',
  9: 'Reserved (HSC)',
  10: 'Reserved (WIG)',
  11: 'Towing astern',
  12: 'Pushing ahead',
  14: 'AIS-SART / MOB / EPIRB',
  15: 'Undefined',
};

const MID_COUNTRIES: Record<number, string> = {
  201: 'Albania', 205: 'Belgium', 209: 'Cyprus', 211: 'Germany',
  212: 'Cyprus', 215: 'Malta', 219: 'Denmark', 220: 'Denmark',
  224: 'Spain', 225: 'Spain', 226: 'France', 227: 'France',
  228: 'France', 229: 'Malta', 230: 'Finland', 231: 'Faroe Is.',
  232: 'UK', 233: 'UK', 234: 'UK', 235: 'UK',
  236: 'Gibraltar', 237: 'Greece', 238: 'Croatia', 239: 'Greece',
  240: 'Greece', 241: 'Greece', 242: 'Morocco', 244: 'Netherlands',
  245: 'Netherlands', 246: 'Netherlands', 247: 'Italy', 248: 'Malta',
  249: 'Malta', 250: 'Ireland', 251: 'Iceland', 255: 'Portugal',
  256: 'Malta', 257: 'Norway', 258: 'Norway', 259: 'Norway',
  261: 'Poland', 263: 'Portugal', 265: 'Sweden', 266: 'Sweden',
  269: 'Switzerland', 271: 'Turkey', 272: 'Ukraine', 273: 'Russia',
  275: 'Latvia', 276: 'Estonia', 277: 'Lithuania', 278: 'Slovenia',
  304: 'Antigua', 305: 'Antigua', 306: 'Curacao', 307: 'Aruba',
  308: 'Bahamas', 309: 'Bahamas', 310: 'Bermuda', 311: 'Bahamas',
  312: 'Belize', 314: 'Barbados', 316: 'Canada',
  319: 'Cayman Is.', 338: 'USA', 339: 'Jamaica',
  341: 'St Kitts', 345: 'Mexico', 351: 'Panama', 352: 'Panama',
  353: 'Panama', 354: 'Panama', 355: 'Panama', 356: 'Panama',
  357: 'Panama', 366: 'USA', 367: 'USA', 368: 'USA', 369: 'USA',
  370: 'Panama', 371: 'Panama', 372: 'Panama', 373: 'Panama',
  374: 'Panama', 375: 'St Vincent', 376: 'BVI', 377: 'USVI',
  378: 'Venezuela', 403: 'Saudi Arabia', 405: 'Bangladesh',
  410: 'Bhutan', 412: 'China', 413: 'China', 414: 'China',
  416: 'Taiwan', 417: 'Sri Lanka', 419: 'India',
  422: 'Iran', 425: 'Iraq', 428: 'Israel',
  431: 'Japan', 432: 'Japan', 440: 'S. Korea', 441: 'S. Korea',
  445: 'N. Korea', 447: 'Kuwait', 450: 'Lebanon',
  453: 'Macao', 457: 'Mongolia', 461: 'Oman',
  463: 'Pakistan', 466: 'Qatar', 468: 'Syria',
  470: 'UAE', 471: 'UAE', 477: 'Hong Kong',
  503: 'Australia', 508: 'Brunei', 510: 'Micronesia',
  512: 'New Zealand', 514: 'Cambodia', 515: 'Cambodia',
  525: 'Indonesia', 533: 'Malaysia', 536: 'Marshall Is.',
  538: 'Marshall Is.', 548: 'Philippines', 553: 'Papua NG',
  557: 'Solomon Is.', 563: 'Singapore', 564: 'Singapore',
  565: 'Singapore', 566: 'Singapore', 567: 'Thailand',
  574: 'Vietnam', 576: 'Vanuatu',
  601: 'South Africa', 603: 'Angola', 605: 'Algeria',
  613: 'Cameroon', 619: "Cote d'Ivoire", 620: 'Comoros',
  621: 'Djibouti', 622: 'Egypt', 624: 'Ethiopia',
  625: 'Eritrea', 627: 'Ghana', 634: 'Kenya',
  636: 'Liberia', 637: 'Liberia', 647: 'Madagascar',
  649: 'Mali', 650: 'Mozambique', 654: 'Mauritania',
  657: 'Nigeria', 659: 'Namibia', 664: 'Seychelles',
  667: 'Sierra Leone', 668: 'Sao Tome', 672: 'Tunisia',
  674: 'Tanzania', 675: 'Uganda', 676: 'DR Congo',
  701: 'Argentina', 710: 'Brazil', 720: 'Bolivia',
  725: 'Chile', 730: 'Colombia', 735: 'Ecuador',
  740: 'Falkland Is.', 745: 'French Guiana',
  750: 'Guyana', 755: 'Paraguay', 760: 'Peru',
  765: 'Suriname', 770: 'Uruguay', 775: 'Venezuela',
};

export function getCountryFromMMSI(mmsi: number): string {
  const mid = Math.floor(mmsi / 1000000);
  return MID_COUNTRIES[mid] || `MID-${mid}`;
}

export function formatCoordinate(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}\u00b0 ${latDir}, ${Math.abs(lon).toFixed(4)}\u00b0 ${lonDir}`;
}

export function formatSpeed(knots: number): string {
  if (knots >= 102) return 'N/A';
  return `${knots.toFixed(1)} kn`;
}

export function formatHeading(degrees: number): string {
  if (degrees === 511 || degrees >= 360) return 'N/A';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const i = Math.round(degrees / 22.5) % 16;
  return `${degrees.toFixed(0)}\u00b0 ${dirs[i]}`;
}

export function formatDimensions(a: number, b: number, c: number, d: number): string {
  if (a === 0 && b === 0 && c === 0 && d === 0) return 'N/A';
  const length = a + b;
  const beam = c + d;
  return `${length}m \u00d7 ${beam}m`;
}

export const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  name: 'Dark Maritime',
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: ['https://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png'],
      tileSize: 256,
      attribution: '\u00a9 CARTO \u00a9 OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#070b14' },
    },
    {
      id: 'carto-dark',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};
