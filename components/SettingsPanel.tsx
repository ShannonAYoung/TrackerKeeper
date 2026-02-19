import React from 'react';
import { Settings, Save } from 'lucide-react';
import { DeviceSettings } from '../types';

interface SettingsPanelProps {
  settings: DeviceSettings;
  onSave: (newSettings: DeviceSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<DeviceSettings>(settings);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleChange = (key: keyof DeviceSettings, value: string | number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
          <Settings className="w-5 h-5 text-[#4169E1]" />
          <span>Tracker Configuration</span>
        </div>
        <span className="text-gray-400 text-sm">{isOpen ? 'Close' : 'Edit'}</span>
      </button>

      {isOpen && (
        <div className="p-5 space-y-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Range (Meters)
            </label>
            <input
              type="number"
              value={localSettings.maxRangeMeters}
              onChange={(e) => handleChange('maxRangeMeters', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4169E1] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Update Interval (Minutes)
            </label>
            <input
              type="number"
              value={localSettings.updateIntervalMinutes}
              onChange={(e) => handleChange('updateIntervalMinutes', parseFloat(e.target.value) || 1)}
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4169E1] focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Currently set to update every {localSettings.updateIntervalMinutes} minutes.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps API Key (Optional)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={localSettings.mapApiKey}
              onChange={(e) => handleChange('mapApiKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4169E1] focus:outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#4169E1] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            Apply Settings
          </button>
        </div>
      )}
    </div>
  );
};
