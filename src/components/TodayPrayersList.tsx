import React from 'react';
import { 
  Bell, 
  BellOff, 
  Play, 
  Square, 
  Sun, 
  Sunset, 
  Moon, 
  Sunrise, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { 
  DayPrayerSchedule, 
  FardhPrayerKey, 
  NotificationSettings, 
  PrayerKey 
} from '../types';
import { PRAYER_DISPLAY_NAMES, formatPrayerTime } from '../services/prayerService';

interface TodayPrayersListProps {
  schedule: DayPrayerSchedule;
  currentPrayer: PrayerKey | 'none';
  nextPrayer: PrayerKey;
  timeFormat: '12h' | '24h';
  timezone?: string;
  notificationSettings: NotificationSettings;
  onTogglePrayerNotification: (prayer: FardhPrayerKey) => void;
  onPreviewPrayerSound: (prayer: FardhPrayerKey) => void;
  playingSoundPrayer: string | null;
  onStopAudio: () => void;
}

export const TodayPrayersList: React.FC<TodayPrayersListProps> = ({
  schedule,
  currentPrayer,
  nextPrayer,
  timeFormat,
  timezone,
  notificationSettings,
  onTogglePrayerNotification,
  onPreviewPrayerSound,
  playingSoundPrayer,
  onStopAudio,
}) => {
  const prayerItems: {
    key: PrayerKey;
    isFardh: boolean;
    icon: React.ReactNode;
  }[] = [
    { key: 'fajr', isFardh: true, icon: <Sunrise className="w-5 h-5 text-neutral-500" /> },
    { key: 'sunrise', isFardh: false, icon: <Sun className="w-5 h-5 text-neutral-500" /> },
    { key: 'dhuhr', isFardh: true, icon: <Sun className="w-5 h-5 text-neutral-500" /> },
    { key: 'asr', isFardh: true, icon: <Sunset className="w-5 h-5 text-neutral-500" /> },
    { key: 'maghrib', isFardh: true, icon: <Sunset className="w-5 h-5 text-neutral-500" /> },
    { key: 'isha', isFardh: true, icon: <Moon className="w-5 h-5 text-neutral-500" /> },
  ];

  const getStatus = (key: PrayerKey) => {
    if (key === nextPrayer) return 'next';
    if (key === currentPrayer) return 'current';
    return 'normal';
  };

  const getSoundLabel = (prayerKey: FardhPrayerKey) => {
    const config = notificationSettings.perPrayer[prayerKey];
    if (!config || !config.enabled) return 'Muted';
    switch (config.sound) {
      case 'makkah_adhan': return 'Makkah Adhan';
      case 'madinah_adhan': return 'Madinah Call';
      case 'takbeer': return 'Takbeer';
      case 'spiritual_chime': return 'Spiritual Chime';
      case 'gentle_beep': return 'Gentle Beep';
      case 'silent': return 'Silent Notification';
      default: return 'Adhan';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-black font-serif flex items-center gap-2">
            Today's Prayers
            <span className="text-xs font-sans font-normal text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
              5 Daily Prayers &bull; الفروض الخمسة
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Individual adhan preview, custom alarms, and prayer progression
          </p>
        </div>
      </div>

      {/* Prayers Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {prayerItems.map((item) => {
          const prayerMeta = PRAYER_DISPLAY_NAMES[item.key];
          const time = schedule.prayers[item.key];
          const timeStr = formatPrayerTime(time, timeFormat, timezone);
          const status = getStatus(item.key);
          const isFardh = item.isFardh;
          const fardhKey = item.key as FardhPrayerKey;
          const notifConfig = isFardh ? notificationSettings.perPrayer[fardhKey] : null;
          const isNotifEnabled = isFardh && notifConfig?.enabled && notificationSettings.masterEnabled;
          const isPlayingThis = playingSoundPrayer === item.key;

          // Border & Background style based on status
          let cardStyle = 'bg-white border-neutral-200 text-neutral-900 hover:border-neutral-400';
          if (status === 'next') {
            cardStyle = 'bg-neutral-100 border-black shadow-sm ring-1 ring-neutral-300 text-black';
          } else if (status === 'current') {
            cardStyle = 'bg-neutral-50 border-neutral-300 text-black';
          }

          return (
            <div
              key={item.key}
              id={`prayer-card-${item.key}`}
              className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between relative ${cardStyle}`}
            >
              {/* Top Row: Icon, Names, Status Badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-base text-black">
                        {prayerMeta.en}
                      </h4>
                      {!isFardh && (
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-sm bg-neutral-100 text-neutral-500 border border-neutral-200">
                          Sunnah
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-serif text-neutral-400">
                      {prayerMeta.ar}
                    </span>
                  </div>
                </div>

                {/* Status Indicator Badge */}
                {status === 'next' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-black text-white shadow-xs animate-pulse">
                    <Clock className="w-3 h-3" />
                    Next Prayer
                  </span>
                ) : status === 'current' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-black border border-neutral-300">
                    <Sparkles className="w-3 h-3 text-neutral-500" />
                    Current
                  </span>
                ) : null}
              </div>

              {/* Center: Scheduled Time */}
              <div className="my-3 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-black">
                  {timeStr}
                </span>

                {isFardh && (
                  <span className="text-xs text-neutral-500 font-medium truncate max-w-[120px]" title={getSoundLabel(fardhKey)}>
                    {getSoundLabel(fardhKey)}
                  </span>
                )}
              </div>

              {/* Bottom Actions Row: Preview Sound, Toggle Notification */}
              {isFardh ? (
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                  
                  {/* Listen / Preview Audio button */}
                  <button
                    id={`btn-listen-${item.key}`}
                    onClick={() => {
                      if (isPlayingThis) {
                        onStopAudio();
                      } else {
                        onPreviewPrayerSound(fardhKey);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                      isPlayingThis
                        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                        : 'bg-neutral-100 text-black hover:bg-neutral-200 border border-neutral-200'
                    }`}
                    title={isPlayingThis ? 'Stop Audio' : `Preview ${prayerMeta.en} Adhan`}
                  >
                    {isPlayingThis ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Preview Adhan</span>
                      </>
                    )}
                  </button>

                  {/* Toggle Notification */}
                  <button
                    id={`btn-toggle-notif-${item.key}`}
                    onClick={() => onTogglePrayerNotification(fardhKey)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                      isNotifEnabled
                        ? 'text-black bg-neutral-100 hover:bg-neutral-200 border border-neutral-300'
                        : 'text-neutral-400 hover:text-neutral-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                    title={isNotifEnabled ? 'Disable notification for this prayer' : 'Enable notification for this prayer'}
                  >
                    {isNotifEnabled ? (
                      <>
                        <Bell className="w-3.5 h-3.5 text-black fill-black" />
                        <span className="font-semibold text-black">Alert On</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3.5 h-3.5" />
                        <span>Muted</span>
                      </>
                    )}
                  </button>

                </div>
              ) : (
                <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-400 italic">
                  Fajr ends at sunrise &bull; Voluntary Ishraq prayer starts ~15m after
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Sunnah & Qiyam Reference Footer */}
      {(schedule.midnight || schedule.qiyam) && (
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-neutral-500" />
            <span className="font-semibold text-neutral-700">Night Reference Times:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {schedule.midnight && (
              <span>
                <span className="text-neutral-400">Islamic Midnight:</span>{' '}
                <strong className="font-mono text-neutral-800">{formatPrayerTime(schedule.midnight, timeFormat, timezone)}</strong>
              </span>
            )}
            {schedule.qiyam && (
              <span>
                <span className="text-neutral-400">Last 1/3 (Qiyam / Tahajjud):</span>{' '}
                <strong className="font-mono text-neutral-800">{formatPrayerTime(schedule.qiyam, timeFormat, timezone)}</strong>
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
