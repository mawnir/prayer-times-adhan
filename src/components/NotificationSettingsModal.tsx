import React, { useState } from 'react';
import {
  X,
  Bell,
  Volume2,
  Play,
  Square,
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { AdhanSoundType, FardhPrayerKey, NotificationSettings } from '../types';
import { PRAYER_DISPLAY_NAMES } from '../services/prayerService';
import { NotificationService } from '../services/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  onPreviewSound: (sound: AdhanSoundType) => void;
  playingSound: string | null;
  onStopAudio: () => void;
  onTestNotification: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onPreviewSound,
  playingSound,
  onStopAudio,
  onTestNotification,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    NotificationService.getPermissionStatus()
  );

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const status = await NotificationService.requestPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      onUpdateSettings({ ...settings, showBrowserNotification: true });
    }
  };

  const handleToggleMaster = () => {
    onUpdateSettings({
      ...settings,
      masterEnabled: !settings.masterEnabled,
    });
  };

  const handleVolumeChange = (newVol: number) => {
    onUpdateSettings({
      ...settings,
      volume: newVol,
    });
  };

  const handlePrayerSoundChange = (prayer: FardhPrayerKey, sound: AdhanSoundType) => {
    onUpdateSettings({
      ...settings,
      perPrayer: {
        ...settings.perPrayer,
        [prayer]: {
          ...settings.perPrayer[prayer],
          sound,
        },
      },
    });
  };

  const handlePrayerLeadTimeChange = (prayer: FardhPrayerKey, leadTimeMinutes: number) => {
    onUpdateSettings({
      ...settings,
      perPrayer: {
        ...settings.perPrayer,
        [prayer]: {
          ...settings.perPrayer[prayer],
          leadTimeMinutes,
        },
      },
    });
  };

  const handleTogglePrayer = (prayer: FardhPrayerKey) => {
    onUpdateSettings({
      ...settings,
      perPrayer: {
        ...settings.perPrayer,
        [prayer]: {
          ...settings.perPrayer[prayer],
          enabled: !settings.perPrayer[prayer].enabled,
        },
      },
    });
  };

  const prayersList: FardhPrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  const soundOptions: { value: AdhanSoundType; label: string; desc: string }[] = [
    { value: 'makkah_adhan', label: 'Makkah Adhan', desc: 'Resonant Maqam Bayati vocal chant' },
    { value: 'madinah_adhan', label: 'Madinah Call', desc: 'Serene Rast melody with warm formants' },
    { value: 'takbeer', label: 'Takbeer Chant', desc: 'Allahu Akbar melodic anthem' },
    { value: 'spiritual_chime', label: 'Spiritual Chime', desc: 'Acoustic singing bowl decay' },
    { value: 'gentle_beep', label: 'Gentle Beep', desc: 'Soft 3-tone harmonic alert' },
    { value: 'silent', label: 'Silent Alert', desc: 'Visual banner / browser alert only' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 text-primary flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-primary text-white">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif flex items-center gap-2">
                Adhan &amp; Notification Settings
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                  Per-Prayer Audio
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Customize sounds, lead times, and alerts for each prayer
              </p>
            </div>
          </div>
          <button
            id="btn-close-notif-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

          {/* Master Toggle & Volume Slider */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Master Adhan Notifications
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Enable or disable all prayer alarms and notifications
                </p>
              </div>
              <button
                id="btn-toggle-master-notifs"
                onClick={handleToggleMaster}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${settings.masterEnabled ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-neutral-900 shadow-sm ring-0 transition duration-200 ease-in-out ${settings.masterEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Volume Control */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  Adhan Audio Volume
                </span>
                <span className="font-mono">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input
                id="input-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-primary h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Browser Notification Permission Banner */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  Browser Push Notifications
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Status:{' '}
                  <span className={`font-semibold ${permissionStatus === 'granted'
                    ? 'text-primary'
                    : permissionStatus === 'denied'
                      ? 'text-red-600'
                      : 'text-neutral-500 dark:text-neutral-400'
                    }`}>
                    {permissionStatus === 'granted'
                      ? 'Enabled (Permissions Granted)'
                      : permissionStatus === 'denied'
                        ? 'Blocked by Browser'
                        : 'Permission Required'}
                  </span>
                </p>
              </div>
            </div>

            {permissionStatus !== 'granted' && (
              <button
                id="btn-request-browser-notif"
                onClick={handleRequestPermission}
                className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shrink-0 shadow-xs"
              >
                Enable in Browser
              </button>
            )}
          </div>

          {/* Per-Prayer Sound & Timing Customization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Per-Prayer Sounds &amp; Lead Times
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Custom sound for each of the 5 prayers
              </span>
            </div>

            <div className="space-y-2">
              {prayersList.map((prayer) => {
                const meta = PRAYER_DISPLAY_NAMES[prayer];
                const config = settings.perPrayer[prayer];
                const isPlayingThis = playingSound === config.sound;
                const isActive = config.enabled && settings.masterEnabled;

                return (
                  <div
                    key={prayer}
                    id={`notif-config-${prayer}`}
                    className={`p-3 rounded-2xl border transition-all ${isActive
                      ? 'border-primary bg-neutral-50/70 dark:bg-neutral-800/70 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 opacity-70'
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                      {/* Prayer Title & Toggle */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${isActive
                            ? 'bg-primary/80 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}
                        >
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="checkbox"
                              id={`checkbox-notif-${prayer}`}
                              checked={config.enabled}
                              onChange={() => handleTogglePrayer(prayer)}
                              className="w-4 h-4 rounded-sm cursor-pointer accent-primary/80"
                            />
                            <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                              {meta.en}
                            </span>
                            <span className="text-xs font-serif text-neutral-400 dark:text-neutral-500">
                              {meta.ar}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                            {prayer === 'fajr' ? 'Dawn Call (includes As-Salatu Khayr)' : meta.meaning}
                          </p>
                        </div>
                      </div>

                      {/* Controls: Sound Selector & Lead Time */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">

                        {/* Sound Selection */}
                        <div className="flex items-center gap-1">
                          <select
                            id={`select-sound-${prayer}`}
                            value={config.sound}
                            onChange={(e) => handlePrayerSoundChange(prayer, e.target.value as AdhanSoundType)}
                            disabled={!config.enabled || !settings.masterEnabled}
                            aria-label={`${meta.en} notification sound`}
                            className="text-xs py-1.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-medium text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-primary focus:outline-hidden disabled:opacity-50"
                          >
                            {soundOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          {/* Preview Button */}
                          <button
                            id={`btn-preview-sound-${prayer}`}
                            onClick={() => {
                              if (isPlayingThis) {
                                onStopAudio();
                              } else {
                                onPreviewSound(config.sound);
                              }
                            }}
                            className={`p-1.5 rounded-lg border transition-all ${isPlayingThis
                              ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-primary'
                              }`}
                            title={isPlayingThis ? 'Stop Audio' : 'Preview this sound'}
                          >
                            {isPlayingThis ? (
                              <Square className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>
                        </div>

                        {/* Reminder Lead Time */}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                          <select
                            id={`select-lead-time-${prayer}`}
                            value={config.leadTimeMinutes}
                            onChange={(e) => handlePrayerLeadTimeChange(prayer, parseInt(e.target.value, 10))}
                            disabled={!config.enabled || !settings.masterEnabled}
                            aria-label={`${meta.en} reminder lead time`}
                            className="text-xs py-1.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-medium text-neutral-800 dark:text-neutral-200 focus:ring-2 focus:ring-primary focus:outline-hidden disabled:opacity-50"
                          >
                            <option value="0">At Prayer Time</option>
                            <option value="5">5 min before</option>
                            <option value="10">10 min before</option>
                            <option value="15">15 min before</option>
                            <option value="30">30 min before</option>
                          </select>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <button
            id="btn-test-notification-alert"
            onClick={onTestNotification}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Test Adhan &amp; Notification Alert Now
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-xs"
          >
            Save &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};
