import { useState } from "react";

export function useSettings() {
  const [settings, setSettings] = useState({
    maxRangeMeters: 50,
    updateIntervalMinutes: 1,
    mapApiKey: "",
  });

  return { settings, setSettings };
}