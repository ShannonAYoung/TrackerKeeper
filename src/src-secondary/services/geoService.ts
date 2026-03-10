import { Coordinates, Platform } from '../types';

const FALLBACK_COORDS: Coordinates = {
    latitude: 40.7128, // New York City (Default Fallback)
    longitude: -74.0060,
    altitude: 10,
    accuracy: 100
};

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * Returns distance in meters.
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coord1.latitude * Math.PI) / 180;
  const lat2 = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Detects the current platform based on User Agent.
 */
export const detectPlatform = (): Platform => {
  try {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return Platform.IOS;
    }
    if (/android/i.test(userAgent)) {
      return Platform.ANDROID;
    }
  } catch (e) {
    console.warn("Platform detection failed", e);
  }
  return Platform.UNKNOWN; 
};

/**
 * Simulates a Watch location based on the Phone location.
 * In a real React Native app, this would use WatchConnectivity/WearOS Data Layer.
 * For the web demo, we drift the watch slightly to test range.
 */
export const simulateWatchLocation = (phoneLoc: Coordinates, driftFactor: number): Coordinates => {
  // Simulate random drift
  const latOffset = (Math.random() - 0.5) * driftFactor;
  const lngOffset = (Math.random() - 0.5) * driftFactor;
  
  return {
    latitude: phoneLoc.latitude + latOffset,
    longitude: phoneLoc.longitude + lngOffset,
    altitude: phoneLoc.altitude ? phoneLoc.altitude + (Math.random() * 2) : 10,
    accuracy: 5
  };
};

export const getCurrentPosition = (): Promise<Coordinates> => {
    return new Promise((resolve) => {
        try {
            if (!navigator.geolocation) {
                console.warn('Geolocation not supported, using fallback coordinates.');
                resolve(FALLBACK_COORDS);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        altitude: position.coords.altitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    console.warn(`Geolocation error (${error.code}): ${error.message}. Using fallback coordinates.`);
                    resolve(FALLBACK_COORDS);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (e) {
            console.error("Synchronous Geolocation Error:", e);
            resolve(FALLBACK_COORDS);
        }
    });
};
