import { ActiveAdhanAlert, FardhPrayerKey, LocationItem, NotificationSettings, PrayerKey } from '../types';
import { audioService } from './audioService';
import { PRAYER_DISPLAY_NAMES } from './prayerService';

export class NotificationService {
  private static lastTriggeredKeys: Set<string> = new Set();

  public static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  public static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public static triggerAlert(
    prayer: PrayerKey,
    location: LocationItem,
    settings: NotificationSettings,
    isLeadReminder: boolean = false,
    leadMinutes: number = 0,
    onShowActiveAdhan?: (alert: ActiveAdhanAlert) => void
  ): void {
    const fardhKey = prayer as FardhPrayerKey;
    const config = settings.perPrayer[fardhKey];

    const prayerInfo = PRAYER_DISPLAY_NAMES[prayer];
    const prayerName = prayerInfo ? prayerInfo.en : prayer;
    const arabicName = prayerInfo ? prayerInfo.ar : '';

    const title = isLeadReminder
      ? `Upcoming: ${prayerName} Prayer in ${leadMinutes} minutes`
      : `Adhan: Time for ${prayerName} (${arabicName})`;

    const body = `${location.name}, ${location.country} — ${isLeadReminder ? `Prepare for ${prayerName}` : `It is now time for ${prayerName} prayer.`}`;

    // 1. Browser Push Notification
    if (settings.showBrowserNotification && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: `prayer-${prayer}-${Date.now()}`,
        });
      } catch (e) {
        console.warn('Browser notification error:', e);
      }
    }

    // 2. Play Audio if enabled
    if (config && config.sound !== 'silent' && settings.volume > 0) {
      audioService.playSound(config.sound, settings.volume);
    }

    // 3. Trigger In-App Active Adhan view if provided
    if (onShowActiveAdhan) {
      onShowActiveAdhan({
        prayerName: prayer,
        prayerDisplayName: prayerName,
        locationName: `${location.name}, ${location.country}`,
        time: new Date(),
        isLeadReminder,
        leadMinutes,
      });
    }
  }

  // Check today's prayers and trigger if time matches
  public static checkPrayerTimes(
    prayers: Record<PrayerKey, Date>,
    location: LocationItem,
    settings: NotificationSettings,
    onShowActiveAdhan?: (alert: ActiveAdhanAlert) => void
  ): void {
    if (!settings.masterEnabled) return;

    const now = new Date();
    const nowMs = now.getTime();
    const minuteWindowMs = 60 * 1000;

    const prayerKeys: FardhPrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

    for (const pKey of prayerKeys) {
      const pConfig = settings.perPrayer[pKey];
      if (!pConfig || !pConfig.enabled) continue;

      const pDate = prayers[pKey];
      if (!pDate) continue;

      const exactTimeMs = pDate.getTime();
      const leadTimeMs = exactTimeMs - (pConfig.leadTimeMinutes || 0) * 60 * 1000;

      // Unique deduplication keys per day & minute
      const dayKey = now.toISOString().slice(0, 10);
      const exactKey = `${dayKey}-${location.id}-${pKey}-exact`;
      const leadKey = `${dayKey}-${location.id}-${pKey}-lead-${pConfig.leadTimeMinutes}`;

      // Check Lead Time Notification
      if (pConfig.leadTimeMinutes > 0) {
        const diffLead = nowMs - leadTimeMs;
        if (diffLead >= 0 && diffLead < minuteWindowMs && !this.lastTriggeredKeys.has(leadKey)) {
          this.lastTriggeredKeys.add(leadKey);
          this.triggerAlert(pKey, location, settings, true, pConfig.leadTimeMinutes, onShowActiveAdhan);
        }
      }

      // Check Exact Prayer Time
      const diffExact = nowMs - exactTimeMs;
      if (diffExact >= 0 && diffExact < minuteWindowMs && !this.lastTriggeredKeys.has(exactKey)) {
        this.lastTriggeredKeys.add(exactKey);
        this.triggerAlert(pKey, location, settings, false, 0, onShowActiveAdhan);
      }
    }
  }
}
