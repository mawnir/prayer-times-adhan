import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  allCities: string;
  searchCityPlaceholder: string;
  muteAudio: string;
  unmuteAudio: string;
  notificationSettings: string;
  qiblaCompass: string;
  calculationSettings: string;
  switchToDarkMode: string;
  switchToLightMode: string;
  english: string;
  arabic: string;
  // Hero & General
  currentPrayer: string;
  nextPrayer: string;
  nextPrayerIn: string;
  timeRemaining: string;
  until: string;
  fastingDuration: string;
  fastingWindow: string;
  qiblaDirection: string;
  scheduleTitle: string;
  scheduleSubtitle: string;
  nextWeek: string;
  table: string;
  weeklyTable: string;
  cards: string;
  dayInspector: string;
  day: string;
  today: string;
  tomorrow: string;
  manageCities: string;
  changeLocation: string;
  qibla: string;
  clickToChangeCity: string;
  clickToViewQibla: string;
  stopAdhan: string;
  adhanPlaying: string;
  current: string;
  next: string;
  currentTime: string;
  live: string;
  hoursShort: string;
  tableHint: string;
  tableCalculatedFor: string;
  dateAndDay: string;
  fasting: string;
  obligatory: string;
  suhoorEnds: string;
  iftarSunset: string;
  shuruq: string;
  close: string;
  save: string;
  cancel: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'Prayer Times',
    appSubtitle: 'Live countdowns, weekly times, and adhan alerts',
    allCities: 'All Cities',
    searchCityPlaceholder: 'Search city...',
    muteAudio: 'Mute Adhan Audio',
    unmuteAudio: 'Unmute Adhan Audio',
    notificationSettings: 'Adhan Notification Settings',
    qiblaCompass: 'Qibla Compass Direction',
    calculationSettings: 'Calculation Methods & Adjustments',
    switchToDarkMode: 'Switch to dark theme',
    switchToLightMode: 'Switch to light theme',
    english: 'EN',
    arabic: 'العربية',
    currentPrayer: 'Current Prayer',
    nextPrayer: 'Next Prayer',
    nextPrayerIn: 'Next Prayer In',
    timeRemaining: 'Time Remaining',
    until: 'until',
    fastingDuration: 'Fasting Duration',
    fastingWindow: 'Fasting window',
    qiblaDirection: 'Qibla Direction',
    scheduleTitle: 'Prayer schedule',
    scheduleSubtitle: 'Prayer times for {city}, {country} across the next 7 days',
    nextWeek: 'Next 7 days',
    table: 'Table',
    weeklyTable: 'Week',
    cards: 'Cards',
    dayInspector: 'Selected day',
    day: 'Day',
    today: 'Today',
    tomorrow: 'Tomorrow',
    manageCities: 'Manage Cities',
    changeLocation: 'Change',
    qibla: 'Qibla',
    clickToChangeCity: 'Click to search and change to any city worldwide',
    clickToViewQibla: 'Click to view Qibla Compass',
    stopAdhan: 'Stop Adhan',
    adhanPlaying: 'Adhan audio playing...',
    current: 'Current',
    next: 'Next',
    currentTime: 'Current Time',
    live: 'Live',
    hoursShort: 'hrs',
    tableHint: 'Select any day to inspect its times',
    tableCalculatedFor: 'Calculated for',
    dateAndDay: 'Date & Day',
    fasting: 'Fasting',
    obligatory: 'Obligatory',
    suhoorEnds: 'Suhoor ends',
    iftarSunset: 'Iftar / Sunset',
    shuruq: 'Shuruq',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
  },
  ar: {
    appTitle: 'أوقات الصلاة',
    appSubtitle: 'عدّاد مباشر ومواقيت أسبوعية وتنبيهات الأذان',
    allCities: 'جميع المدن',
    searchCityPlaceholder: 'ابحث عن مدينة...',
    muteAudio: 'كتم صوت الأذان',
    unmuteAudio: 'تشغيل صوت الأذان',
    notificationSettings: 'إعدادات تنبيهات الأذان',
    qiblaCompass: 'اتجاه القبلة',
    calculationSettings: 'طرق الحساب والتعديلات',
    switchToDarkMode: 'التبديل إلى المظهر الداكن',
    switchToLightMode: 'التبديل إلى المظهر الفاتح',
    english: 'EN',
    arabic: 'العربية',
    currentPrayer: 'الصلاة الحالية',
    nextPrayer: 'الصلاة القادمة',
    nextPrayerIn: 'الصلاة القادمة في',
    timeRemaining: 'الوقت المتبقي',
    until: 'حتى',
    fastingDuration: 'مدة الصيام',
    fastingWindow: 'فترة الصيام',
    qiblaDirection: 'اتجاه القبلة',
    scheduleTitle: 'جدول الصلاة',
    scheduleSubtitle: 'مواقيت الصلاة في {city}، {country} للأيام السبعة القادمة',
    nextWeek: 'الأيام السبعة القادمة',
    table: 'جدول',
    weeklyTable: 'الأسبوع',
    cards: 'بطاقات',
    dayInspector: 'اليوم المحدد',
    day: 'اليوم',
    today: 'اليوم',
    tomorrow: 'غداً',
    manageCities: 'إدارة المدن',
    changeLocation: 'تغيير',
    qibla: 'القبلة',
    clickToChangeCity: 'انقر للبحث واختيار أي مدينة حول العالم',
    clickToViewQibla: 'انقر لعرض بوصلة القبلة',
    stopAdhan: 'إيقاف الأذان',
    adhanPlaying: 'جاري تشغيل صوت الأذان...',
    current: 'الحالية',
    next: 'القادمة',
    currentTime: 'الوقت الحالي',
    live: 'مباشر',
    hoursShort: 'ساعة',
    tableHint: 'اختر أي يوم لعرض مواقيته',
    tableCalculatedFor: 'محسوب لـ',
    dateAndDay: 'التاريخ واليوم',
    fasting: 'الصيام',
    obligatory: 'فرض',
    suhoorEnds: 'نهاية السحور',
    iftarSunset: 'الإفطار / الغروب',
    shuruq: 'الشروق',
    close: 'إغلاق',
    save: 'حفظ',
    cancel: 'إلغاء',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('pt_language');
      if (saved === 'ar' || saved === 'en') return saved;
      // Auto-detect browser language
      if (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('ar')) {
        return 'ar';
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('pt_language', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
    isRTL: language === 'ar',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
