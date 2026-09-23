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
import { useLanguage } from '../context/LanguageContext';

type LocalizedText = { en: string; ar: string };

const SOUND_LABELS: Record<AdhanSoundType, { label: LocalizedText; description: LocalizedText }> = {
  makkah_adhan: {
    label: { en: 'Makkah Adhan', ar: 'أذان مكة' },
    description: { en: 'Resonant Maqam Bayati vocal chant', ar: 'ترتيل صوتي رنّان على مقام بيتي' },
  },
  madinah_adhan: {
    label: { en: 'Madinah Call', ar: 'نداء المدينة' },
    description: { en: 'Serene Rast melody with warm formants', ar: 'لحن راست هادئ بنغمات دافئة' },
  },
  takbeer: {
    label: { en: 'Takbeer Chant', ar: 'نغمة التكبير' },
    description: { en: 'Allahu Akbar melodic anthem', ar: 'لحن «الله أكبر»' },
  },
  spiritual_chime: {
    label: { en: 'Spiritual Chime', ar: 'رنّة روحانية' },
    description: { en: 'Acoustic singing bowl decay', ar: 'رنين وعاء غنائي أكوستيكي' },
  },
  gentle_beep: {
    label: { en: 'Gentle Beep', ar: 'تنبيه لطيف' },
    description: { en: 'Soft 3-tone harmonic alert', ar: 'تنبيه هادئ من ثلاث نغمات' },
  },
  silent: {
    label: { en: 'Silent Alert', ar: 'تنبيه صامت' },
    description: { en: 'Visual banner / browser alert only', ar: 'شريط مرئي أو تنبيه المتصفح فقط' },
  },
};

const FAJR_DESCRIPTION: LocalizedText = {
  en: 'Dawn Call (includes As-Salatu Khayr)',
  ar: 'نداء الفجر (يتضمن «الصلاة خير»)',
};

const interpolate = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    template
  );

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
  const { language, t } = useLanguage();
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

  const soundOptions: { value: AdhanSoundType; label: string; description: string }[] =
    (Object.entries(SOUND_LABELS) as [AdhanSoundType, (typeof SOUND_LABELS)[AdhanSoundType]][])
      .map(([value, text]) => ({
        value,
        label: text.label[language],
        description: text.description[language],
      }));

  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="notification-settings-title">
        <div className="modal-header">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.7rem_0.7rem_0.25rem_0.25rem] bg-primary text-white">
              <Bell className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="notification-settings-title" className="text-lg font-semibold tracking-[-0.025em] text-foreground">
                {t.notifications.title}
              </h2>
              <p className="mt-0.5 text-xs leading-5 text-foreground/50">
                {t.notifications.subtitle}
              </p>
            </div>
          </div>
          <button id="btn-close-notif-modal" type="button" onClick={onClose} className="icon-button" aria-label={t.notifications.close}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body space-y-5">

          {/* Master Toggle & Volume Slider */}
          <div className="space-y-4 rounded-[0.8rem_0.8rem_0.25rem_0.25rem] border border-muted-border bg-muted/65 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  {t.notifications.master}
                </h3>
                <p className="text-xs text-foreground/50">
                  {t.notifications.masterDescription}
                </p>
              </div>
              <button
                id="btn-toggle-master-notifs"
                type="button"
                role="switch"
                aria-checked={settings.masterEnabled}
                aria-label={t.notifications.master}
                onClick={handleToggleMaster}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${settings.masterEnabled ? 'bg-primary' : 'bg-foreground/20'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${settings.masterEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* Volume Control */}
            <div className="space-y-2 border-t border-muted-border pt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-primary" aria-hidden="true" />
                  {t.notifications.volume}
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
                aria-label={t.notifications.volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer accent-primary rounded-lg bg-foreground/10"
              />
            </div>
          </div>

          {/* Browser Notification Permission Banner */}
          <div className="flex flex-col justify-between gap-3 rounded-[0.7rem_0.7rem_0.25rem_0.25rem] border border-muted-border p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-muted-border bg-surface text-primary">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  {t.notifications.browser}
                </h3>
                <p className="text-xs text-foreground/50">
                  {t.notifications.status}{' '}
                  <span className={`font-semibold ${permissionStatus === 'granted'
                    ? 'text-primary'
                    : permissionStatus === 'denied'
                      ? 'text-red-600'
                      : 'text-foreground/50'
                    }`}>
                    {permissionStatus === 'granted'
                      ? t.notifications.granted
                      : permissionStatus === 'denied'
                        ? t.notifications.denied
                        : t.notifications.required}
                  </span>
                </p>
              </div>
            </div>

            {permissionStatus !== 'granted' && (
              <button
                id="btn-request-browser-notif"
                type="button"
                onClick={handleRequestPermission}
                className="primary-button shrink-0"
              >
                {t.notifications.enable}
              </button>
            )}
          </div>

          {/* Per-Prayer Sound & Timing Customization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 px-1">
              <h3 className="text-sm font-semibold text-foreground">{t.notifications.perPrayer}</h3>
              <span className="text-xs text-foreground/45">{t.notifications.perPrayerHint}</span>
            </div>

            <div className="space-y-2">
              {prayersList.map((prayer) => {
                const meta = PRAYER_DISPLAY_NAMES[prayer];
                const prayerName = meta[language];
                const prayerDescription = prayer === 'fajr'
                  ? FAJR_DESCRIPTION[language]
                  : language === 'ar'
                    ? meta.meaningAr
                    : meta.meaning;
                const prayerNotificationLabel = language === 'ar'
                  ? `تنبيهات ${prayerName}`
                  : `${prayerName} notifications`;
                const config = settings.perPrayer[prayer];
                const isPlayingThis = playingSound === config.sound;
                const isActive = config.enabled && settings.masterEnabled;

                return (
                  <div
                    key={prayer}
                    id={`notif-config-${prayer}`}
                    className={`rounded-[0.75rem_0.75rem_0.25rem_0.25rem] border p-3 transition-colors ${isActive
                      ? 'border-primary/55 bg-primary/[0.055]'
                      : 'border-muted-border bg-surface opacity-70'
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                      {/* Prayer Title & Toggle */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-[0.65rem_0.65rem_0.2rem_0.2rem] text-sm font-bold ${isActive
                            ? 'bg-primary text-white'
                            : 'bg-muted text-foreground/45'
                            }`}
                        >
                          <Bell className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="checkbox"
                              id={`checkbox-notif-${prayer}`}
                              checked={config.enabled}
                              aria-label={prayerNotificationLabel}
                              onChange={() => handleTogglePrayer(prayer)}
                              className="w-4 h-4 rounded-sm cursor-pointer accent-primary/80"
                            />
                            <span className="text-sm font-semibold text-foreground">
                              {prayerName}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[0.68rem] text-foreground/44">
                            {prayerDescription}
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
                            aria-label={interpolate(t.notifications.prayerSound, { prayer: prayerName })}
                            className="form-control min-w-32 py-2 pe-7 ps-2.5 text-xs font-medium disabled:opacity-50"
                          >
                            {soundOptions.map((opt) => (
                              <option key={opt.value} value={opt.value} title={opt.description}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          {/* Preview Button */}
                          <button
                            id={`btn-preview-sound-${prayer}`}
                            type="button"
                            onClick={() => {
                              if (isPlayingThis) {
                                onStopAudio();
                              } else {
                                onPreviewSound(config.sound);
                              }
                            }}
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors ${isPlayingThis
                              ? 'border-danger/35 bg-danger/10 text-danger'
                              : 'border-muted-border bg-muted text-foreground/55 hover:bg-primary/10 hover:text-primary'
                              }`}
                            title={isPlayingThis ? t.notifications.stopAudio : t.notifications.preview}
                            aria-label={isPlayingThis ? t.notifications.stopAudio : t.notifications.preview}
                          >
                            {isPlayingThis ? (
                              <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                            )}
                          </button>
                        </div>

                        {/* Reminder Lead Time */}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-foreground/40" aria-hidden="true" />
                          <select
                            id={`select-lead-time-${prayer}`}
                            value={config.leadTimeMinutes}
                            onChange={(e) => handlePrayerLeadTimeChange(prayer, parseInt(e.target.value, 10))}
                            disabled={!config.enabled || !settings.masterEnabled}
                            aria-label={interpolate(t.notifications.prayerLead, { prayer: prayerName })}
                            className="form-control min-w-32 py-2 pe-7 ps-2.5 text-xs font-medium disabled:opacity-50"
                          >
                            <option value="0">{t.notifications.atTime}</option>
                            {[5, 10, 15, 30].map((count) => (
                              <option key={count} value={count}>
                                {interpolate(t.notifications.minutesBefore, { count })}
                              </option>
                            ))}
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
        <div className="modal-footer flex-col sm:flex-row sm:justify-between">
          <button
            id="btn-test-notification-alert"
            type="button"
            onClick={onTestNotification}
            className="secondary-button"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {t.notifications.test}
          </button>

          <button type="button" onClick={onClose} className="primary-button">
            {t.notifications.saveClose}
          </button>
        </div>

      </div>
    </div>
  );
};
