import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  Prayer,
  PrayerTimes,
  Qibla,
  SunnahTimes,
} from 'adhan';
import {
  CalculationSettings,
  CurrentPrayerStatus,
  DayPrayerSchedule,
  FardhPrayerKey,
  LocationItem,
  PrayerKey,
} from '../types';

export const PRAYER_DISPLAY_NAMES: Record<PrayerKey, { en: string; ar: string; meaning: string }> = {
  fajr: { en: 'Fajr', ar: 'الفجر', meaning: 'Dawn Prayer' },
  sunrise: { en: 'Sunrise', ar: 'الشروق', meaning: 'Shuruq' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر', meaning: 'Noon Prayer' },
  asr: { en: 'Asr', ar: 'العصر', meaning: 'Afternoon Prayer' },
  maghrib: { en: 'Maghrib', ar: 'المغرب', meaning: 'Sunset Prayer' },
  isha: { en: 'Isha', ar: 'العشاء', meaning: 'Night Prayer' },
};

export const FARDH_PRAYERS: FardhPrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function getCalculationParameters(settings: CalculationSettings): CalculationParameters {
  let params: CalculationParameters;

  switch (settings.method) {
    case 'MuslimWorldLeague':
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Dubai':
      params = CalculationMethod.Dubai();
      break;
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'Kuwait':
      params = CalculationMethod.Kuwait();
      break;
    case 'Qatar':
      params = CalculationMethod.Qatar();
      break;
    case 'Singapore':
      params = CalculationMethod.Singapore();
      break;
    case 'Tehran':
      params = CalculationMethod.Tehran();
      break;
    case 'Turkey':
      params = CalculationMethod.Turkey();
      break;
    default:
      params = CalculationMethod.MuslimWorldLeague();
  }

  // Set Madhab (Asr shadow factor)
  if (settings.madhab === 'hanafi') {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }

  // Set HighLatitudeRule
  if (settings.highLatitudeRule === 'middleOfTheNight') {
    params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  } else if (settings.highLatitudeRule === 'seventhOfTheNight') {
    params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;
  } else {
    params.highLatitudeRule = HighLatitudeRule.TwilightAngle;
  }

  return params;
}

// Convert Gregorian to Hijri accurately
export function getHijriDate(date: Date): { day: number; monthName: string; year: number; formatted: string } {
  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
  ];

  try {
    // Use Intl.DateTimeFormat with islamic-umalqura calendar if supported
    const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const monthIndex = Math.max(0, Math.min(11, parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1));
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1448', 10);
    const monthName = hijriMonths[monthIndex] || 'Islamic Month';

    return {
      day,
      monthName,
      year,
      formatted: `${day} ${monthName} ${year} AH`,
    };
  } catch {
    // Fallback astronomical calculation
    const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
    const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const m = Math.floor((24 * l3) / 709);
    const d = l3 - Math.floor((709 * m) / 24);
    const y = 30 * n + j - 30;
    const monthName = hijriMonths[Math.max(0, Math.min(11, m - 1))] || 'Ramadan';
    return {
      day: d,
      monthName,
      year: y,
      formatted: `${d} ${monthName} ${y} AH`,
    };
  }
}

export function calculateDayPrayerSchedule(
  location: LocationItem,
  date: Date,
  settings: CalculationSettings
): DayPrayerSchedule {
  const coords = new Coordinates(location.latitude, location.longitude);
  const params = getCalculationParameters(settings);

  // We set calculation date
  const pt = new PrayerTimes(coords, date, params);
  const sunnah = new SunnahTimes(pt);

  // Apply manual adjustments in minutes
  const applyOffset = (d: Date, minutes: number) => {
    return new Date(d.getTime() + (minutes || 0) * 60000);
  };

  const prayers = {
    fajr: applyOffset(pt.fajr, settings.manualOffsets.fajr),
    sunrise: applyOffset(pt.sunrise, settings.manualOffsets.sunrise),
    dhuhr: applyOffset(pt.dhuhr, settings.manualOffsets.dhuhr),
    asr: applyOffset(pt.asr, settings.manualOffsets.asr),
    maghrib: applyOffset(pt.maghrib, settings.manualOffsets.maghrib),
    isha: applyOffset(pt.isha, settings.manualOffsets.isha),
  };

  const isToday = new Date().toDateString() === date.toDateString();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.toLocaleDateString('en-US', { day: 'numeric' });
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });

  return {
    date,
    dateKey,
    dayName,
    dayNumber,
    monthName,
    isToday,
    hijriDate: getHijriDate(date),
    prayers,
    qiyam: sunnah.lastThirdOfTheNight,
    midnight: sunnah.middleOfTheNight,
  };
}

// Calculate schedule for today and next 7 days (8 days total: today + 7 upcoming days)
export function calculateWeekSchedule(
  location: LocationItem,
  settings: CalculationSettings,
  startDate: Date = new Date()
): DayPrayerSchedule[] {
  const schedule: DayPrayerSchedule[] = [];
  const baseDate = new Date(startDate);
  baseDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 8; i++) {
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + i);
    schedule.push(calculateDayPrayerSchedule(location, targetDate, settings));
  }

  return schedule;
}

export function formatPrayerTime(
  date: Date | undefined,
  timeFormat: '12h' | '24h',
  timezone?: string
): string {
  if (!date || isNaN(date.getTime())) return '--:--';

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  };

  if (timezone) {
    try {
      options.timeZone = timezone;
    } catch {
      // fallback to local if timezone string is invalid
    }
  }

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function getCurrentPrayerStatus(
  todaySchedule: DayPrayerSchedule,
  tomorrowSchedule: DayPrayerSchedule,
  now: Date = new Date()
): CurrentPrayerStatus {
  const p = todaySchedule.prayers;
  const nowMs = now.getTime();

  let currentPrayer: PrayerKey = 'fajr';
  let nextPrayer: PrayerKey = 'fajr';
  let nextPrayerTime: Date = p.fajr;
  let prevPrayerTime: Date = p.fajr;

  if (nowMs < p.fajr.getTime()) {
    // Before Fajr today: current is Isha from yesterday, next is Fajr today
    currentPrayer = 'isha';
    nextPrayer = 'fajr';
    nextPrayerTime = p.fajr;
    prevPrayerTime = new Date(p.fajr.getTime() - 7 * 3600000);
  } else if (nowMs >= p.fajr.getTime() && nowMs < p.sunrise.getTime()) {
    currentPrayer = 'fajr';
    nextPrayer = 'sunrise';
    nextPrayerTime = p.sunrise;
    prevPrayerTime = p.fajr;
  } else if (nowMs >= p.sunrise.getTime() && nowMs < p.dhuhr.getTime()) {
    currentPrayer = 'sunrise';
    nextPrayer = 'dhuhr';
    nextPrayerTime = p.dhuhr;
    prevPrayerTime = p.sunrise;
  } else if (nowMs >= p.dhuhr.getTime() && nowMs < p.asr.getTime()) {
    currentPrayer = 'dhuhr';
    nextPrayer = 'asr';
    nextPrayerTime = p.asr;
    prevPrayerTime = p.dhuhr;
  } else if (nowMs >= p.asr.getTime() && nowMs < p.maghrib.getTime()) {
    currentPrayer = 'asr';
    nextPrayer = 'maghrib';
    nextPrayerTime = p.maghrib;
    prevPrayerTime = p.asr;
  } else if (nowMs >= p.maghrib.getTime() && nowMs < p.isha.getTime()) {
    currentPrayer = 'maghrib';
    nextPrayer = 'isha';
    nextPrayerTime = p.isha;
    prevPrayerTime = p.maghrib;
  } else {
    // After Isha: next prayer is tomorrow's Fajr
    currentPrayer = 'isha';
    nextPrayer = 'fajr';
    nextPrayerTime = tomorrowSchedule.prayers.fajr;
    prevPrayerTime = p.isha;
  }

  const secondsRemaining = Math.max(0, Math.floor((nextPrayerTime.getTime() - nowMs) / 1000));
  const totalWindowSec = Math.max(1, Math.floor((nextPrayerTime.getTime() - prevPrayerTime.getTime()) / 1000));
  const elapsedSec = Math.max(0, totalWindowSec - secondsRemaining);
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedSec / totalWindowSec) * 100)));

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  let timeRemainingFormatted = '';
  if (hours > 0) {
    timeRemainingFormatted = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    timeRemainingFormatted = `${minutes}m ${seconds}s`;
  } else {
    timeRemainingFormatted = `${seconds}s`;
  }

  return {
    currentPrayer,
    currentDisplayName: PRAYER_DISPLAY_NAMES[currentPrayer].en,
    nextPrayer,
    nextDisplayName: PRAYER_DISPLAY_NAMES[nextPrayer].en,
    nextPrayerTime,
    secondsRemaining,
    timeRemainingFormatted,
    progressPercent,
  };
}

export function getQiblaInfo(location: LocationItem): { angle: number; cardinal: string } {
  const coords = new Coordinates(location.latitude, location.longitude);
  const angle = Math.round(Qibla(coords));

  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(angle / 45) % 8;
  const cardinal = cardinals[index];

  return {
    angle,
    cardinal,
  };
}
