import React, { useState } from "react";
import "./styles/global.css";

import PairingModal from "./components/PairingModal";
import AlertModal from "./components/AlertModal";
import MapDisplay from "./components/MapDisplay";
import SettingsPanel from "./components/SettingsPanel";

import { Cpu, Smartphone, Bluetooth, Watch, RefreshCw, ShieldCheck } from "lucide-react";

import { Platform, ConnectionStatus } from "./types/enums";
import { useDeviceState } from "./hooks/useDeviceState";
import { useSettings } from "./hooks/useSettings";
import { getProtocolInstructions } from "./utils/protocol";

export default function App() {
  const { deviceState, setDeviceState, handleDisconnect, manualRefresh, testDrift } = useDeviceState();
  const { settings, setSettings } = useSettings();

  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);

  const handlePairingRequest = () => setIsPairingModalOpen(true);
  const handlePairingComplete = (platform: Platform, name: string) => {
    setDeviceState(prev => ({
      ...prev,
      platform,
      deviceName: name,
      status: ConnectionStatus.SEARCHING
    }));
    setIsPairingModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#4169E1] text-gray-900 font-sans pb-10">

      {/* Pairing Modal */}
      <PairingModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
        onPair={handlePairingComplete}
        detectedPlatform={deviceState.platform}
      />

      {/* Out-of-range Alert */}
      <AlertModal
        isOpen={deviceState.isOutOfRange}
        onClose={() => setDeviceState(prev => ({ ...prev, isOutOfRange: false }))}
        platform={deviceState.platform}
      />

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6 text-center text-white shadow-lg sticky top-0 z-40">
        <h1 className="text-3xl font-extrabold tracking-wide uppercase drop-shadow-md">
          Tracker Keeper
        </h1>
        <p className="text-blue-100 text-sm mt-1 opacity-90">
          Secure Range Monitoring System
        </p>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-6 space-y-6">

        {/* Protocol Status Bar */}
        <div
          className={`rounded-lg p-3 text-sm font-medium flex items-center gap-2 border shadow-sm ${
            deviceState.status === ConnectionStatus.CONNECTED
              ? "bg-blue-900 text-blue-100 border-blue-700"
              : "bg-white/20 text-white border-white/10"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{getProtocolInstructions(deviceState)}</span>
        </div>

        {/* Connection Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">

              {/* Device Info */}
              <div className="flex items-center space-x-3">
                <div className={
                  deviceState.platform === Platform.IOS
                    ? "bg-gray-200 p-2 rounded-full"
                    : deviceState.platform === Platform.ANDROID
                    ? "bg-green-100 p-2 rounded-full"
                    : "bg-gray-100 p-2 rounded-full"
                }>
                  <Smartphone
                    className={
                      deviceState.platform === Platform.ANDROID
                        ? "w-6 h-6 text-green-700"
                        : deviceState.platform === Platform.IOS
                        ? "w-6 h-6 text-gray-700"
                        : "w-6 h-6 text-gray-400"
                    }
                  />
                </div>

                <div>
                  <h2 className="font-bold text-lg text-gray-800">
                    {deviceState.deviceName || "No Device"}
                  </h2>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {deviceState.platform !== Platform.UNKNOWN
                      ? `${deviceState.platform} Linked`
                      : "Primary Device"}
                  </p>
                </div>
              </div>

              {/* Bluetooth Icon */}
              <Bluetooth
                className={`w-6 h-6 ${
                  deviceState.status === ConnectionStatus.CONNECTED
                    ? "text-blue-600 animate-pulse"
                    : "text-gray-300"
                }`}
              />

              {/* Target Device */}
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

          {/* Connection State */}
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

                {/* Active Monitoring */}
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200 text-green-800 text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Active Monitoring
                  </span>
                  <button onClick={handleDisconnect} className="text-red-500 hover:text-red-700 underline">
                    Disconnect
                  </button>
                </div>

                {/* Distance + Max Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <span className="block text-gray-400 text-xs uppercase mb-1">Distance</span>
                    <span className={`text-2xl font-bold ${
                      deviceState.isOutOfRange ? "text-red-600" : "text-gray-800"
                    }`}>
                      {deviceState.distance !== null ? `${deviceState.distance.toFixed(1)} m` : "--"}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <span className="block text-gray-400 text-xs uppercase mb-1">Max Range</span>
                    <span className="text-2xl font-bold text-gray-800">
                      {settings.maxRangeMeters} m
                    </span>
                  </div>
                </div>

                {/* Altitude */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <span className="block text-gray-400 text-xs uppercase mb-1">Phone Alt</span>
                    <span className="text-lg font-bold text-gray-800">
                      {deviceState.phoneLocation?.altitude
                        ? `${deviceState.phoneLocation.altitude.toFixed(1)} m`
                        : "N/A"}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                    <span className="block text-gray-400 text-xs uppercase mb-1">Watch Alt</span>
                    <span className="text-lg font-bold text-gray-800">
                      {deviceState.watchLocation?.altitude
                        ? `${deviceState.watchLocation.altitude.toFixed(1)} m`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Sync Button */}
                <button
                  onClick={manualRefresh}
                  className="w-full py-3 border-2 border-[#4169E1] text-[#4169E1] rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync Coordinates
                </button>

                {/* Test Button */}
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

        {/* Map */}
        <MapDisplay
          phoneLocation={deviceState.phoneLocation}
          watchLocation={deviceState.watchLocation}
          apiKey={settings.mapApiKey}
          maxRange={settings.maxRangeMeters}
        />

        {/* Settings */}
        <SettingsPanel settings={settings} onSave={setSettings} />

        {/* Footer */}
        <div className="text-center text-blue-200 text-xs">
          <div className="flex justify-center items-center gap-1 mb-2">
            <ShieldCheck className="w-3 h-3" />
            <span>Secure Link Verified</span>
          </div>
          <p>
            Last Sync:{" "}
            {deviceState.lastUpdated
              ? new Date(deviceState.lastUpdated).toLocaleTimeString()
              : "Never"}
          </p>
          <p className="mt-1 opacity-75">
            {deviceState.platform !== Platform.UNKNOWN
              ? deviceState.platform
              : "System"}{" "}
            Mode • Polling every {settings.updateIntervalMinutes} min(s)
          </p>
        </div>

      </main>
    </div>
  );
}
