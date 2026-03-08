import { useState } from "react";
import { Platform, ConnectionStatus } from "../types/enums";

export function useDeviceState() {
  const [deviceState, setDeviceState] = useState({
    platform: Platform.UNKNOWN,
    deviceName: null as string | null,
    status: ConnectionStatus.DISCONNECTED,
    distance: null as number | null,
    isOutOfRange: false,
    lastUpdated: null as number | null,
    phoneLocation: null as any,
    watchLocation: null as any
  });

  const handleDisconnect = () => {
    setDeviceState(prev => ({
      ...prev,
      status: ConnectionStatus.DISCONNECTED
    }));
  };

  const manualRefresh = () => {
    setDeviceState(prev => ({
      ...prev,
      lastUpdated: Date.now()
    }));
  };

  const testDrift = () => {
    setDeviceState(prev => ({
      ...prev,
      distance: (prev.distance ?? 0) + 50
    }));
  };

  return {
    deviceState,
    setDeviceState,
    handleDisconnect,
    manualRefresh,
    testDrift
  };
}