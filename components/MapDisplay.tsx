import React, { useEffect, useRef, useState } from 'react';
import { Coordinates } from '../types';
import { MapPin, Map } from 'lucide-react';

interface MapDisplayProps {
  phoneLocation: Coordinates | null;
  watchLocation: Coordinates | null;
  apiKey: string;
  maxRange: number;
}

declare global {
  interface Window {
    google: any;
  }
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ phoneLocation, watchLocation, apiKey, maxRange }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<{phone?: any, watch?: any, circle?: any}>({});
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Google Maps Script dynamically
  useEffect(() => {
    if (!apiKey || scriptLoaded || (window.google && window.google.maps)) {
      if (window.google && window.google.maps) setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error("Failed to load Google Maps script");
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts before load (optional/complex)
    };
  }, [apiKey, scriptLoaded]);

  // Initialize Map
  useEffect(() => {
    if (scriptLoaded && mapRef.current && !mapInstance && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 18,
        center: { lat: 0, lng: 0 },
        mapTypeId: 'hybrid',
        disableDefaultUI: true,
        zoomControl: true,
      });
      setMapInstance(map);
    }
  }, [scriptLoaded, mapInstance]);

  // Update Markers and Circle
  useEffect(() => {
    if (!mapInstance || !phoneLocation || !window.google) return;

    const phoneLatLng = { lat: phoneLocation.latitude, lng: phoneLocation.longitude };
    const watchLatLng = watchLocation ? { lat: watchLocation.latitude, lng: watchLocation.longitude } : null;

    // --- Phone Marker ---
    if (!markers.phone) {
      const marker = new window.google.maps.Marker({
        position: phoneLatLng,
        map: mapInstance,
        title: "Phone (Host)",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#4169E1",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
        zIndex: 2
      });
      setMarkers(prev => ({ ...prev, phone: marker }));
    } else {
      markers.phone.setPosition(phoneLatLng);
    }

    // --- Watch Marker ---
    if (watchLatLng) {
      if (!markers.watch) {
        const marker = new window.google.maps.Marker({
          position: watchLatLng,
          map: mapInstance,
          title: "Watch (Target)",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#4ade80", // green-400
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
          zIndex: 2
        });
        setMarkers(prev => ({ ...prev, watch: marker }));
      } else {
        markers.watch.setPosition(watchLatLng);
      }
    }

    // --- Range Circle ---
    if (!markers.circle) {
      const circle = new window.google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.15,
        map: mapInstance,
        center: phoneLatLng,
        radius: maxRange,
        zIndex: 1
      });
      setMarkers(prev => ({ ...prev, circle: circle }));
    } else {
      markers.circle.setCenter(phoneLatLng);
      markers.circle.setRadius(maxRange);
    }

    // Keep map centered on Phone
    mapInstance.panTo(phoneLatLng);

  }, [mapInstance, phoneLocation, watchLocation, maxRange, markers]);

  if (!apiKey || apiKey.length < 5) {
    return (
      <div className="w-full h-80 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-500 shadow-inner border-2 border-dashed border-gray-300 p-8 text-center space-y-4">
        <div className="bg-gray-200 p-4 rounded-full">
           <Map className="w-10 h-10 text-gray-400" />
        </div>
        <div>
           <h3 className="font-bold text-gray-800 text-lg">Google Maps API Key Required</h3>
           <p className="text-sm text-gray-600 mt-2 max-w-xs mx-auto">
             To view the live tracking grid, please enter a valid Google Maps API Key in the settings panel below.
           </p>
        </div>
      </div>
    );
  }

  if (!phoneLocation) {
    return (
      <div className="w-full h-80 bg-gray-900 rounded-xl flex items-center justify-center text-blue-300 shadow-inner">
        <div className="flex flex-col items-center animate-pulse">
           <MapPin className="w-10 h-10 mb-2" />
           <span className="font-semibold">Acquiring GPS Signal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-lg border-4 border-[#4169E1] bg-gray-900">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 text-xs font-medium text-gray-700 space-y-2">
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-[#4169E1] border border-white shadow-sm"></div> 
           Phone (Host)
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full bg-[#4ade80] border border-white shadow-sm"></div> 
           Watch (Target)
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-500/10"></div> 
           Max Range ({maxRange}m)
         </div>
      </div>
    </div>
  );
};
