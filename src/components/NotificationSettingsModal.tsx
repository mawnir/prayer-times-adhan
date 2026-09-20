import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Volume2, 
  Play, 
  Square, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Check
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-800 text-emerald-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif">Adhan &amp; Notification Settings</h3>
              <p className="text-xs text-emerald-300">
                Customize sounds, lead times, and alerts for each prayer
              </p>
            </div>
          </div>
          <button
            id="btn-close-notif-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Master Toggle & Volume Slider */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Master Adhan Notifications
                </h4>
                <p className="text-xs text-emerald-800/80">
                  Enable or disable all prayer alarms and notifications
                </p>
              </div>
              <button
                id="btn-toggle-master-notifs"
                onClick={handleToggleMaster}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.masterEnabled ? 'bg-emerald-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    settings.masterEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Volume Control */}
            <div className="space-y-1.5 pt-2 border-t border-emerald-200/60">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-950">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-700" />
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
                className="w-full accent-emerald-700 h-2 bg-emerald-200/60 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Browser Notification Permission Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Browser Push Notifications
                </h4>
                <p className="text-xs text-slate-500">
                  Status:{' '}
                  <span className={`font-semibold ${
                    permissionStatus === 'granted'
                      ? 'text-emerald-700'
                      : permissionStatus === 'denied'
                      ? 'text-red-600'
                      : 'text-amber-600'
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
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shrink-0 shadow-xs"
              >
                Enable in Browser
              </button>
            )}
          </div>

          {/* Per-Prayer Sound & Timing Customization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
                Per-Prayer Sounds &amp; Lead Times
              </h4>
              <span className="text-xs text-slate-400">
                Custom sound for each of the 5 prayers
              </span>
            </div>

            <div className="space-y-3">
              {prayersList.map((prayer) => {
                const meta = PRAYER_DISPLAY_NAMES[prayer];
                const config = settings.perPrayer[prayer];
                const isPlayingThis = playingSound === config.sound;

                return (
                  <div
                    key={prayer}
                    id={`notif-config-${prayer}`}
                    className={`p-4 rounded-2xl border transition-all ${
                      config.enabled && settings.masterEnabled
                        ? 'border-slate-200 bg-white shadow-xs'
                        : 'border-slate-200/60 bg-slate-50/60 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Prayer Title & Toggle */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`checkbox-notif-${prayer}`}
                          checked={config.enabled}
                          onChange={() => handleTogglePrayer(prayer)}
                          className="w-4 h-4 rounded-sm text-emerald-700 focus:ring-emerald-600 cursor-pointer accent-emerald-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {meta.en}
                            </span>
                            <span className="text-xs font-serif text-slate-400">
                              {meta.ar}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {prayer === 'fajr' ? 'Dawn Call (includes As-Salatu Khayr)' : meta.meaning}
                          </span>
                        </div>
                      </div>

                      {/* Controls: Sound Selector & Lead Time */}
                      <div className="flex flex-wrap items-center gap-2">
                        
                        {/* Sound Selection */}
                        <div className="flex items-center gap-1">
                          <select
                            id={`select-sound-${prayer}`}
                            value={config.sound}
                            onChange={(e) => handlePrayerSoundChange(prayer, e.target.value as AdhanSoundType)}
                            disabled={!config.enabled || !settings.masterEnabled}
                            aria-label={`${meta.en} notification sound`}
                            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden disabled:opacity-50"
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
                            className={`p-1.5 rounded-lg border transition-all ${
                              isPlayingThis
                                ? 'bg-red-50 border-red-300 text-red-700'
                                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
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
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <select
                            id={`select-lead-time-${prayer}`}
                            value={config.leadTimeMinutes}
                            onChange={(e) => handlePrayerLeadTimeChange(prayer, parseInt(e.target.value, 10))}
                            disabled={!config.enabled || !settings.masterEnabled}
                            aria-label={`${meta.en} reminder lead time`}
                            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden disabled:opacity-50"
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            id="btn-test-notification-alert"
            onClick={onTestNotification}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Test Adhan &amp; Notification Alert Now
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            Save &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};
