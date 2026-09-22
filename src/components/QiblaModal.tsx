import React from 'react';
import {
  X,
  Compass,
  MapPin
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col max-h-[92vh] text-center">

        {/* Header */}
        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 text-primary flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 shrink-0">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2 rounded-xl bg-primary text-white">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif flex items-center gap-2">
                Qibla Direction
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                  Kaaba Compass
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Direction towards the Kaaba in Makkah
              </p>
            </div>
          </div>
          <button
            id="btn-close-qibla-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compass Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            From: {location.name}, {location.country}
          </div>

          {/* Compass Rose Dial Graphic */}
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
            
            {/* Outer Ring with Cardinal Marks */}
            <div className="absolute inset-0 rounded-full border-4 border-neutral-200 dark:border-neutral-700 shadow-inner flex items-center justify-center bg-neutral-50 dark:bg-neutral-800">
              
              {/* N, E, S, W labels */}
              <span className="absolute top-2 font-bold text-xs text-primary">N</span>
              <span className="absolute right-2 font-bold text-xs text-neutral-500 dark:text-neutral-400">E</span>
              <span className="absolute bottom-2 font-bold text-xs text-neutral-500 dark:text-neutral-400">S</span>
              <span className="absolute left-2 font-bold text-xs text-neutral-500 dark:text-neutral-400">W</span>

              {/* Tick marks */}
              <div className="absolute top-0 w-0.5 h-2 bg-primary" />
              <div className="absolute right-0 h-0.5 w-2 bg-neutral-400" />
              <div className="absolute bottom-0 w-0.5 h-2 bg-neutral-400" />
              <div className="absolute left-0 h-0.5 w-2 bg-neutral-400" />
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
                  <div className="w-6 h-6 rounded-lg bg-primary text-white shadow-xs flex items-center justify-center text-xs">
                    🕋
                  </div>
                  <div className="w-0.5 h-12 bg-primary rounded-full" />
                </div>
                <div className="w-0.5 h-8 bg-neutral-300 rounded-full dark:bg-neutral-600" />
              </div>
            </div>

            {/* Center Pivot Point */}
            <div className="w-6 h-6 rounded-full bg-primary border-2 border-white shadow-md z-10 flex items-center justify-center text-[9px] text-white font-bold">
              •
            </div>

          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/70 border border-primary shadow-xs">
              <span className="text-neutral-400 dark:text-neutral-500 block text-[11px]">Qibla Angle</span>
              <span className="text-xl font-bold font-mono text-primary">
                {angle}° {cardinal}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <span className="text-neutral-400 dark:text-neutral-500 block text-[11px]">Distance to Kaaba</span>
              <span className="text-xl font-bold font-mono text-primary">
                {distanceKm.toLocaleString()} km
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Face <strong className="text-primary">{angle}° {cardinal}</strong> from True North to orient toward the Sacred Sanctuary (Al-Masjid Al-Haram in Makkah).
          </p>

        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-xs"
          >
            Close Compass
          </button>
        </div>

      </div>
    </div>
  );
};
