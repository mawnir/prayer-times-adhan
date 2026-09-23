import React from 'react';
import { Square, Sparkles, MapPin, CheckCircle2, X } from 'lucide-react';
import { ActiveAdhanAlert } from '../types';
import { PRAYER_DISPLAY_NAMES } from '../services/prayerService';
import { useLanguage } from '../context/LanguageContext';

interface ActiveAdhanModalProps {
  alert: ActiveAdhanAlert | null;
  onClose: () => void;
  onStopAudio: () => void;
  isAudioPlaying: boolean;
}

export const ActiveAdhanModal: React.FC<ActiveAdhanModalProps> = ({
  alert,
  onClose,
  onStopAudio,
  isAudioPlaying,
}) => {
  const { language, locale, t } = useLanguage();

  if (!alert) return null;

  const prayerMeta = PRAYER_DISPLAY_NAMES[alert.prayerName] || {
    en: alert.prayerDisplayName,
    ar: '',
    meaning: '',
  };
  const prayerName = language === 'ar' ? prayerMeta.ar || alert.prayerDisplayName : prayerMeta.en;
  const leadTimeText = t.adhan.leadTime.replace(
    '{count}',
    alert.leadMinutes.toLocaleString(locale),
  );
  const titleText = (alert.isLeadReminder ? t.adhan.prepare : t.adhan.now).replace(
    '{prayer}',
    prayerName,
  );

  const closeAndStop = () => {
    onStopAudio();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-panel max-w-xl !border-white/10 !bg-[#0c2630] !text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adhan-alert-title"
      >
        <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-white/52">
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>{alert.isLeadReminder ? leadTimeText : t.adhan.prayerTime}</span>
          </div>
          <button
            id="btn-close-active-adhan"
            type="button"
            onClick={closeAndStop}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/48 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={t.adhan.close}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="relative overflow-y-auto px-5 py-7 text-center sm:px-8 sm:py-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(241,246,241,.7) 0 1px, transparent 1.5px)',
              backgroundSize: '42px 42px',
              maskImage: 'radial-gradient(circle at center, #000, transparent 72%)',
            }}
            aria-hidden="true"
          />

          <div className="relative">
            <p className="font-serif text-3xl leading-none text-accent sm:text-4xl">
              {prayerName}
            </p>
            <h2 id="adhan-alert-title" className="mt-3 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">
              {titleText}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-white/46">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {alert.locationName}
            </div>

            {isAudioPlaying ? (
              <div className="mx-auto mt-6 flex h-9 w-fit items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-5" aria-label={t.adhan.playing}>
                {[0.35, 0.72, 1, 0.5, 0.84, 0.4, 0.64, 0.28].map((height, index) => (
                  <span
                    key={index}
                    className="sound-bar"
                    style={{ height: `${height * 100}%`, animationDelay: `${index * 90}ms` }}
                  />
                ))}
              </div>
            ) : null}

            <div className="mx-auto mt-7 max-w-md border-y border-white/10 py-5">
              <p className="font-serif text-lg leading-relaxed text-white/88" dir="rtl">
                اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ
              </p>
              <p className="mt-3 text-xs leading-5 text-white/44">
                {t.adhan.translation}
              </p>
            </div>

            <details className="mx-auto mt-4 max-w-md text-start">
              <summary className="cursor-pointer list-none text-xs font-semibold text-white/58 transition-colors hover:text-white">
                {t.adhan.dua}
              </summary>
              <div className="mt-3 rounded-[0.7rem_0.7rem_0.22rem_0.22rem] border border-white/10 bg-white/[0.035] p-4">
                <p className="font-serif text-sm leading-7 text-white/78" dir="rtl">
                  اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ
                </p>
              </div>
            </details>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-white/10 bg-black/10 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          {isAudioPlaying ? (
            <button
              id="btn-modal-stop-adhan"
              type="button"
              onClick={onStopAudio}
              className="danger-button min-w-40"
            >
              <Square className="h-4 w-4 fill-current" aria-hidden="true" />
              {t.adhan.stop}
            </button>
          ) : null}
          <button
            id="btn-modal-dismiss"
            type="button"
            onClick={closeAndStop}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[0.65rem] border border-white/14 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {isAudioPlaying ? t.adhan.stopClose : t.adhan.closeAlert}
          </button>
        </div>
      </div>
    </div>
  );
};
