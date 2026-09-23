import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'ar';

const translations = {
  en: {
    appTitle: 'Prayer Times',
    appSubtitle: 'Live countdowns, weekly times, and adhan alerts',
    allCities: 'All Cities',
    searchCityPlaceholder: 'Search city...',
    muteAudio: 'Mute Adhan Audio',
    unmuteAudio: 'Unmute Adhan Audio',
    notificationSettings: 'Adhan Notification Settings',
    qiblaCompass: 'Qibla Direction',
    calculationSettings: 'Calculation Methods & Adjustments',
    switchToDarkMode: 'Switch to dark theme',
    switchToLightMode: 'Switch to light theme',
    english: 'EN',
    arabic: 'العربية',
    currentPrayer: 'Current Prayer',
    nextPrayer: 'Next Prayer',
    nextPrayerIn: 'Next Prayer:',
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
    language: 'Language',
    choosePrayerLocation: 'Choose prayer location',
    settingsNavigation: 'Settings',
    loadingSchedule: 'Loading schedule…',
    scheduleView: 'Schedule view',
    chooseDay: 'Choose a day',
    locations: {
      title: 'Prayer locations', subtitle: 'Search, save, and compare cities around the world.', close: 'Close locations',
      searchTab: 'Search All Cities', savedTab: 'My Saved Cities', compareTab: 'Multi-City Timetable', customTab: 'Custom coordinates',
      placeholder: 'Search by city or country', searching: 'Searching cities…', found: 'Found {count} matching cities worldwide', popular: 'Popular cities are shown. Type any place to search worldwide.',
      gps: 'Use Current GPS', locating: 'Locating…', gpsUnsupported: 'Geolocation is not supported by your browser.', gpsError: 'Unable to retrieve your location. Check browser permissions.',
      filterRegion: 'Filter by region', noResults: 'No cities found matching “{query}”', noResultsHint: 'Check the spelling or add custom coordinates in the Custom coordinates tab.',
      active: 'Active', selected: 'Selected', selectCity: 'Select City', savedCities: 'Saved cities', searchAdd: 'Search & Add More Cities', setActive: 'Set Active', remove: 'Remove from saved',
      compareDescription: "Compare today's five prayer times across all your saved cities at a glance:", switchCity: 'Switch to this city',
      detectGps: 'Detect via GPS', detectGpsDescription: 'Fetch your exact device coordinates automatically', autoDetect: 'Auto Detect GPS',
      addCoordinates: 'Add custom coordinates', cityName: 'Location / City Name', cityPlaceholder: 'e.g. Oxford, Cambridge, My Town', countryName: 'Country / Territory', countryPlaceholder: 'e.g. United Kingdom',
      latitude: 'Latitude (-90 to +90)', longitude: 'Longitude (-180 to +180)', saveActive: 'Save & Set Active', activeLocation: 'Active:', done: 'Done',
    },
    notifications: {
      title: 'Adhan & notification settings', subtitle: 'Choose a sound and reminder time for each prayer.', close: 'Close settings',
      master: 'Master adhan notifications', masterDescription: 'Enable or pause all prayer alarms and notifications', volume: 'Adhan audio volume',
      browser: 'Browser notifications', status: 'Status:', granted: 'Enabled (Permissions Granted)', denied: 'Blocked by Browser', required: 'Permission Required', enable: 'Enable in browser',
      perPrayer: 'Per-prayer sounds & lead times', perPrayerHint: 'A custom sound for all five prayers', prayerSound: '{prayer} notification sound', prayerLead: '{prayer} reminder lead time',
      stopAudio: 'Stop Audio', preview: 'Preview this sound', atTime: 'At Prayer Time', minutesBefore: '{count} min before', test: 'Test adhan', saveClose: 'Save & close',
    },
    calculation: {
      title: 'Calculation settings', subtitle: 'Match your local mosque and preferred method.', close: 'Close settings', timeFormat: 'Time format', timeFormatDescription: 'Toggle between 12-hour (AM/PM) and 24-hour format',
      twelveHour: '12-Hour', twentyFourHour: '24-Hour', asrMethod: 'Asr calculation method', standard: 'Standard (Shafi’i, Maliki, Hanbali)', standardDescription: 'Shadow length equals object height (1× shadow ratio).',
      hanafi: 'Hanafi', hanafiDescription: 'Shadow length equals twice the object height (2× shadow ratio, later Asr).', method: 'Calculation method', selected: 'Selected',
      adjustments: 'Minute adjustments', adjustmentsDescription: 'Calibrate prayer times to match your local mosque (+/- minutes)', reset: 'Reset', methodLabel: 'Method:', apply: 'Apply settings', minutes: 'min',
    },
    adhan: {
      leadTime: '{count} minutes before prayer', prayerTime: 'Prayer time', close: 'Close adhan alert', prepare: 'Prepare for {prayer}', now: '{prayer} is now', playing: 'Adhan is playing', translation: '“Allah is the Greatest. I bear witness that there is no deity worthy of worship except Allah.”',
      dua: 'Dua after the adhan', stop: 'Stop adhan', stopClose: 'Stop and close', closeAlert: 'Close alert',
    },
    qibla: {
      from: 'From {location}', close: 'Close compass', angle: 'Qibla angle', distance: 'Distance to Makkah', km: 'km', instruction: 'Turn {direction} from true north toward the Kaaba.', closeCompass: 'Close compass',
      directions: { N: 'North', NE: 'Northeast', E: 'East', SE: 'Southeast', S: 'South', SW: 'Southwest', W: 'West', NW: 'Northwest' },
    },
  },
  ar: {
    appTitle: 'أوقات الصلاة', appSubtitle: 'عدّاد مباشر ومواقيت أسبوعية وتنبيهات الأذان', allCities: 'جميع المدن', searchCityPlaceholder: 'ابحث عن مدينة...', muteAudio: 'كتم صوت الأذان', unmuteAudio: 'تشغيل صوت الأذان', notificationSettings: 'إعدادات تنبيهات الأذان', qiblaCompass: 'اتجاه القبلة', calculationSettings: 'طرق الحساب والتعديلات', switchToDarkMode: 'التبديل إلى المظهر الداكن', switchToLightMode: 'التبديل إلى المظهر الفاتح', english: 'EN', arabic: 'العربية',
    currentPrayer: 'الصلاة الحالية', nextPrayer: 'الصلاة القادمة', nextPrayerIn: 'الصلاة القادمة:', timeRemaining: 'الوقت المتبقي', until: 'حتى', fastingDuration: 'مدة الصيام', fastingWindow: 'فترة الصيام', qiblaDirection: 'اتجاه القبلة', scheduleTitle: 'جدول الصلاة', scheduleSubtitle: 'مواقيت الصلاة في {city}، {country} للأيام السبعة القادمة', nextWeek: 'الأيام السبعة القادمة', table: 'جدول', weeklyTable: 'الأسبوع', cards: 'بطاقات', dayInspector: 'اليوم المحدد', day: 'اليوم', today: 'اليوم', tomorrow: 'غداً', manageCities: 'إدارة المدن', changeLocation: 'تغيير', clickToChangeCity: 'انقر للبحث واختيار أي مدينة حول العالم', clickToViewQibla: 'انقر لعرض بوصلة القبلة', stopAdhan: 'إيقاف الأذان', adhanPlaying: 'جاري تشغيل صوت الأذان...', current: 'الحالية', next: 'القادمة', currentTime: 'الوقت الحالي', live: 'مباشر', hoursShort: 'س', tableHint: 'اختر أي يوم لعرض مواقيته', tableCalculatedFor: 'محسوب لـ', dateAndDay: 'التاريخ واليوم', fasting: 'الصيام', obligatory: 'فرض', suhoorEnds: 'نهاية السحور', iftarSunset: 'الإفطار / الغروب', shuruq: 'الشروق', close: 'إغلاق', save: 'حفظ', cancel: 'إلغاء', language: 'اللغة', choosePrayerLocation: 'اختر موقع الصلاة', settingsNavigation: 'الإعدادات', loadingSchedule: 'جارٍ تحميل الجدول…', scheduleView: 'طريقة عرض الجدول', chooseDay: 'اختر يوماً',
    locations: { title: 'مواقع الصلاة', subtitle: 'ابحث عن المدن واحفظها وقارن مواقيتها حول العالم.', close: 'إغلاق المواقع', searchTab: 'البحث في كل المدن', savedTab: 'مدنّي المحفوظة', compareTab: 'مقارنة عدة مدن', customTab: 'إحداثيات مخصصة', placeholder: 'ابحث باسم المدينة أو الدولة', searching: 'جارٍ البحث عن المدن…', found: 'تم العثور على {count} مدينة مطابقة حول العالم', popular: 'تعرض المدن الشائعة. اكتب أي مكان للبحث حول العالم.', gps: 'استخدم الموقع الحالي', locating: 'جارٍ تحديد الموقع…', gpsUnsupported: 'متصفحك لا يدعم تحديد الموقع.', gpsError: 'تعذر تحديد موقعك. تحقق من أذونات المتصفح.', filterRegion: 'تصفية حسب المنطقة', noResults: 'لم يتم العثور على مدينة تطابق “{query}”', noResultsHint: 'تحقق من الإملاء أو أضف إحداثيات مخصصة في تبويب الإحداثيات المخصصة.', active: 'نشط', selected: 'محدد', selectCity: 'اختر المدينة', savedCities: 'المدن المحفوظة', searchAdd: 'ابحث وأضف المزيد', setActive: 'تعيين كنشط', remove: 'إزالة من المحفوظات', compareDescription: 'قارن مواقيت الصلوات الخمس اليوم بين جميع مدنك المحفوظة:', switchCity: 'التبديل إلى هذه المدينة', detectGps: 'الكشف عبر GPS', detectGpsDescription: 'احصل على إحداثيات جهازك بدقة تلقائياً', autoDetect: 'الكشف التلقائي عبر GPS', addCoordinates: 'إضافة إحداثيات مخصصة', cityName: 'اسم الموقع / المدينة', cityPlaceholder: 'مثال: أكسفورد، كامبريدج، مدينتي', countryName: 'الدولة / الإقليم', countryPlaceholder: 'مثال: المملكة المتحدة', latitude: 'خط العرض (-90 إلى +90)', longitude: 'خط الطول (-180 إلى +180)', saveActive: 'حفظ وتعيين كنشط', activeLocation: 'النشط:', done: 'تم' },
    notifications: { title: 'إعدادات الأذان والتنبيهات', subtitle: 'اختر الصوت ووقت التذكير لكل صلاة.', close: 'إغلاق الإعدادات', master: 'تنبيهات الأذان الرئيسية', masterDescription: 'تفعيل أو إيقاف جميع منبهات الصلاة والتنبيهات', volume: 'مستوى صوت الأذان', browser: 'تنبيهات المتصفح', status: 'الحالة:', granted: 'مفعّلة (تم منح الإذن)', denied: 'محظورة من المتصفح', required: 'يتطلب الإذن', enable: 'التفعيل في المتصفح', perPrayer: 'أصوات التنبيه ومقدمتها لكل صلاة', perPrayerHint: 'صوت مخصص للصلوات الخمس', prayerSound: 'صوت تنبيه {prayer}', prayerLead: 'مقدّم تذكير {prayer}', stopAudio: 'إيقاف الصوت', preview: 'معاينة هذا الصوت', atTime: 'عند دخول وقت الصلاة', minutesBefore: 'قبل {count} دقيقة', test: 'تجربة الأذان', saveClose: 'حفظ وإغلاق' },
    calculation: { title: 'إعدادات الحساب', subtitle: 'اختر ما يناسب مسجدك المحلي والطريقة المفضلة لديك.', close: 'إغلاق الإعدادات', timeFormat: 'تنسيق الوقت', timeFormatDescription: 'التبديل بين نظام 12 ساعة ونظام 24 ساعة', twelveHour: '12 ساعة', twentyFourHour: '24 ساعة', asrMethod: 'طريقة حساب صلاة العصر', standard: 'القياسية (الجمهور، المالكية، الحنابلة)', standardDescription: 'طول الظل يساوي طول الجسم (معدل ظل 1×).', hanafi: 'الحنفية', hanafiDescription: 'طول الظل يساوي ضعف طول الجسم (معدل ظل 2×، ويتأخر العصر).', method: 'طريقة الحساب', selected: 'محدد', adjustments: 'التعديل بالدقائق', adjustmentsDescription: 'اضبط المواقيت لمطابقة مسجدك المحلي (± دقائق)', reset: 'إعادة ضبط', methodLabel: 'الطريقة:', apply: 'تطبيق الإعدادات', minutes: 'د' },
    adhan: { leadTime: 'قبل الصلاة بـ {count} دقيقة', prayerTime: 'حان وقت الصلاة', close: 'إغلاق تنبيه الأذان', prepare: 'استعد لصلاة {prayer}', now: 'حان الآن وقت صلاة {prayer}', playing: 'جارٍ تشغيل الأذان', translation: '«الله أكبر، أشهد أن لا إله إلا الله».', dua: 'الدعاء بعد الأذان', stop: 'إيقاف الأذان', stopClose: 'إيقاف وإغلاق', closeAlert: 'إغلاق التنبيه' },
    qibla: { from: 'من {location}', close: 'إغلاق البوصلة', angle: 'زاوية القبلة', distance: 'المسافة إلى مكة', km: 'كم', instruction: 'أدر {direction} من الشمال الحقيقي باتجاه الكعبة.', closeCompass: 'إغلاق البوصلة', directions: { N: 'شمالاً', NE: 'شمال شرق', E: 'شرقاً', SE: 'جنوب شرق', S: 'جنوباً', SW: 'جنوب غرب', W: 'غرباً', NW: 'شمال غرب' } },
  },
} as const;

interface LanguageContextType {
  language: Language;
  locale: 'en-US' | 'ar-SA-u-nu-latn';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (typeof translations)[Language];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('pt_language');
      if (saved === 'ar' || saved === 'en') return saved;
      if (typeof navigator !== 'undefined' && navigator.language?.startsWith('ar')) return 'ar';
    } catch { /* ignore */ }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem('pt_language', lang); } catch { /* ignore */ }
  };

  useEffect(() => {
    const isArabic = language === 'ar';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = isArabic ? 'ar' : 'en';
    document.title = isArabic ? 'أوقات الصلاة والأذان' : 'Prayer Times & Adhan - 7-Day Schedule & Notifications';
    const description = isArabic
      ? 'مواقيت الصلاة اليومية للأسبوع القادم مع تنبيهات الأذان والقبلة والصوت القابل للتخصيص.'
      : 'Multi-location Islamic prayer times for the upcoming week with customizable adhan notifications, Qibla compass, and audio alerts.';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  }, [language]);

  const value: LanguageContextType = {
    language,
    locale: language === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US',
    setLanguage,
    toggleLanguage: () => setLanguage(language === 'en' ? 'ar' : 'en'),
    t: translations[language],
    isRTL: language === 'ar',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
