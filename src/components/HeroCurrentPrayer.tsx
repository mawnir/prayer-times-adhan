import React from 'react';
import { 
  Compass, 
  MapPin, 
  CalendarDays, 
  Volume2, 
  Square, 
} from 'lucide-react';
import { CurrentPrayerStatus, LocationItem } from '../types';
import { PRAYER_DISPLAY_NAMES } from '../services/prayerService';
import { useLanguage } from '../context/LanguageContext';

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
  onTestAdhan: _onTestAdhan,
  onOpenQibla,
  qiblaAngle,
  qiblaCardinal,
  onOpenLocationModal,
}) => {
  const { language, t, isRTL } = useLanguage();
  const nextPrayerMeta = PRAYER_DISPLAY_NAMES[status.nextPrayer] || {
    en: status.nextDisplayName,
    ar: '',
    meaning: '',
  };

  const currentPrayerMeta = status.currentPrayer !== 'none' ? PRAYER_DISPLAY_NAMES[status.currentPrayer] : null;

  const currentPrayerLabel = currentPrayerMeta
    ? (language === 'ar' ? currentPrayerMeta.ar : currentPrayerMeta.en)
    : status.currentDisplayName;

  const nextPrayerTitle = language === 'ar' ? nextPrayerMeta.ar : nextPrayerMeta.en;
  const nextPrayerSecondary = language === 'ar' ? nextPrayerMeta.en : nextPrayerMeta.ar;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-neutral-200/80 p-6 sm:p-8 text-neutral-900 shadow-sm transition-all">
      {/* Decorative subtle background ambient tint matching #79697B */}
      <div 
        className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-[0.06] blur-3xl"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left column: Location & Date & Next Prayer info */}
        <div className="space-y-4 max-w-xl flex-1">
          
          {/* Location & Hijri badges (shadcn badge styling) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              id="btn-hero-location-badge"
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/80 text-neutral-700 hover:text-neutral-900 font-medium transition-all group shadow-2xs"
              title={t.clickToChangeCity}
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-500 group-hover:scale-105 transition-transform" />
              <span>{location.name}, {location.country}</span>
              <span 
                className="text-[10px] px-1.5 py-0.5 rounded text-white font-semibold transition-colors"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {t.changeLocation}
              </span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-50 border border-neutral-200/80 text-neutral-600 shadow-2xs font-medium">
              <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
              {hijriFormatted}
            </span>

            <button
              id="btn-hero-qibla-badge"
              onClick={onOpenQibla}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 text-neutral-600 hover:text-neutral-900 transition-colors shadow-2xs font-medium"
              title={t.clickToViewQibla}
            >
              <Compass className="w-3.5 h-3.5 text-neutral-400" />
              <span>{t.qibla}: {qiblaCardinal} ({qiblaAngle}°)</span>
            </button>
          </div>

          {/* Current & Next Prayer Highlight */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
                {t.nextPrayerIn} {location.name}
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                ({nextPrayerSecondary})
              </span>
            </div>

            <div className="flex items-baseline gap-4 pt-0.5">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900">
                {nextPrayerTitle}
              </h2>
              <span className="text-2xl sm:text-3xl font-semibold text-neutral-600 font-mono tracking-tight">
                {timeFormatted}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-neutral-500">
              {nextPrayerMeta.meaning}
            </p>
          </div>

          {/* Progress Bar through prayer window */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-neutral-500 font-medium">
              <span>{t.current}: {currentPrayerLabel}</span>
              <span>{t.next}: {nextPrayerTitle}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 border border-neutral-200/80 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.max(5, status.progressPercent)}%`,
                  backgroundColor: 'var(--color-primary)' 
                }}
              />
            </div>
          </div>
        </div>

        {/* Right column: Large Countdown Timer Card & Quick Adhan Control */}
        <div className="flex flex-col items-center sm:items-end justify-center">
          <div className="w-full sm:w-64 p-5 sm:p-6 rounded-xl bg-neutral-50/80 border border-neutral-200/80 shadow-xs flex flex-col items-center text-center">
            
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              {t.timeRemaining}
            </span>

            {/* Large Countdown display */}
            <div 
              className="my-2.5 font-mono text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900"
              dir="ltr"
            >
              {status.timeRemainingFormatted}
            </div>

            {/* Audio State / Action Buttons */}
            <div className="mt-1 flex items-center gap-2">
              {isAudioPlaying && (
                <button
                  id="btn-hero-stop-audio"
                  onClick={onStopAudio}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs transition-all animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  {t.stopAdhan}
                </button>
              )}
            </div>

            {isAudioPlaying && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-600 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-neutral-500 animate-bounce" />
                {t.adhanPlaying}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

