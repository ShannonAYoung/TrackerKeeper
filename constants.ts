import { DeviceSettings } from './types';

export const DEFAULT_SETTINGS: DeviceSettings = {
  maxRangeMeters: 50, // Default 50 meters
  updateIntervalMinutes: 1, // Default 1 minute
  mapApiKey: '' // User must provide or code must be updated
};

export const MOCK_WATCH_OFFSET = 0.0005; // Roughly 50-60 meters offset for simulation
export const ROYAL_BLUE_HEX = '#4169E1'; // Standard Royal Blue
