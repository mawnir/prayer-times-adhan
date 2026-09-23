import React from 'react';
import {
  MapPin,
  Bell,
  Settings,
  Volume2,
  VolumeX,
  Globe,
  Mosque,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { LocationItem, NotificationSettings } from '../types';
import { getCityDisplayName, formatLocationDisplay } from '../services/locationLocalization';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeLocation: LocationItem;
  locations: LocationItem[];
  onSelectLocation: (loc: LocationItem) => void;
  onOpenLocationModal: () => void;
  onOpenNotificationModal: () => void;
  onOpenSettingsModal: () => void;
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
  notificationSettings,
  onToggleMute,
}) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const isMuted = notificationSettings.volume === 0 || !notificationSettings.masterEnabled;

  const renderLocationSelect = (idSuffix: 'desktop' | 'mobile') => (
    <div className="relative flex min-w-0 flex-1 items-center">
      <MapPin className="ms-2.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
      <select
        id={`select-location-${activeLocation.id}-${idSuffix}`}
        value={activeLocation.id}
        onChange={(event) => {
          const location = locations.find((item) => item.id === event.target.value);
          if (location) onSelectLocation(location);
        }}
        className="location-select w-full min-w-0"
        title={formatLocationDisplay(activeLocation, language)}
        aria-label={t.choosePrayerLocation}
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {getCityDisplayName(location, language)}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute h-3 w-3 text-current opacity-50 ${isRTL ? 'left-2' : 'right-2'}`}
        aria-hidden="true"
      />
    </div>
  );

  const allCitiesButton = (
    <button
      type="button"
      onClick={onOpenLocationModal}
      className="utility-button h-9 shrink-0 gap-1.5 px-2.5 text-[0.72rem] font-semibold"
      title={t.allCities}
    >
      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{t.allCities}</span>
    </button>
  );

  const languageSwitch = (
    <div
      role="group"
      aria-label={t.language}
      className="inline-flex shrink-0 items-center rounded-[0.65rem] border border-muted-border bg-muted p-0.5 text-[0.68rem]"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-[0.42rem] px-2 py-1.5 font-semibold transition-colors ${
          language === 'en'
            ? 'bg-surface text-foreground shadow-sm'
            : 'text-foreground/50 hover:text-foreground'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`rounded-[0.42rem] px-2 py-1.5 font-semibold transition-colors ${
          language === 'ar'
            ? 'bg-surface text-foreground shadow-sm'
            : 'text-foreground/50 hover:text-foreground'
        }`}
        aria-pressed={language === 'ar'}
      >
        العربية
      </button>
    </div>
  );

  const renderActionToolbar = (idSuffix: 'desktop' | 'mobile') => (
    <div className="flex shrink-0 items-center gap-0.5 rounded-[0.7rem] border border-muted-border bg-surface p-0.5">
      <button
        id={`btn-theme-toggle-${idSuffix}`}
        type="button"
        onClick={toggleTheme}
        className="utility-button h-9 w-9"
        title={isDark ? t.switchToLightMode : t.switchToDarkMode}
        aria-label={isDark ? t.switchToLightMode : t.switchToDarkMode}
        aria-pressed={isDark}
      >
        {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
      </button>

      <button
        id={`btn-quick-mute-${idSuffix}`}
        type="button"
        onClick={onToggleMute}
        className={`utility-button h-9 w-9 ${isMuted ? 'text-danger' : ''}`}
        title={isMuted ? t.unmuteAudio : t.muteAudio}
        aria-label={isMuted ? t.unmuteAudio : t.muteAudio}
        aria-pressed={isMuted}
      >
        {isMuted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
      </button>

      <button
        id={`btn-notification-settings-${idSuffix}`}
        type="button"
        onClick={onOpenNotificationModal}
        className="utility-button relative h-9 w-9"
        title={t.notificationSettings}
        aria-label={t.notificationSettings}
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {notificationSettings.masterEnabled && (
          <span
            className="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-surface"
            aria-hidden="true"
          />
        )}
      </button>

      <button
        id={`btn-calc-settings-${idSuffix}`}
        type="button"
        onClick={onOpenSettingsModal}
        className="utility-button h-9 w-9"
        title={t.calculationSettings}
        aria-label={t.calculationSettings}
      >
        <Settings className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <header className="app-header sticky top-0 z-30 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="brand-mark" aria-hidden="true">
              <Mosque className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.8} />
            </div>
            <div className="hidden min-w-0 min-[360px]:block md:hidden lg:block">
              <h1 className="truncate text-[1.02rem] font-semibold tracking-[-0.025em] text-foreground">
                {t.appTitle}
              </h1>
              <p className="hidden truncate text-[0.7rem] text-foreground/52 sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex max-w-80 min-w-52 items-center rounded-[0.7rem] border border-muted-border bg-muted p-0.5">
              {renderLocationSelect('desktop')}
              <span className="h-5 w-px shrink-0 bg-muted-border" aria-hidden="true" />
              {allCitiesButton}
            </div>
            <div className="hidden lg:block">{languageSwitch}</div>
            {renderActionToolbar('desktop')}
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            {renderActionToolbar('mobile')}
          </div>
        </div>

        <div className="flex items-center gap-2 pb-2.5 md:hidden">
          <div className="flex min-w-0 flex-1 items-center rounded-[0.7rem] border border-muted-border bg-muted p-0.5">
            {renderLocationSelect('mobile')}
            <span className="h-5 w-px shrink-0 bg-muted-border" aria-hidden="true" />
            {allCitiesButton}
          </div>
          {languageSwitch}
        </div>
      </div>
    </header>
  );
};
