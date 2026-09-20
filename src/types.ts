export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type FardhPrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface LocationItem {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  admin1?: string; // state / province / governorate
  countryCode?: string;
  isDefault?: boolean;
}

export type AdhanSoundType = 
  | 'makkah_adhan'
  | 'madinah_adhan'
  | 'takbeer'
  | 'spiritual_chime'
  | 'gentle_beep'
  | 'silent';

export interface PrayerNotificationConfig {
  enabled: boolean;
  sound: AdhanSoundType;
  leadTimeMinutes: number; // 0 = at exact time, 5 = 5 min before, etc.
}

export interface NotificationSettings {
  masterEnabled: boolean;
  volume: number; // 0.0 to 1.0
  autoPlayAudio: boolean;
  showBrowserNotification: boolean;
  perPrayer: Record<FardhPrayerKey, PrayerNotificationConfig>;
}

export type CalculationMethodKey =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'NorthAmerica'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey';

export type MadhabKey = 'shafi' | 'hanafi';

export type HighLatitudeRuleKey = 'middleOfTheNight' | 'seventhOfTheNight' | 'twilightAngle';

export interface CalculationSettings {
  method: CalculationMethodKey;
  madhab: MadhabKey;
  highLatitudeRule: HighLatitudeRuleKey;
  timeFormat: '12h' | '24h';
  manualOffsets: Record<PrayerKey, number>; // in minutes, e.g. -2 or +3
}

export interface DayPrayerSchedule {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayName: string;
  dayNumber: string;
  monthName: string;
  isToday: boolean;
  hijriDate: {
    day: number;
    monthName: string;
    year: number;
    formatted: string;
  };
  prayers: {
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
  };
  qiyam?: Date;
  midnight?: Date;
}

export interface ActiveAdhanAlert {
  prayerName: PrayerKey;
  prayerDisplayName: string;
  locationName: string;
  time: Date;
  isLeadReminder: boolean;
  leadMinutes: number;
}

export interface CurrentPrayerStatus {
  currentPrayer: PrayerKey | 'none';
  currentDisplayName: string;
  nextPrayer: PrayerKey;
  nextDisplayName: string;
  nextPrayerTime: Date;
  secondsRemaining: number;
  timeRemainingFormatted: string;
  progressPercent: number; // 0 to 100
}
