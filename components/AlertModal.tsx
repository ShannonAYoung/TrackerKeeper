import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, platform }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-white border-4 border-red-600 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-bounce-short">
        <div className="bg-red-600 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white font-bold text-xl">
            <AlertTriangle className="w-8 h-8" />
            <span>WARNING</span>
          </div>
          <button onClick={onClose} className="text-white hover:bg-red-700 rounded-full p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
            OUT OF RANGE
          </h2>
          <p className="text-lg text-gray-700">
            The {platform} phone is outside of the maximum range!
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg"
            >
              Dismiss Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
