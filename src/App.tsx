import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActiveAdhanAlert,
  AdhanSoundType,
  CalculationSettings,
  FardhPrayerKey,
  LocationItem,
  NotificationSettings
} from './types';
import { INITIAL_USER_LOCATIONS } from './data/defaultLocations';
import {
  calculateWeekSchedule,
  getCurrentPrayerStatus,
  formatPrayerTime
} from './services/prayerService';
import { audioService } from './services/audioService';
import { NotificationService } from './services/notificationService';
import { Header } from './components/Header';
import { HeroCurrentPrayer } from './components/HeroCurrentPrayer';
import { WeekScheduleView } from './components/WeekScheduleView';
import { LocationManagerModal } from './components/LocationManagerModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { CalculationSettingsModal } from './components/CalculationSettingsModal';
import { ActiveAdhanModal } from './components/ActiveAdhanModal';
import { QiblaModal } from './components/QiblaModal';
import { Mosque } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

const DEFAULT_CALCULATION_SETTINGS: CalculationSettings = {
  method: 'MuslimWorldLeague',
  madhab: 'shafi',
  highLatitudeRule: 'twilightAngle',
  timeFormat: '12h',
  manualOffsets: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  masterEnabled: true,
  volume: 0.8,
  autoPlayAudio: true,
  showBrowserNotification: true,
  perPrayer: {
    fajr: { enabled: true, sound: 'makkah_adhan', leadTimeMinutes: 0 },
    dhuhr: { enabled: true, sound: 'madinah_adhan', leadTimeMinutes: 0 },
    asr: { enabled: true, sound: 'takbeer', leadTimeMinutes: 0 },
    maghrib: { enabled: true, sound: 'makkah_adhan', leadTimeMinutes: 0 },
    isha: { enabled: true, sound: 'spiritual_chime', leadTimeMinutes: 0 },
  },
};

export default function App() {
  const { language, t, locale } = useLanguage();

  // 1. Locations State
  const [locations, setLocations] = useState<LocationItem[]>(() => {
    try {
      const saved = localStorage.getItem('pt_locations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved locations:', e);
    }
    return INITIAL_USER_LOCATIONS;
  });

  const [activeLocationId, setActiveLocationId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('pt_active_location_id');
      if (saved && locations.some(l => l.id === saved)) return saved;
    } catch {
      // ignore
    }
    return locations[0]?.id || 'makkah';
  });

  // 2. Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('pt_notification_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  });

  // 3. Calculation Settings State
  const [calculationSettings, setCalculationSettings] = useState<CalculationSettings>(() => {
    try {
      const saved = localStorage.getItem('pt_calc_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CALCULATION_SETTINGS;
  });

  // 4. Active Live Time
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 5. Audio Playback State
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [playingSoundKey, setPlayingSoundKey] = useState<string | null>(null);

  // 6. Modals State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isQiblaModalOpen, setIsQiblaModalOpen] = useState(false);
  const [activeAdhanAlert, setActiveAdhanAlert] = useState<ActiveAdhanAlert | null>(null);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem('pt_locations', JSON.stringify(locations));
    } catch (e) {
      console.warn(e);
    }
  }, [locations]);

  useEffect(() => {
    try {
      localStorage.setItem('pt_active_location_id', activeLocationId);
    } catch (e) {
      console.warn(e);
    }
  }, [activeLocationId]);

  useEffect(() => {
    try {
      localStorage.setItem('pt_notification_settings', JSON.stringify(notificationSettings));
    } catch (e) {
      console.warn(e);
    }
  }, [notificationSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('pt_calc_settings', JSON.stringify(calculationSettings));
    } catch (e) {
      console.warn(e);
    }
  }, [calculationSettings]);

  // Clock Ticker (runs every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Active Location Object
  const activeLocation = useMemo(() => {
    const found = locations.find((l) => l.id === activeLocationId);
    return found || locations[0] || INITIAL_USER_LOCATIONS[0];
  }, [locations, activeLocationId]);

  // Week Schedule Calculation (Today + Next 7 days)
  const weekSchedule = useMemo(() => {
    return calculateWeekSchedule(activeLocation, calculationSettings, currentTime);
  }, [activeLocation, calculationSettings, currentTime.getHours() * 60 + currentTime.getMinutes()]);

  const todaySchedule = weekSchedule[0];
  const tomorrowSchedule = weekSchedule[1] || weekSchedule[0];

  // Current and Next Prayer Countdown
  const prayerStatus = useMemo(() => {
    if (!todaySchedule || !tomorrowSchedule) {
      return {
        currentPrayer: 'none' as const,
        currentDisplayName: 'None',
        nextPrayer: 'fajr' as const,
        nextDisplayName: 'Fajr',
        nextPrayerTime: new Date(),
        secondsRemaining: 0,
        timeRemainingFormatted: '00:00:00',
        progressPercent: 0,
      };
    }
    return getCurrentPrayerStatus(todaySchedule, tomorrowSchedule, currentTime);
  }, [todaySchedule, tomorrowSchedule, currentTime]);

  // Real-time Adhan notification check
  useEffect(() => {
    if (!todaySchedule) return;

    NotificationService.checkPrayerTimes(
      todaySchedule.prayers,
      activeLocation,
      notificationSettings,
      (alert) => {
        setActiveAdhanAlert(alert);
        setIsAudioPlaying(true);
      }
    );
  }, [todaySchedule, activeLocation, notificationSettings, currentTime.getMinutes()]);

  // Audio Playback Handlers
  const handleStopAudio = useCallback(() => {
    audioService.stopSound();
    setIsAudioPlaying(false);
    setPlayingSoundKey(null);
  }, []);

  const handlePlaySound = useCallback((sound: AdhanSoundType, keyIdentifier: string) => {
    audioService.stopSound();
    setPlayingSoundKey(keyIdentifier);
    setIsAudioPlaying(true);

    audioService.playSound(sound, notificationSettings.volume, () => {
      setIsAudioPlaying(false);
      setPlayingSoundKey(null);
    });
  }, [notificationSettings.volume]);

  // Quick Mute / Unmute
  const handleToggleMute = useCallback(() => {
    if (notificationSettings.volume === 0 || !notificationSettings.masterEnabled) {
      setNotificationSettings({
        ...notificationSettings,
        volume: 0.8,
        masterEnabled: true,
      });
    } else {
      audioService.stopSound();
      setIsAudioPlaying(false);
      setPlayingSoundKey(null);
      setNotificationSettings({
        ...notificationSettings,
        volume: 0,
      });
    }
  }, [notificationSettings]);

  // Location Handlers
  const handleSelectLocation = (loc: LocationItem) => {
    setActiveLocationId(loc.id);
  };

  const handleAddLocation = (loc: LocationItem) => {
    setLocations((prev) => {
      const exists = prev.some((l) => l.id === loc.id || (l.name.toLowerCase() === loc.name.toLowerCase() && l.country.toLowerCase() === loc.country.toLowerCase()));
      if (exists) return prev;
      return [...prev, loc];
    });
  };

  const handleRemoveLocation = (id: string) => {
    setLocations((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((l) => l.id !== id);
      if (activeLocationId === id && next.length > 0) {
        setActiveLocationId(next[0].id);
      }
      return next;
    });
  };

  // Trigger Full Test Adhan Notification
  const handleTestAdhan = () => {
    const fardhPrayer = (prayerStatus.nextPrayer === 'sunrise' ? 'fajr' : prayerStatus.nextPrayer) as FardhPrayerKey;

    NotificationService.triggerAlert(
      fardhPrayer,
      activeLocation,
      notificationSettings,
      false,
      0,
      (alert) => {
        setActiveAdhanAlert(alert);
        setIsAudioPlaying(true);
      }
    );
  };

  const formattedNextPrayerTime = useMemo(() => {
    return formatPrayerTime(
      prayerStatus.nextPrayerTime,
      calculationSettings.timeFormat,
      activeLocation.timezone,
      locale
    );
  }, [prayerStatus.nextPrayerTime, calculationSettings.timeFormat, activeLocation.timezone, locale]);

  return (
    <div className="app-shell flex min-h-screen flex-col font-sans text-foreground">
      <Header
        activeLocation={activeLocation}
        locations={locations}
        onSelectLocation={handleSelectLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        notificationSettings={notificationSettings}
        onToggleMute={handleToggleMute}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-7 px-4 py-5 sm:space-y-9 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        {todaySchedule ? (
          <HeroCurrentPrayer
            location={activeLocation}
            status={prayerStatus}
            timeFormatted={formattedNextPrayerTime}
            currentTime={currentTime}
            isAudioPlaying={isAudioPlaying}
            onStopAudio={handleStopAudio}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            onOpenQiblaModal={() => setIsQiblaModalOpen(true)}
          />
        ) : null}

        <WeekScheduleView
          schedule={weekSchedule}
          location={activeLocation}
          timeFormat={calculationSettings.timeFormat}
          timezone={activeLocation.timezone}
        />
      </main>

      <footer className="app-footer mt-auto py-5 text-xs text-foreground/50">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-white">
              <Mosque className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="font-semibold text-foreground/80">{t.appTitle} &amp; {language === 'ar' ? 'الأذان' : 'Adhan'}</span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label={t.settingsNavigation}>
            <button type="button" onClick={() => setIsSettingsModalOpen(true)} className="footer-link">
              {t.calculationSettings}
            </button>
            <button type="button" onClick={() => setIsNotificationModalOpen(true)} className="footer-link">
              {t.notificationSettings}
            </button>
            <button type="button" onClick={() => setIsLocationModalOpen(true)} className="footer-link">
              {t.manageCities}
            </button>
          </nav>
        </div>
      </footer>

      <LocationManagerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        locations={locations}
        activeLocation={activeLocation}
        onSelectLocation={handleSelectLocation}
        onAddLocation={handleAddLocation}
        onRemoveLocation={handleRemoveLocation}
        calculationSettings={calculationSettings}
      />

      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        settings={notificationSettings}
        onUpdateSettings={setNotificationSettings}
        onPreviewSound={(sound) => handlePlaySound(sound, sound)}
        playingSound={playingSoundKey}
        onStopAudio={handleStopAudio}
        onTestNotification={handleTestAdhan}
      />

      <CalculationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={calculationSettings}
        onUpdateSettings={setCalculationSettings}
      />

      <ActiveAdhanModal
        alert={activeAdhanAlert}
        onClose={() => setActiveAdhanAlert(null)}
        onStopAudio={handleStopAudio}
        isAudioPlaying={isAudioPlaying}
      />

      <QiblaModal
        isOpen={isQiblaModalOpen}
        onClose={() => setIsQiblaModalOpen(false)}
        location={activeLocation}
      />
    </div>
  );
}
