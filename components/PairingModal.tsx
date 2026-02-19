import React, { useState, useEffect } from 'react';
import { Smartphone, Bluetooth, Check, Loader2, X, ChevronRight } from 'lucide-react';
import { Platform } from '../types';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPair: (platform: Platform, deviceName: string) => void;
  detectedPlatform: Platform;
}

const IOS_DEVICES = ["iPhone 15 Pro", "iPhone 14 Plus", "iPhone SE (3rd Gen)", "iPhone 13 mini"];
const ANDROID_DEVICES = ["Samsung Galaxy S24", "Google Pixel 8 Pro", "OnePlus 11", "Nothing Phone (2)"];

export const PairingModal: React.FC<PairingModalProps> = ({ isOpen, onClose, onPair, detectedPlatform }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<string[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedPlatform(null);
      setFoundDevices([]);
      setIsScanning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform);
    setStep(2);
    setIsScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false);
      setFoundDevices(platform === Platform.IOS ? IOS_DEVICES : ANDROID_DEVICES);
    }, 2000);
  };

  const handleDeviceSelect = (device: string) => {
    if (selectedPlatform) {
      onPair(selectedPlatform, device);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#4169E1] p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Bluetooth className="w-5 h-5" />
            <span>Device Setup</span>
          </div>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Select Device Platform</h2>
              
              <button
                onClick={() => handlePlatformSelect(Platform.IOS)}
                className="w-full relative group bg-gray-50 hover:bg-blue-50 border-2 border-gray-100 hover:border-[#4169E1] p-4 rounded-xl transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-200 p-3 rounded-full group-hover:bg-white transition-colors">
                     {/* Simplified Apple Icon representation using Smartphone */}
                    <Smartphone className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">iOS (Apple)</div>
                    <div className="text-xs text-gray-500">iPhone, iPad + Apple Watch</div>
                  </div>
                </div>
                {detectedPlatform === Platform.IOS && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Detected</span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#4169E1]" />
              </button>

              <button
                onClick={() => handlePlatformSelect(Platform.ANDROID)}
                className="w-full relative group bg-gray-50 hover:bg-blue-50 border-2 border-gray-100 hover:border-[#4169E1] p-4 rounded-xl transition-all flex items-center justify-between"
              >
                 <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full group-hover:bg-white transition-colors">
                    <Smartphone className="w-6 h-6 text-green-700" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">Android</div>
                    <div className="text-xs text-gray-500">Samsung, Pixel + WearOS</div>
                  </div>
                </div>
                {detectedPlatform === Platform.ANDROID && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Detected</span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#4169E1]" />
              </button>

            </div>
          ) : (
            <div className="space-y-4">
               <div className="text-center mb-4">
                 <h2 className="text-xl font-bold text-gray-900">Select Device</h2>
                 <p className="text-sm text-gray-500">
                    Scanning for available {selectedPlatform} devices...
                 </p>
               </div>

               {isScanning ? (
                 <div className="flex flex-col items-center justify-center py-10 space-y-4 text-[#4169E1]">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <span className="text-sm font-medium">Searching nearby...</span>
                 </div>
               ) : (
                 <div className="space-y-2 animate-in slide-in-from-bottom-2">
                    {foundDevices.map((device, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleDeviceSelect(device)}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#4169E1] hover:bg-blue-50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                            <Bluetooth className="w-5 h-5 text-gray-400 group-hover:text-[#4169E1]" />
                            <span className="font-medium text-gray-800">{device}</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                      </button>
                    ))}
                 </div>
               )}
               
               {!isScanning && (
                  <button onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4">
                    Back to Platform Selection
                  </button>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
