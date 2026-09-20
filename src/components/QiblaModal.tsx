import React from 'react';
import { 
  X, 
  Compass, 
  MapPin, 
  Navigation, 
  Info 
} from 'lucide-react';
import { LocationItem } from '../types';
import { getQiblaInfo } from '../services/prayerService';

interface QiblaModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationItem;
}

export const QiblaModal: React.FC<QiblaModalProps> = ({
  isOpen,
  onClose,
  location,
}) => {
  if (!isOpen) return null;

  const { angle, cardinal } = getQiblaInfo(location);

  // Approximate distance to Kaaba in Makkah (21.4225, 39.8262) using Haversine formula
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const distanceKm = getDistanceKm(location.latitude, location.longitude, 21.4225, 39.8262);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-center">
        
        {/* Header */}
        <div className="p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2 rounded-xl bg-emerald-800 text-emerald-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif">Qibla Direction</h3>
              <p className="text-xs text-emerald-300">
                Direction towards the Kaaba in Makkah
              </p>
            </div>
          </div>
          <button
            id="btn-close-qibla-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compass Body */}
        <div className="p-6 space-y-6">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            From: {location.name}, {location.country}
          </div>

          {/* Compass Rose Dial Graphic */}
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
            
            {/* Outer Ring with Cardinal Marks */}
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 shadow-inner flex items-center justify-center bg-slate-50">
              
              {/* N, E, S, W labels */}
              <span className="absolute top-2 font-bold text-xs text-red-600">N</span>
              <span className="absolute right-2 font-bold text-xs text-slate-500">E</span>
              <span className="absolute bottom-2 font-bold text-xs text-slate-500">S</span>
              <span className="absolute left-2 font-bold text-xs text-slate-500">W</span>

              {/* Tick marks */}
              <div className="absolute top-0 w-0.5 h-2 bg-red-600" />
              <div className="absolute right-0 h-0.5 w-2 bg-slate-400" />
              <div className="absolute bottom-0 w-0.5 h-2 bg-slate-400" />
              <div className="absolute left-0 h-0.5 w-2 bg-slate-400" />
            </div>

            {/* Rotating Qibla Needle */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              {/* Needle pointing to Kaaba */}
              <div className="flex flex-col items-center h-full justify-between py-5">
                {/* Pointer tip with Kaaba Icon */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white shadow-md flex items-center justify-center text-xs">
                    🕋
                  </div>
                  <div className="w-0.5 h-12 bg-emerald-600 rounded-full" />
                </div>
                <div className="w-0.5 h-8 bg-slate-300 rounded-full" />
              </div>
            </div>

            {/* Center Pivot Point */}
            <div className="w-6 h-6 rounded-full bg-emerald-800 border-2 border-white shadow-md z-10 flex items-center justify-center text-[9px] text-white font-bold">
              •
            </div>

          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Qibla Angle</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {angle}° {cardinal}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Distance to Kaaba</span>
              <span className="text-xl font-bold font-mono text-emerald-800">
                {distanceKm.toLocaleString()} km
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Face <strong>{angle}° {cardinal}</strong> from True North to orient toward the Sacred Sanctuary (Al-Masjid Al-Haram in Makkah).
          </p>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            Close Compass
          </button>
        </div>

      </div>
    </div>
  );
};
