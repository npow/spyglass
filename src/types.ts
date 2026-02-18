export interface Ship {
  mmsi: number;
  name: string;
  shipType: number;
  latitude: number;
  longitude: number;
  sog: number;
  cog: number;
  heading: number;
  navStatus: number;
  destination: string;
  callSign: string;
  imo: number;
  draught: number;
  eta: string;
  dimA: number;
  dimB: number;
  dimC: number;
  dimD: number;
  lastUpdate: number;
}

export type ShipCategory =
  | 'cargo'
  | 'tanker'
  | 'passenger'
  | 'fishing'
  | 'military'
  | 'tug'
  | 'sailing'
  | 'highspeed'
  | 'other';

export interface AISStreamMessage {
  MessageType: string;
  MetaData: {
    MMSI: number;
    MMSI_String: string;
    ShipName: string;
    latitude: number;
    longitude: number;
    time_utc: string;
  };
  Message: {
    PositionReport?: AISPositionReport;
    StandardClassBPositionReport?: AISPositionReport;
    ShipStaticData?: AISStaticData;
  };
}

export interface AISPositionReport {
  UserID: number;
  NavigationStatus: number;
  RateOfTurn: number;
  Sog: number;
  PositionAccuracy: boolean;
  Longitude: number;
  Latitude: number;
  Cog: number;
  TrueHeading: number;
  Timestamp: number;
  SpecialManoeuvreIndicator: number;
  Spare: number;
  Raim: boolean;
}

export interface AISStaticData {
  UserID: number;
  AisVersion: number;
  ImoNumber: number;
  CallSign: string;
  Name: string;
  Type: number;
  Dimension: { A: number; B: number; C: number; D: number };
  FixType: number;
  Eta: { Month: number; Day: number; Hour: number; Minute: number };
  MaximumStaticDraught: number;
  Destination: string;
  Dte: boolean;
}
