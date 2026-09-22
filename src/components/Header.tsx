import React from 'react';
import {
  MapPin,
  Bell,
  Settings,
  Compass,
  Volume2,
  VolumeX,
  Globe,
  Mosque,
  ChevronDown,
  Languages,
  Sun,
  Moon,
} from 'lucide-react';
import { LocationItem, NotificationSettings } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeLocation: LocationItem;
  locations: LocationItem[];
  onSelectLocation: (loc: LocationItem) => void;
  onOpenLocationModal: () => void;
  onOpenNotificationModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenQiblaModal: () => void;
  notificationSettings: NotificationSettings;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeLocation,
  locations,
  onSelectLocation,
  onOpenLocationModal,
  onOpenNotificationModal,
  onOpenSettingsModal,
  onOpenQiblaModal,
  notificationSettings,
  onToggleMute,
}) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const isMuted = notificationSettings.volume === 0 || !notificationSettings.masterEnabled;

  const activeLocationDropdown = (
    <div className="relative flex items-center shrink-0">
      <select
        id={`select-location-${activeLocation.id}`}
        value={activeLocation.id}
        onChange={(e) => {
          const loc = locations.find((l) => l.id === e.target.value);
          if (loc) onSelectLocation(loc);
        }}
        className="appearance-none pl-2.5 pr-6 py-1 text-xs rounded-md font-medium text-white shadow-xs whitespace-nowrap cursor-pointer transition-colors focus:outline-hidden"
        style={{ backgroundColor: 'var(--color-primary)' }}
        title={`${activeLocation.name}, ${activeLocation.country}`}
      >
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id} className="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
            {loc.name}
          </option>
        ))}
      </select>
      <ChevronDown className={`w-3 h-3 text-white/80 pointer-events-none absolute ${isRTL ? 'left-1.5' : 'right-1.5'}`} />
    </div>
  );

  const allCitiesButton = (
    <button
      id="btn-open-location-manager"
      onClick={onOpenLocationModal}
      className="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200/80 rounded-md transition-all flex items-center gap-1.5 font-medium shadow-2xs dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-700 dark:border-neutral-700/80"
      title={t.allCities}
    >
      <Globe className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
      <span className="text-[11px]">{t.allCities}</span>
    </button>
  );

  // Shadcn style language toggle switch
  const languageSwitch = (
    <div
      role="group"
      aria-label="Language switch"
      className="inline-flex items-center p-0.5 rounded-lg bg-neutral-100/90 border border-neutral-200/80 text-xs shadow-2xs shrink-0 dark:bg-neutral-800/90 dark:border-neutral-700/80"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${language === 'en'
          ? 'bg-white text-neutral-900 shadow-xs font-semibold dark:bg-neutral-900 dark:text-neutral-100'
          : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${language === 'ar'
          ? 'bg-white text-neutral-900 shadow-xs font-semibold dark:bg-neutral-900 dark:text-neutral-100'
          : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        aria-pressed={language === 'ar'}
      >
        العربية
      </button>
    </div>
  );

  const actionToolbar = (
    <div className="flex items-center rounded-lg border border-neutral-200/80 bg-white shadow-2xs divide-x rtl:divide-x-reverse divide-neutral-200/80 shrink-0 dark:bg-neutral-900 dark:border-neutral-700/80 dark:divide-neutral-700/80">
      {/* Dark Theme Quick Toggle */}
      <button
        id="btn-theme-toggle"
        onClick={toggleTheme}
        className="p-2 rounded-s-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
        title={isDark ? t.switchToLightMode : t.switchToDarkMode}
        aria-label={isDark ? t.switchToLightMode : t.switchToDarkMode}
        aria-pressed={isDark}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Audio Mute Quick Toggle */}
      {/* <button
        id="btn-quick-mute"
        onClick={onToggleMute}
        className={`p-2 rounded-s-lg transition-colors ${
          isMuted
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
        }`}
        title={isMuted ? t.unmuteAudio : t.muteAudio}
        aria-label={isMuted ? t.unmuteAudio : t.muteAudio}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button> */}

      {/* Notification Settings */}
      <button
        id="btn-notification-settings"
        onClick={onOpenNotificationModal}
        className={`relative p-2 transition-colors ${notificationSettings.masterEnabled
          ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
          : 'bg-neutral-50/70 text-neutral-400 hover:bg-neutral-100 dark:bg-neutral-800/70 dark:text-neutral-500 dark:hover:bg-neutral-700'
          }`}
        title={t.notificationSettings}
        aria-label={t.notificationSettings}
      >
        <Bell className="w-4 h-4" />
        {notificationSettings.masterEnabled && (
          <span
            className={`absolute top-1.5 ${isRTL ? 'left-1.5' : 'right-1.5'} w-1.5 h-1.5 rounded-full animate-pulse`}
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
        )}
      </button>

      {/* Qibla Direction */}
      <button
        id="btn-qibla-compass"
        onClick={onOpenQiblaModal}
        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
        title={t.qiblaCompass}
        aria-label={t.qiblaCompass}
      >
        <Compass className="w-4 h-4" />
      </button>

      {/* Calculation Settings */}
      <button
        id="btn-calc-settings"
        onClick={onOpenSettingsModal}
        className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-e-lg transition-colors dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-neutral-800"
        title={t.calculationSettings}
        aria-label={t.calculationSettings}
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 bg-neutral-50 backdrop-blur-md border-b border-neutral-200/80 text-neutral-900 dark:bg-neutral-900/95 dark:border-neutral-700/80 dark:text-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 py-2.5">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center shadow-xs transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Mosque className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-sans text-base sm:text-lg font-semibold tracking-tight text-neutral-900 flex items-center gap-2 dark:text-neutral-100">
                {t.appTitle}
              </h1>
              <p className="text-[11px] text-neutral-500 truncate hidden sm:block dark:text-neutral-400">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Controls Right Section */}
          <div className="flex items-center gap-2.5">
            {/* Desktop Quick Location Selector */}
            <div className="hidden md:flex items-center bg-neutral-50 border border-neutral-200/80 rounded-lg p-1 max-w-80 overflow-x-auto scrollbar-none shadow-2xs gap-1 dark:bg-neutral-800/70 dark:border-neutral-700/80">
              <MapPin className="w-3.5 h-3.5 text-neutral-500 mx-1 shrink-0 dark:text-neutral-400" />
              {activeLocationDropdown}
              {allCitiesButton}
            </div>

            {/* Language Switch Toggle */}
            {languageSwitch}

            {/* Action Icon Toolbar */}
            {actionToolbar}
          </div>
        </div>

        {/* Mobile Location Row */}
        <div className="md:hidden flex items-center gap-2 pb-2.5 pt-0.5">
          <div className="flex items-center flex-1 min-w-0 bg-neutral-50 border border-neutral-200/80 rounded-lg p-1 overflow-x-auto scrollbar-none shadow-2xs gap-1 dark:bg-neutral-800/70 dark:border-neutral-700/80">
            <MapPin className="w-3.5 h-3.5 text-neutral-500 mx-1 shrink-0 dark:text-neutral-400" />
            {activeLocationDropdown}
            {allCitiesButton}
          </div>
        </div>
      </div>
    </header>
  );
};