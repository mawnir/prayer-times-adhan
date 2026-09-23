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

const ARABIC_LOCALE = 'ar-SA-u-nu-latn';
const ARABIC_NUMBER_FORMATTER = new Intl.NumberFormat(ARABIC_LOCALE, { useGrouping: false });

export const PRAYER_DISPLAY_NAMES: Record<PrayerKey, { en: string; ar: string; meaning: string; meaningAr: string }> = {
  fajr: { en: 'Fajr', ar: 'الفجر', meaning: 'Dawn Prayer', meaningAr: 'صلاة الفجر' },
  sunrise: { en: 'Sunrise', ar: 'الشروق', meaning: 'Shuruq', meaningAr: 'وقت الشروق' },
  dhuhr: { en: 'Dhuhr', ar: 'الظهر', meaning: 'Noon Prayer', meaningAr: 'صلاة الظهر' },
  asr: { en: 'Asr', ar: 'العصر', meaning: 'Afternoon Prayer', meaningAr: 'صلاة العصر' },
  maghrib: { en: 'Maghrib', ar: 'المغرب', meaning: 'Sunset Prayer', meaningAr: 'صلاة المغرب' },
  isha: { en: 'Isha', ar: 'العشاء', meaning: 'Night Prayer', meaningAr: 'صلاة العشاء' },
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
export function getHijriDate(date: Date, timezone?: string): {
  day: number;
  monthName: string;
  monthNameAr: string;
  monthIndex: number;
  year: number;
  formatted: string;
  formattedAr: string;
} {
  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
  ];
  const hijriMonthsAr = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  const toArDigits = (n: number) => ARABIC_NUMBER_FORMATTER.format(n);

  const buildResult = (day: number, monthIndex: number, year: number) => {
    const monthName = hijriMonths[monthIndex] || 'Islamic Month';
    const monthNameAr = hijriMonthsAr[monthIndex] || 'شهر هجري';
    return {
      day,
      monthName,
      monthNameAr,
      monthIndex,
      year,
      formatted: `${day} ${monthName} ${year} AH`,
      formattedAr: `${toArDigits(day)} ${monthNameAr} ${toArDigits(year)}هـ`,
    };
  };

  try {
    // Use Intl.DateTimeFormat with islamic-umalqura calendar if supported
    const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      ...(timezone ? { timeZone: timezone } : {}),
    });
    const parts = formatter.formatToParts(date);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const monthIndex = Math.max(0, Math.min(11, parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1));
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1448', 10);

    return buildResult(day, monthIndex, year);
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
    return buildResult(d, Math.max(0, Math.min(11, m - 1)), y);
  }
}

function getZonedDateParts(date: Date, timezone?: string): { year: number; month: number; day: number } {
  const fixedOffset = timezone ? FIXED_UTC_OFFSET_MINUTES[timezone] : undefined;
  if (fixedOffset !== undefined) {
    const shifted = new Date(date.getTime() + fixedOffset * 60_000);
    return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
  }
  if (!timezone) {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, year: 'numeric', month: 'numeric', day: 'numeric',
    }).formatToParts(date);
    const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
    return { year: read('year'), month: read('month'), day: read('day') };
  } catch {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }
}

function formatDate(date: Date, locale: string, options: Intl.DateTimeFormatOptions, timezone?: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { ...options, ...(timezone ? { timeZone: timezone } : {}) }).format(date);
  } catch {
    return new Intl.DateTimeFormat(locale, options).format(date);
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

  const dateParts = getZonedDateParts(date, location.timezone);
  const currentParts = getZonedDateParts(new Date(), location.timezone);
  const year = dateParts.year;
  const month = String(dateParts.month).padStart(2, '0');
  const day = String(dateParts.day).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;
  const isToday = currentParts.year === year && currentParts.month === dateParts.month && currentParts.day === dateParts.day;

  const dayName = formatDate(date, 'en-US', { weekday: 'short' }, location.timezone);
  const dayNumber = formatDate(date, 'en-US', { day: 'numeric' }, location.timezone);
  const monthName = formatDate(date, 'en-US', { month: 'short' }, location.timezone);
  // Pin both the Gregorian calendar and Latin digits so these are Arabic
  // Gregorian fields without Arabic-Indic numerals (Hijri lives in `hijriDate`).
  const arabicGregorianLocale = `${ARABIC_LOCALE}-ca-gregory`;
  const dayNameAr = formatDate(date, arabicGregorianLocale, { weekday: 'short' }, location.timezone);
  const dayNumberAr = formatDate(date, arabicGregorianLocale, { day: 'numeric' }, location.timezone);
  const monthNameAr = formatDate(date, arabicGregorianLocale, { month: 'short' }, location.timezone);

  return {
    date,
    dateKey,
    dayName,
    dayNumber,
    monthName,
    dayNameAr,
    dayNumberAr,
    monthNameAr,
    isToday,
    hijriDate: getHijriDate(date, location.timezone),
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
  const today = getZonedDateParts(startDate, location.timezone);
  const baseDate = new Date(today.year, today.month - 1, today.day, 12, 0, 0, 0);

  for (let i = 0; i < 8; i++) {
    const targetDate = new Date(baseDate);
    targetDate.setDate(baseDate.getDate() + i);
    schedule.push(calculateDayPrayerSchedule(location, targetDate, settings));
  }

  return schedule;
}

// Morocco moved to UTC+00:00 in September 2026, but many browsers/OS still
// ship stale IANA data that resolves these zones as UTC+01:00. Pin them to a
// fixed UTC offset so all clocks (prayer times + current time) render
// correctly and consistently regardless of tzdata.
export const FIXED_UTC_OFFSET_MINUTES: Record<string, number> = {
  'Africa/Casablanca': 0,
  'Africa/El_Aaiun': 0,
};

export function formatPrayerTime(
  date: Date | undefined,
  timeFormat: '12h' | '24h',
  timezone?: string,
  locale: string = 'en-US'
): string {
  if (!date || isNaN(date.getTime())) return '--:--';

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  };

  const fixedOffset = timezone ? FIXED_UTC_OFFSET_MINUTES[timezone] : undefined;
  if (fixedOffset !== undefined) {
    // Render the wall clock for that fixed offset deterministically, without
    // relying on the browser's (possibly stale) timezone database.
    const shifted = new Date(date.getTime() + fixedOffset * 60000);
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(shifted);
  }

  if (timezone) {
    try {
      options.timeZone = timezone;
    } catch {
      // fallback to local if timezone string is invalid
    }
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}

const countdownFormatters = {
  en: new Intl.NumberFormat('en-US', { minimumIntegerDigits: 2, useGrouping: false }),
  ar: new Intl.NumberFormat(ARABIC_LOCALE, { minimumIntegerDigits: 2, useGrouping: false }),
};

export function formatCountdown(totalSeconds: number, language: 'en' | 'ar'): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const number = (value: number) => countdownFormatters[language].format(value);
  const units = language === 'ar' ? { h: 'س', m: 'د', s: 'ث' } : { h: 'h', m: 'm', s: 's' };
  const parts = hours > 0
    ? [`${number(hours)}${units.h}`, `${number(minutes)}${units.m}`, `${number(seconds)}${units.s}`]
    : minutes > 0
      ? [`${number(minutes)}${units.m}`, `${number(seconds)}${units.s}`]
      : [`${number(seconds)}${units.s}`];

  return parts.join(' ');
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
