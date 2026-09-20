import React from 'react';
import { 
  Compass, 
  MapPin, 
  CalendarDays, 
  Volume2, 
  Square, 
  Sparkles,
  Play
} from 'lucide-react';
import { CurrentPrayerStatus, LocationItem } from '../types';
import { PRAYER_DISPLAY_NAMES } from '../services/prayerService';

interface HeroCurrentPrayerProps {
  location: LocationItem;
  status: CurrentPrayerStatus;
  hijriFormatted: string;
  timeFormatted: string;
  isAudioPlaying: boolean;
  onStopAudio: () => void;
  onTestAdhan: () => void;
  onOpenQibla: () => void;
  qiblaAngle: number;
  qiblaCardinal: string;
  onOpenLocationModal?: () => void;
}

export const HeroCurrentPrayer: React.FC<HeroCurrentPrayerProps> = ({
  location,
  status,
  hijriFormatted,
  timeFormatted,
  isAudioPlaying,
  onStopAudio,
  onTestAdhan,
  onOpenQibla,
  qiblaAngle,
  qiblaCardinal,
  onOpenLocationModal,
}) => {
  const nextPrayerMeta = PRAYER_DISPLAY_NAMES[status.nextPrayer] || {
    en: status.nextDisplayName,
    ar: '',
    meaning: '',
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 border border-emerald-700/40 p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/40">
      
      {/* Subtle Islamic geometric background aura */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left column: Location & Date & Next Prayer info */}
        <div className="space-y-4 max-w-xl">
          
          {/* Location & Hijri badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              id="btn-hero-location-badge"
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/60 hover:bg-emerald-700/70 border border-emerald-600/50 text-emerald-200 hover:text-white font-medium transition-all group"
              title="Click to search and change to any city worldwide"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{location.name}, {location.country}</span>
              <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.2 rounded-full text-emerald-200">Change</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
              {hijriFormatted}
            </span>

            <button
              id="btn-hero-qibla-badge"
              onClick={onOpenQibla}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 hover:text-white hover:bg-emerald-800/40 transition-colors"
              title="Click to view Qibla Compass"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Qibla: {qiblaCardinal} ({qiblaAngle}°)
            </button>
          </div>

          {/* Current & Next Prayer Highlight */}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-400">
                Next Prayer In {location.name}
              </span>
              <span className="text-sm font-serif text-emerald-300/80">
                {nextPrayerMeta.ar}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mt-1">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-serif">
                {nextPrayerMeta.en}
              </h2>
              <span className="text-xl sm:text-2xl font-medium text-emerald-300 font-mono">
                {timeFormatted}
              </span>
            </div>
            
            <p className="text-sm text-emerald-200/80 mt-1">
              {nextPrayerMeta.meaning}
            </p>
          </div>

          {/* Progress Bar through prayer window */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-emerald-300/80 font-medium">
              <span>Current: {status.currentDisplayName}</span>
              <span>Next: {status.nextDisplayName}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-emerald-950/80 border border-emerald-800/50 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.max(5, status.progressPercent)}%` }}
              />
            </div>
          </div>

        </div>

        {/* Right column: Large Countdown Timer Card & Quick Adhan Control */}
        <div className="flex flex-col items-center sm:items-end justify-center">
          <div className="w-full sm:w-auto p-5 rounded-2xl bg-emerald-950/70 border border-emerald-700/50 backdrop-blur-md shadow-inner flex flex-col items-center text-center">
            
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Time Remaining
            </span>

            {/* Large Countdown display */}
            <div className="my-2 font-mono text-3xl sm:text-4xl font-bold tracking-tight text-emerald-100 drop-shadow-sm">
              {status.timeRemainingFormatted}
            </div>

            {/* Audio State / Action Buttons */}
            <div className="mt-2 flex items-center gap-2">
              {isAudioPlaying ? (
                <button
                  id="btn-hero-stop-audio"
                  onClick={onStopAudio}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-all animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop Adhan
                </button>
              ) : (
                <button
                  id="btn-hero-test-adhan"
                  onClick={onTestAdhan}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/50 transition-all border border-emerald-400/30"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Test Adhan Call
                </button>
              )}

              <button
                id="btn-hero-open-qibla"
                onClick={onOpenQibla}
                className="p-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-700/50 transition-colors"
                title="Open Qibla Direction"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>

            {isAudioPlaying && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                Adhan audio playing...
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
