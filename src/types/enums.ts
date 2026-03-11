export enum Platform {
  UNKNOWN = "UNKNOWN",
  IOS = "iOS",
  ANDROID = "Android"
}

export enum ConnectionStatus {
  DISCONNECTED = 'Disconnected',
  SEARCHING = 'Searching...',
  CONNECTED = 'Connected'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy?: number;
}




export interface DeviceSettings {
  maxRangeMeters: number;
  updateIntervalMinutes: number;
  mapApiKey: string;
}

export interface DeviceState {
  platform: Platform;
  deviceName?: string;
  status: ConnectionStatus;
  phoneLocation: Coordinates | null;
  watchLocation: Coordinates | null;
  lastUpdated: number;
  distance: number | null;
  isOutOfRange: boolean;
}