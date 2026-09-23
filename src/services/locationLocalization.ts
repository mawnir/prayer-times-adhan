import { ADMIN_AR, CITY_AR, COUNTRY_AR, SPECIAL_PLACE_AR } from '../data/arabicNames';
import { DayPrayerSchedule, LocationItem } from '../types';

export type AppLanguage = 'en' | 'ar';

let regionDisplayNamesAr: Intl.DisplayNames | null = null;
let regionDisplayNamesArFailed = false;

function getRegionDisplayNamesAr(): Intl.DisplayNames | null {
  if (regionDisplayNamesAr || regionDisplayNamesArFailed) return regionDisplayNamesAr;
  try {
    regionDisplayNamesAr = new Intl.DisplayNames(['ar'], { type: 'region' });
  } catch {
    regionDisplayNamesArFailed = true;
    regionDisplayNamesAr = null;
  }
  return regionDisplayNamesAr;
}

/** Read the active app language outside React (e.g. notification service). */
export function getActiveAppLanguage(): AppLanguage {
  try {
    if (typeof document !== 'undefined' && document.documentElement.lang === 'ar') return 'ar';
    const saved = localStorage.getItem('pt_language');
    if (saved === 'ar' || saved === 'en') return saved;
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('ar')) return 'ar';
  } catch {
    // ignore — fall through to English
  }
  return 'en';
}

export function getCityDisplayName(location: LocationItem, lang: AppLanguage): string {
  if (lang !== 'ar') return location.name;
  return (
    location.nameAr ||
    CITY_AR[location.id] ||
    SPECIAL_PLACE_AR[location.name] ||
    location.name
  );
}

export function getCountryDisplayName(location: LocationItem, lang: AppLanguage): string {
  if (lang !== 'ar') return location.country;
  if (location.countryAr) return location.countryAr;
  const mapped = COUNTRY_AR[location.country] || SPECIAL_PLACE_AR[location.country];
  if (mapped) return mapped;
  // Fallback: derive the Arabic country name from the ISO country code.
  if (location.countryCode) {
    try {
      const display = getRegionDisplayNamesAr()?.of(location.countryCode.toUpperCase());
      if (display) return display;
    } catch {
      // ignore
    }
  }
  return location.country;
}

export function getAdminDisplayName(location: LocationItem, lang: AppLanguage): string | undefined {
  if (!location.admin1) return undefined;
  if (lang !== 'ar') return location.admin1;
  return location.admin1Ar || ADMIN_AR[location.admin1] || location.admin1;
}

/** "City, Country" in the requested language. */
export function formatLocationDisplay(location: LocationItem, lang: AppLanguage): string {
  return `${getCityDisplayName(location, lang)}, ${getCountryDisplayName(location, lang)}`;
}

// --- Muslim / Gregorian date localization -------------------------------

export function getDayName(schedule: DayPrayerSchedule, lang: AppLanguage): string {
  return lang === 'ar' ? schedule.dayNameAr || schedule.dayName : schedule.dayName;
}

export function getMonthName(schedule: DayPrayerSchedule, lang: AppLanguage): string {
  return lang === 'ar' ? schedule.monthNameAr || schedule.monthName : schedule.monthName;
}

export function getDayNumber(schedule: DayPrayerSchedule, lang: AppLanguage): string {
  return lang === 'ar' ? schedule.dayNumberAr || schedule.dayNumber : schedule.dayNumber;
}

/** Hijri (Muslim) date string, e.g. "12 Ramadan 1447 AH" / "12 رمضان 1447هـ". */
export function getHijriDisplay(schedule: DayPrayerSchedule, lang: AppLanguage): string {
  return lang === 'ar' ? schedule.hijriDate.formattedAr : schedule.hijriDate.formatted;
}

/** Short Hijri label for day tabs, e.g. "12 Ramadan" / "12 رمضان". */
export function getHijriShort(
  schedule: DayPrayerSchedule,
  lang: AppLanguage,
  maxMonthChars = 7
): string {
  if (lang === 'ar') {
    return `${schedule.hijriDate.day} ${schedule.hijriDate.monthNameAr}`;
  }
  return `${schedule.hijriDate.day} ${schedule.hijriDate.monthName.slice(0, maxMonthChars)}`;
}

/** Gregorian "Weekday, Mon Day" / "الأحد، 12 أكتوبر" style label. */
export function getGregorianDisplay(schedule: DayPrayerSchedule, lang: AppLanguage): string {
  if (lang === 'ar') {
    return `${getDayName(schedule, lang)}، ${getDayNumber(schedule, lang)} ${getMonthName(schedule, lang)}`;
  }
  return `${getDayName(schedule, lang)}, ${getMonthName(schedule, lang)} ${getDayNumber(schedule, lang)}`;
}
