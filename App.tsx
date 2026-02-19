import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Watch, 
  Bluetooth, 
  RefreshCw, 
  Settings2,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { DeviceState, Platform, ConnectionStatus, DeviceSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { detectPlatform, calculateDistance, simulateWatchLocation, getCurrentPosition } from './services/geoService';
import { AlertModal } from './components/AlertModal';
import { MapDisplay } from './components/MapDisplay';
import { SettingsPanel } from './components/SettingsPanel';
import { PairingModal } from './components/PairingModal';

const App: React.FC = () => {
  // --- State Management ---
  const [settings, setSettings] = useState<DeviceSettings>(DEFAULT_SETTINGS);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>(Platform.UNKNOWN);
  
  const [deviceState, setDeviceState] = useState<DeviceState>({
    platform: Platform.UNKNOWN,
    status: ConnectionStatus.DISCONNECTED,
    phoneLocation: null,
    watchLocation: null,
    lastUpdated: 0,
    distance: null,
    isOutOfRange: false,
    deviceName: undefined
  });

  const [simulatedDrift, setSimulatedDrift] = useState<number>(0.0001); // Start with small drift
  
  // Ref for interval to handle updates based on settings
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Effects ---

  // 1. Initial Platform Detection for Hint only
  useEffect(() => {
    const platform = detectPlatform();
    setDetectedPlatform(platform);
  }, []);

  // 2. Main Logic Loop (Poll based on configured minutes)
  useEffect(() => {
    if (deviceState.status === ConnectionStatus.CONNECTED) {
      // Clear existing
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);

      const runUpdate = async () => {
        try {
          await updateLocations();
        } catch (error: any) {
          console.error("Location Update Failed:", error);
          // Prevent alerting on every interval if background update fails silently
        }
      };

      // Run immediately
      runUpdate();

      // Set interval (minutes to ms)
      const intervalMs = settings.updateIntervalMinutes * 60 * 1000;
      updateIntervalRef.current = setInterval(runUpdate, intervalMs);
    } else {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    }

    return () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceState.status, settings.updateIntervalMinutes, simulatedDrift, settings.maxRangeMeters]);

  // --- Logic Functions ---

  const handlePairingRequest = () => {
    setIsPairingModalOpen(true);
  };

  const handlePairingComplete = (platform: Platform, deviceName: string) => {
    setIsPairingModalOpen(false);
    
    // Simulate connection flow
    setDeviceState(prev => ({ 
      ...prev, 
      status: ConnectionStatus.SEARCHING,
      platform,
      deviceName
    }));

    setTimeout(() => {
      setDeviceState(prev => ({ ...prev, status: ConnectionStatus.CONNECTED }));
    }, 1500);
  };

  const handleDisconnect = () => {
    setDeviceState(prev => ({ 
      ...prev, 
      status: ConnectionStatus.DISCONNECTED,
      watchLocation: null,
      distance: null,
      isOutOfRange: false,
      deviceName: undefined,
      platform: Platform.UNKNOWN
    }));
  };

  const updateLocations = async () => {
    try {
      // 1. Get Phone Location (Real GPS)
      const phonePos = await getCurrentPosition();
      
      // 2. Get Watch Location (Simulated via Bluetooth/Native Bridge)
      const watchPos = simulateWatchLocation(phonePos, simulatedDrift);

      // 3. Calculate Distance
      const dist = calculateDistance(phonePos, watchPos);

      // 4. Check Range
      const isOut = dist > settings.maxRangeMeters;

      setDeviceState(prev => ({
        ...prev,
        phoneLocation: phonePos,
        watchLocation: watchPos,
        distance: dist,
        isOutOfRange: isOut,
        lastUpdated: Date.now()
      }));

    } catch (err: any) {
      console.error("GPS Error", err);
      // Safe error formatting
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Unknown location error');
      alert(`Unable to retrieve GPS location: ${errorMessage}. Please ensure permissions are granted.`);
    }
  };

  const manualRefresh = () => {
    if (deviceState.status === ConnectionStatus.CONNECTED) {
      updateLocations();
    }
  };

  // Helper to test range alert by artificially pushing watch away
  const testDrift = () => {
    setSimulatedDrift(prev => prev + 0.001); // Increase distance
    manualRefresh();
  };

  // --- UI Helpers ---

  const getProtocolInstructions = () => {
    if (deviceState.platform === Platform.IOS) {
      return "Running iOS Protocols: Syncing via WatchConnectivity Framework. Apple Watch location stream active.";
    }
    if (deviceState.platform === Platform.ANDROID) {
      return "Running Android Protocols: Syncing via Google Play Services Data Layer. Wear OS location stream active.";
    }
    return "Waiting for device selection...";
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-[#4169E1] text-gray-900 font-sans pb-10">
      
      <PairingModal 
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        onPair={handlePairingComplete}
        detectedPlatform={detectedPlatform}
      />

      <AlertModal 
        isOpen={deviceState.isOutOfRange} 
        onClose={() => setDeviceState(prev => ({...prev, isOutOfRange: false}))}
        platform={deviceState.platform}
      />

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 text-center text-white shadow-lg sticky top-0 z-40">
        <h1 className="text-3xl font-extrabold tracking-tight uppercase drop-shadow-md">
          Tracker Keeper
        </h1>
        <p className="text-blue-100 text-sm mt-1 opacity-90">
          Secure Range Monitoring System
        </p>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Protocol Status Bar */}
        <div className={`rounded-lg p-3 text-sm font-medium flex items-center gap-2 border shadow-sm ${
           deviceState.status === ConnectionStatus.CONNECTED 
             ? 'bg-blue-900 text-blue-100 border-blue-700' 
             : 'bg-white/20 text-white border-white/10'
        }`}>
           <Cpu className="w-4 h-4" />
           <span>{getProtocolInstructions()}</span>
        </div>

        {/* Connection Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {deviceState.platform === Platform.IOS ? (
                   <div className="bg-gray-200 p-2 rounded-full"><Smartphone className="w-6 h-6 text-gray-700" /></div>
                ) : deviceState.platform === Platform.ANDROID ? (
                   <div className="bg-green-100 p-2 rounded-full"><Smartphone className="w-6 h-6 text-green-700" /></div>
                ) : (
                   <div className="bg-gray-100 p-2 rounded-full"><Smartphone className="w-6 h-6 text-gray-400" /></div>
                )}
                <div>
                  <h2 className="font-bold text-lg text-gray-800">
                    {deviceState.deviceName || 'No Device'}
                  </h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {deviceState.platform !== Platform.UNKNOWN ? `${deviceState.platform} Linked` : 'Primary Device'}
                  </p>
                </div>
              </div>
              
              <Bluetooth className={`w-6 h-6 ${deviceState.status === ConnectionStatus.CONNECTED ? 'text-blue-600 animate-pulse' : 'text-gray-300'}`} />

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <h2 className="font-bold text-lg text-gray-800">Smart Watch</h2>
                   <p className="text-xs text-gray-500 uppercase tracking-wide">Target</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Watch className="w-6 h-6 text-[#4169E1]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col items-center justify-center space-y-4">
             {deviceState.status === ConnectionStatus.DISCONNECTED && (
               <button 
                onClick={handlePairingRequest}
                className="w-full py-4 bg-[#4169E1] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
               >
                 <Bluetooth className="w-5 h-5" />
                 Pair Devices via Bluetooth
               </button>
             )}

             {deviceState.status === ConnectionStatus.SEARCHING && (
               <div className="flex flex-col items-center py-4">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4169E1] mb-3"></div>
                 <p className="text-gray-500 font-medium">Establishing secure connection...</p>
               </div>
             )}

             {deviceState.status === ConnectionStatus.CONNECTED && (
               <div className="w-full space-y-4">
                 <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200 text-green-800 text-sm font-medium">
                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Active Monitoring</span>
                    <button onClick={handleDisconnect} className="text-red-500 hover:text-red-700 underline">Disconnect</button>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                      <span className="block text-gray-400 text-xs uppercase mb-1">Distance</span>
                      <span className={`text-2xl font-bold ${deviceState.isOutOfRange ? 'text-red-600' : 'text-gray-800'}`}>
                        {deviceState.distance !== null ? `${deviceState.distance.toFixed(1)} m` : '--'}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                      <span className="block text-gray-400 text-xs uppercase mb-1">Max Range</span>
                      <span className="text-2xl font-bold text-gray-800">
                        {settings.maxRangeMeters} m
                      </span>
                    </div>
                 </div>
                 
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                      <span className="block text-gray-400 text-xs uppercase mb-1">Phone Alt</span>
                      <span className="text-lg font-bold text-gray-800">
                        {deviceState.phoneLocation?.altitude 
                          ? `${deviceState.phoneLocation.altitude.toFixed(1)} m` 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                       <span className="block text-gray-400 text-xs uppercase mb-1">Watch Alt</span>
                      <span className="text-lg font-bold text-gray-800">
                         {deviceState.watchLocation?.altitude 
                          ? `${deviceState.watchLocation.altitude.toFixed(1)} m` 
                          : 'N/A'}
                      </span>
                    </div>
                 </div>

                 <button 
                   onClick={manualRefresh}
                   className="w-full py-3 border-2 border-[#4169E1] text-[#4169E1] rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                 >
                   <RefreshCw className="w-4 h-4" />
                   Sync Coordinates
                 </button>
                 
                 {/* Test Tool for Demo */}
                 <button 
                   onClick={testDrift}
                   className="w-full text-xs text-gray-400 hover:text-gray-600 underline text-center"
                 >
                   [Test] Simulate Movement (+50m)
                 </button>
               </div>
             )}
          </div>
        </div>

        {/* Map Visualization */}
        <MapDisplay 
          phoneLocation={deviceState.phoneLocation} 
          watchLocation={deviceState.watchLocation}
          apiKey={settings.mapApiKey}
          maxRange={settings.maxRangeMeters}
        />

        {/* Settings */}
        <SettingsPanel settings={settings} onSave={setSettings} />

        {/* Status Footer */}
        <div className="text-center text-blue-200 text-xs">
           <div className="flex justify-center items-center gap-1 mb-2">
             <ShieldCheck className="w-3 h-3" />
             <span>Secure Link Verified</span>
           </div>
           <p>Last Sync: {deviceState.lastUpdated ? new Date(deviceState.lastUpdated).toLocaleTimeString() : 'Never'}</p>
           <p className="mt-1 opacity-75">
             {deviceState.platform !== Platform.UNKNOWN ? deviceState.platform : 'System'} Mode • Polling every {settings.updateIntervalMinutes} min(s)
           </p>
        </div>

      </main>
    </div>
  );
};

export default App;