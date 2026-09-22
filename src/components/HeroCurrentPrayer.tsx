import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Compass,
  MapPin,
  CalendarDays,
  Volume2,
  Square,
} from 'lucide-react';
import { CurrentPrayerStatus, LocationItem } from '../types';
import { FIXED_UTC_OFFSET_MINUTES, PRAYER_DISPLAY_NAMES } from '../services/prayerService';
import { useLanguage } from '../context/LanguageContext';

interface HeroCurrentPrayerProps {
  location: LocationItem;
  status: CurrentPrayerStatus;
  hijriFormatted: string;
  hijriDate?: {
    day: number;
    monthName: string;
    monthNameAr: string;
    monthIndex: number;
    year: number;
    formatted: string;
    formattedAr: string;
  };
  timeFormatted: string;
  currentTime?: Date;
  isAudioPlaying: boolean;
  onStopAudio: () => void;
  onTestAdhan: () => void;
  onOpenQibla: () => void;
  qiblaAngle: number;
  qiblaCardinal: string;
  onOpenLocationModal?: () => void;
}

function formatCurrentTime(date: Date, timezone?: string): { time: string; period: string } {
  // Morocco (Casablanca/El Aaiun) is pinned to UTC+00:00 — same fix as
  // formatPrayerTime — so stale browser tzdata showing UTC+01:00 can't make
  // the clock run 1 hour ahead of the displayed prayer times.
  const fixedOffset = timezone ? FIXED_UTC_OFFSET_MINUTES[timezone] : undefined;
  const targetDate = fixedOffset !== undefined
    ? new Date(date.getTime() + fixedOffset * 60000)
    : date;
  const timeZone = fixedOffset !== undefined ? 'UTC' : timezone;

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      ...(timeZone ? { timeZone } : {}),
    }).formatToParts(targetDate);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const time = `${get('hour')}:${get('minute')}:${get('second')}`;
    const period = get('dayPeriod');
    return { time, period };
  } catch {
    // Fallback: derive wall-clock fields from the fixed offset directly.
    const shifted = fixedOffset !== undefined
      ? new Date(date.getTime() + fixedOffset * 60000)
      : date;
    const pad = (n: number) => String(n).padStart(2, '0');
    const h24 = shifted.getUTCHours();
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      time: `${pad(h12)}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`,
      period: h24 >= 12 ? 'PM' : 'AM',
    };
  }
}

export const HeroCurrentPrayer: React.FC<HeroCurrentPrayerProps> = ({
  location,
  status,
  hijriFormatted,
  hijriDate,
  timeFormatted,
  currentTime: currentTimeProp,
  isAudioPlaying,
  onStopAudio,
  onTestAdhan: _onTestAdhan,
  onOpenQibla,
  qiblaAngle,
  qiblaCardinal,
  onOpenLocationModal,
}) => {
  const { language, t } = useLanguage();

  const hijriDisplay =
    language === 'ar' ? hijriDate?.formattedAr ?? hijriFormatted : hijriDate?.formatted ?? hijriFormatted;

  // Live clock fallback when parent doesn't pass currentTime
  const [internalNow, setInternalNow] = useState(() => new Date());
  useEffect(() => {
    if (currentTimeProp) return;
    const timer = setInterval(() => setInternalNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [currentTimeProp]);

  const now = currentTimeProp ?? internalNow;
  const { time: currentTimeFormatted, period: currentTimePeriod } = useMemo(
    () => formatCurrentTime(now, location.timezone),
    [now, location.timezone]
  );
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
    <div className="relative overflow-hidden rounded-2xl bg-neutral-50 border border-neutral-200/80 p-6 sm:p-8 text-neutral-900 shadow-sm transition-all dark:bg-neutral-900 dark:border-neutral-700/80 dark:text-neutral-100">
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/80 text-neutral-700 hover:text-neutral-900 font-medium transition-all group shadow-2xs dark:bg-neutral-800 dark:hover:bg-neutral-700/80 dark:border-neutral-700/80 dark:text-neutral-300 dark:hover:text-neutral-100"
              title={t.clickToChangeCity}
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-500 group-hover:scale-105 transition-transform dark:text-neutral-400" />
              <span>{location.name}, {location.country}</span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded text-white font-semibold transition-colors"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {t.changeLocation}
              </span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-50 border border-neutral-200/80 text-neutral-600 shadow-2xs font-medium dark:bg-neutral-800 dark:border-neutral-700/80 dark:text-neutral-300">
              <CalendarDays className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
              {hijriDisplay}
            </span>

            <button
              id="btn-hero-qibla-badge"
              onClick={onOpenQibla}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 text-neutral-600 hover:text-neutral-900 transition-colors shadow-2xs font-medium dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:border-neutral-700/80 dark:text-neutral-300 dark:hover:text-neutral-100"
              title={t.clickToViewQibla}
            >
              <Compass className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
              <span>{t.qibla}: {qiblaCardinal} ({qiblaAngle}°)</span>
            </button>
          </div>

          {/* Current & Next Prayer Highlight */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">
                {t.nextPrayerIn} {location.name}
              </span>
              <span className="text-xs text-neutral-400 font-medium dark:text-neutral-500">
                ({nextPrayerSecondary})
              </span>
            </div>

            <div className="flex items-baseline gap-4 pt-0.5">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {nextPrayerTitle}
              </h2>
              <span className="text-2xl sm:text-3xl font-semibold text-neutral-600 font-mono tracking-tight dark:text-neutral-300">
                {timeFormatted}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {nextPrayerMeta.meaning}
            </p>
          </div>

          {/* Progress Bar through prayer window */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-neutral-500 font-medium dark:text-neutral-400">
              <span>{t.current}: {currentPrayerLabel}</span>
              <span>{t.next}: {nextPrayerTitle}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-100 border border-neutral-200/80 overflow-hidden dark:bg-neutral-800 dark:border-neutral-700/80">
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
          <div className="w-full sm:w-72 p-5 sm:p-6 rounded-xl bg-neutral-50/80 border border-neutral-200/80 shadow-xs flex flex-col items-center text-center dark:bg-neutral-800/80 dark:border-neutral-700/80">

            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {t.timeRemaining}
            </span>

            {/* Large Countdown display */}
            <div
              className="my-2 font-mono text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 tabular-nums dark:text-neutral-100"
              dir="ltr"
            >
              {status.timeRemainingFormatted}
            </div>

            {/* Current time — lives inside the same Time Remaining card */}
            <div className="mt-1 w-full rounded-lg border border-neutral-200/80 bg-white/70 px-3 py-2.5 text-start shadow-2xs dark:border-neutral-700/80 dark:bg-neutral-900/70">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <Clock
                    className="w-3.5 h-3.5"
                    style={{ color: 'var(--color-primary)' }}
                  />
                  {t.currentTime}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  </span>
                  {t.live}
                </span>
              </div>

              <div className="mt-1 flex items-baseline justify-between gap-2" dir="ltr">
                <span className="font-mono text-xl font-bold tracking-tight text-neutral-900 tabular-nums dark:text-neutral-100">
                  {currentTimeFormatted}
                </span>
                <span className="font-mono text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  {currentTimePeriod}
                </span>
              </div>
            </div>

            {/* Audio State / Action Buttons */}
            {isAudioPlaying && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  id="btn-hero-stop-audio"
                  onClick={onStopAudio}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs transition-all animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  {t.stopAdhan}
                </button>
              </div>
            )}

            {isAudioPlaying && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-600 font-medium dark:text-neutral-300">
                <Volume2 className="w-3.5 h-3.5 text-neutral-500 animate-bounce dark:text-neutral-400" />
                {t.adhanPlaying}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

