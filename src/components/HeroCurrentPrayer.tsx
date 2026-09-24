import type { CSSProperties, FC } from 'react';
import { Clock, Compass, MapPin, Square } from 'lucide-react';
import type { CurrentPrayerStatus, LocationItem, PrayerKey } from '../types';
import { FIXED_UTC_OFFSET_MINUTES, formatCountdown, PRAYER_DISPLAY_NAMES } from '../services/prayerService';
import { formatLocationDisplay } from '../services/locationLocalization';
import { useLanguage } from '../context/LanguageContext';

const PRAYER_BACKGROUNDS: Record<PrayerKey, string> = {
  fajr: '/fajr-img.jpg',
  sunrise: '/fajr-img.jpg',
  dhuhr: '/dhuhr-img.jpeg',
  asr: '/asr-img.jpg',
  maghrib: '/maghrib-img.jpg',
  isha: '/isha-img.jpg',
};

interface HeroCurrentPrayerProps {
  location: LocationItem;
  status: CurrentPrayerStatus;
  timeFormatted: string;
  currentTime: Date;
  isAudioPlaying: boolean;
  onStopAudio: () => void;
  onOpenLocationModal: () => void;
  onOpenQiblaModal: () => void;
}

function formatLocalTime(date: Date, timezone: string | undefined, locale: string) {
  const fixedOffset = timezone ? FIXED_UTC_OFFSET_MINUTES[timezone] : undefined;
  const targetDate = fixedOffset !== undefined
    ? new Date(date.getTime() + fixedOffset * 60_000)
    : date;
  const timeZone = fixedOffset !== undefined ? 'UTC' : timezone;

  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      ...(timeZone ? { timeZone } : {}),
    }).format(targetDate);
  } catch {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${pad(targetDate.getUTCHours())}:${pad(targetDate.getUTCMinutes())}:${pad(targetDate.getUTCSeconds())}`;
  }
}

export const HeroCurrentPrayer: FC<HeroCurrentPrayerProps> = ({
  location,
  status,
  timeFormatted,
  currentTime,
  isAudioPlaying,
  onStopAudio,
  onOpenLocationModal,
  onOpenQiblaModal,
}) => {
  const { language, t } = useLanguage();
  const nextPrayerMeta = PRAYER_DISPLAY_NAMES[status.nextPrayer] ?? {
    en: status.nextDisplayName,
    ar: status.nextDisplayName,
  };
  const currentPrayerMeta = status.currentPrayer !== 'none'
    ? PRAYER_DISPLAY_NAMES[status.currentPrayer]
    : null;

  const nextPrayerTitle = language === 'ar' ? nextPrayerMeta.ar : nextPrayerMeta.en;
  const currentPrayerTitle = currentPrayerMeta
    ? (language === 'ar' ? currentPrayerMeta.ar : currentPrayerMeta.en)
    : null;
  const localTime = formatLocalTime(
    currentTime,
    location.timezone,
    language === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB'
  );
  const countdown = formatCountdown(status.secondsRemaining, language);
  const progress = Math.max(0, Math.min(100, status.progressPercent));
  const progressDegrees = progress * 3.6;
  const orbitBackground = `conic-gradient(from -90deg, var(--color-accent) 0deg ${progressDegrees}deg, rgba(213,181,111,.12) ${progressDegrees}deg 360deg)`;
  const currentPrayerBackground = PRAYER_BACKGROUNDS[
    status.currentPrayer === 'none' ? 'fajr' : status.currentPrayer
  ];
  const heroStyle: CSSProperties = {
    backgroundImage: [
      'linear-gradient(180deg, rgba(5, 24, 30, 0.18) 0%, rgba(5, 24, 30, 0.38) 55%, rgba(5, 24, 30, 0.78) 100%)',
      'linear-gradient(90deg, rgba(5, 24, 30, 0.58) 0%, rgba(5, 24, 30, 0.2) 74%)',
      `url("${currentPrayerBackground}")`,
    ].join(', '),
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  };

  return (
    <section
      className="celestial-hero px-5 py-6 sm:px-8 sm:py-8 lg:px-10"
      style={heroStyle}
      aria-labelledby="next-prayer-title"
    >
      <div className="relative z-10 flex items-center justify-between gap-3">
        <button
          id="btn-hero-location"
          type="button"
          onClick={onOpenLocationModal}
          className="hero-location min-w-0"
          title={t.clickToChangeCity}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
          <span className="truncate">{formatLocationDisplay(location, language)}</span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <button
            id="btn-hero-qibla"
            type="button"
            onClick={onOpenQiblaModal}
            className="hero-location shrink-0"
            title={t.clickToViewQibla}
            aria-label={t.qiblaCompass}
          >
            <Compass className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
            <span className="hidden sm:inline">{t.qiblaCompass}</span>
          </button>

          {isAudioPlaying ? (
            <button
              id="btn-hero-stop-audio"
              type="button"
              onClick={onStopAudio}
              className="inline-flex shrink-0 items-center gap-2 rounded-[0.65rem] border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
            >
              <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              {t.stopAdhan}
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
        <div className="max-w-2xl">
          <p className="text-sm text-white/55">{t.nextPrayerIn}</p>

          <h2
            id="next-prayer-title"
            className="mt-2 text-[clamp(3.1rem,8vw,5.8rem)] font-medium leading-[0.92] tracking-[-0.07em] text-[#f4f7f2]"
            dir="auto"
          >
            {nextPrayerTitle}
          </h2>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <time
              className="font-mono text-xl font-medium tracking-[-0.035em] text-white/78 sm:text-2xl"
              dateTime={status.nextPrayerTime.toISOString()}
              dir="auto"
            >
              {timeFormatted}
            </time>

            {currentPrayerTitle ? (
              <span className="flex items-center gap-2 text-xs text-white/48">
                <span className="h-3 w-px bg-accent/80" aria-hidden="true" />
                <span>{t.current}:</span>
                <strong className="font-semibold text-white/78">{currentPrayerTitle}</strong>
              </span>
            ) : null}
          </div>
        </div>

        <div
          className="countdown-orbit lg:me-3"
          style={{ background: orbitBackground }}
          aria-label={`${t.timeRemaining}: ${countdown}`}
        >
          <div className="orbit-core">
            <span className="countdown-label">{t.timeRemaining}</span>
            <time
              className="countdown-value my-2.5 max-w-full whitespace-nowrap px-1 text-center"
              dateTime={status.nextPrayerTime.toISOString()}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              aria-live="off"
            >
              {countdown}
            </time>
            <span className="countdown-meta flex items-center gap-1.5">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span className="countdown-local-time font-mono tabular-nums" dir="ltr">{localTime}</span>
              <span className="ms-1 inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" aria-hidden="true" />
                {t.live}
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
