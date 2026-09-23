import React, { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  Compass,
  MapPin,
  CalendarDays,
  Volume2,
  Square,
  Play,
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
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
    return {
      time: `${get('hour')}:${get('minute')}:${get('second')}`,
      period: get('dayPeriod'),
    };
  } catch {
    const shifted = fixedOffset !== undefined
      ? new Date(date.getTime() + fixedOffset * 60000)
      : date;
    const pad = (value: number) => String(value).padStart(2, '0');
    const hour24 = shifted.getUTCHours();
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    return {
      time: `${pad(hour12)}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`,
      period: hour24 >= 12 ? 'PM' : 'AM',
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
  onTestAdhan,
  onOpenQibla,
  qiblaAngle,
  qiblaCardinal,
  onOpenLocationModal,
}) => {
  const { language, t } = useLanguage();

  const hijriDisplay =
    language === 'ar' ? hijriDate?.formattedAr ?? hijriFormatted : hijriDate?.formatted ?? hijriFormatted;

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
  const currentPrayerMeta = status.currentPrayer !== 'none'
    ? PRAYER_DISPLAY_NAMES[status.currentPrayer]
    : null;
  const currentPrayerLabel = currentPrayerMeta
    ? (language === 'ar' ? currentPrayerMeta.ar : currentPrayerMeta.en)
    : status.currentDisplayName;
  const nextPrayerTitle = language === 'ar' ? nextPrayerMeta.ar : nextPrayerMeta.en;
  const nextPrayerSecondary = language === 'ar' ? nextPrayerMeta.en : nextPrayerMeta.ar;
  const progress = Math.max(0, Math.min(100, status.progressPercent));
  const orbitBackground = `repeating-conic-gradient(from -90deg, rgba(236, 244, 239, 0.28) 0deg 0.55deg, transparent 0.55deg 7.5deg), conic-gradient(from -90deg, #c8a35b 0deg ${progress * 3.6}deg, rgba(236, 244, 239, 0.11) ${progress * 3.6}deg 360deg)`;

  return (
    <section className="celestial-hero px-5 py-6 sm:px-8 sm:py-8 lg:px-10" aria-labelledby="next-prayer-title">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-hero-location-badge"
            type="button"
            onClick={onOpenLocationModal}
            className="hero-location"
            title={t.clickToChangeCity}
          >
            <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span className="truncate">{location.name}, {location.country}</span>
          </button>
          <div className="hero-meta px-1">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{hijriDisplay}</span>
          </div>
        </div>

        <button
          id="btn-hero-qibla-badge"
          type="button"
          onClick={onOpenQibla}
          className="hero-location hidden sm:inline-flex"
          title={t.clickToViewQibla}
        >
          <Compass className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>{t.qibla}: {qiblaCardinal}, {qiblaAngle}°</span>
        </button>
      </div>

      <div className="relative z-10 mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-sm text-white/55">
            <span>{t.nextPrayerIn}</span>
            <span className="h-px w-5 bg-white/20" aria-hidden="true" />
            <span className="font-serif text-base text-accent/85" dir="auto">{nextPrayerSecondary}</span>
          </div>

          <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
            <h2
              id="next-prayer-title"
              className="text-[clamp(3.1rem,8vw,5.8rem)] font-medium leading-[0.92] tracking-[-0.07em] text-[#f4f7f2]"
              dir="auto"
            >
              {nextPrayerTitle}
            </h2>
            <time className="pb-1 font-mono text-xl font-medium tracking-[-0.035em] text-white/72 sm:text-2xl" dir="ltr">
              {timeFormatted}
            </time>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-6 text-white/54 sm:text-[0.95rem]">
            {nextPrayerMeta.meaning}
          </p>

          <div className="hero-window mt-7 rounded-[0.45rem_0.45rem_1rem_1rem] px-4 py-3.5 sm:px-5">
            <div className="flex items-center justify-between gap-4 text-[0.72rem] text-white/55">
              <span>{t.current}: <strong className="font-semibold text-white/86">{currentPrayerLabel}</strong></span>
              <span>{t.next}: <strong className="font-semibold text-white/86">{nextPrayerTitle}</strong></span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-out"
                style={{ width: `${Math.max(2, progress)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center lg:pe-3">
          <div
            className="countdown-orbit"
            style={{ background: orbitBackground }}
            aria-label={`${t.timeRemaining}: ${status.timeRemainingFormatted}`}
          >
            <div className="orbit-core">
              <span className="text-[0.68rem] font-medium text-white/48">{t.timeRemaining}</span>
              <div className="countdown-value my-3 text-white" dir="ltr" aria-live="off">
                {status.timeRemainingFormatted}
              </div>
              <div className="flex items-center gap-1.5 text-[0.67rem] text-white/45">
                <Clock className="h-3 w-3 text-accent" aria-hidden="true" />
                <span className="font-mono tabular-nums" dir="ltr">{currentTimeFormatted}</span>
                <span>{currentTimePeriod}</span>
                <span className="ms-1 inline-flex items-center gap-1 text-[#8ac8bd]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#78beb2]" aria-hidden="true" />
                  {t.live}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex min-h-10 flex-col items-center justify-center gap-2">
            {isAudioPlaying ? (
              <>
                <button
                  id="btn-hero-stop-audio"
                  type="button"
                  onClick={onStopAudio}
                  className="inline-flex items-center gap-2 rounded-[0.65rem] border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  {t.stopAdhan}
                </button>
                <div className="flex h-5 items-center justify-center gap-1" aria-label={t.adhanPlaying}>
                  {[0.45, 1, 0.65, 0.85, 0.4, 0.72, 0.32].map((height, index) => (
                    <span
                      key={index}
                      className="sound-bar"
                      style={{ height: `${height * 100}%`, animationDelay: `${index * 85}ms` }}
                    />
                  ))}
                  <span className="sr-only"><Volume2 className="h-3 w-3" />{t.adhanPlaying}</span>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={onTestAdhan}
                className="inline-flex items-center gap-2 rounded-[0.65rem] border border-white/12 bg-white/[0.055] px-3.5 py-2 text-xs font-semibold text-white/72 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Preview adhan
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
