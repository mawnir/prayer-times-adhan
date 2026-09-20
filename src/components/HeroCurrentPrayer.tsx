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
    <div className="relative overflow-hidden rounded-2xl bg-white border border-neutral-200 p-6 sm:p-8 text-neutral-900 shadow-sm">

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left column: Location & Date & Next Prayer info */}
        <div className="space-y-4 max-w-xl">
          
          {/* Location & Hijri badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              id="btn-hero-location-badge"
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 hover:text-black font-medium transition-all group"
              title="Click to search and change to any city worldwide"
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-500 group-hover:scale-110 transition-transform" />
              <span>{location.name}, {location.country}</span>
              <span className="text-[10px] bg-black px-1.5 py-0.2 rounded-full text-white">Change</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-600">
              <CalendarDays className="w-3.5 h-3.5 text-neutral-500" />
              {hijriFormatted}
            </span>

            <button
              id="btn-hero-qibla-badge"
              onClick={onOpenQibla}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
              title="Click to view Qibla Compass"
            >
              <Compass className="w-3.5 h-3.5 text-neutral-500" />
              Qibla: {qiblaCardinal} ({qiblaAngle}°)
            </button>
          </div>

          {/* Current & Next Prayer Highlight */}
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500">
                Next Prayer In {location.name}
              </span>
              <span className="text-sm font-serif text-neutral-400">
                {nextPrayerMeta.ar}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mt-1">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black font-serif">
                {nextPrayerMeta.en}
              </h2>
              <span className="text-xl sm:text-2xl font-medium text-neutral-600 font-mono">
                {timeFormatted}
              </span>
            </div>
            
            <p className="text-sm text-neutral-500 mt-1">
              {nextPrayerMeta.meaning}
            </p>
          </div>

          {/* Progress Bar through prayer window */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-neutral-500 font-medium">
              <span>Current: {status.currentDisplayName}</span>
              <span>Next: {status.nextDisplayName}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.max(5, status.progressPercent)}%` }}
              />
            </div>
          </div>

        </div>

        {/* Right column: Large Countdown Timer Card & Quick Adhan Control */}
        <div className="flex flex-col items-center sm:items-end justify-center">
          <div className="w-full sm:w-auto p-5 rounded-2xl bg-neutral-50 border border-neutral-200 shadow-sm flex flex-col items-center text-center">
            
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Time Remaining
            </span>

            {/* Large Countdown display */}
            <div className="my-2 font-mono text-3xl sm:text-4xl font-bold tracking-tight text-black">
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-semibold shadow-sm transition-all border border-black"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Test Adhan Call
                </button>
              )}

              <button
                id="btn-hero-open-qibla"
                onClick={onOpenQibla}
                className="p-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200 transition-colors"
                title="Open Qibla Direction"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>

            {isAudioPlaying && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-neutral-500 animate-bounce" />
                Adhan audio playing...
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
