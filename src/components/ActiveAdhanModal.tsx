import React from 'react';
import { 
  Square, 
  Volume2, 
  Sparkles, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { ActiveAdhanAlert } from '../types';
import { PRAYER_DISPLAY_NAMES } from '../services/prayerService';

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
  if (!alert) return null;

  const prayerMeta = PRAYER_DISPLAY_NAMES[alert.prayerName] || {
    en: alert.prayerDisplayName,
    ar: '',
    meaning: '',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-6 sm:p-8 text-black dark:text-white shadow-2xl overflow-hidden text-center space-y-6">

        {/* Close icon */}
        <button
          id="btn-close-active-adhan"
          onClick={() => {
            onStopAudio();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
          {alert.isLeadReminder ? `Reminder: ${alert.leadMinutes}m before prayer` : 'Prayer Time Alert'}
        </div>

        {/* Prayer Name in Large Arabic & English */}
        <div className="space-y-2">
          <div className="text-3xl sm:text-4xl font-serif text-neutral-500 dark:text-neutral-400">
            {prayerMeta.ar}
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold font-serif tracking-tight text-black dark:text-white">
            {alert.isLeadReminder ? `Prepare for ${prayerMeta.en}` : `Adhan: ${prayerMeta.en}`}
          </h2>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            {alert.locationName}
          </div>
        </div>

        {/* Animated Audio Equalizer Visualizer */}
        {isAudioPlaying && (
          <div className="py-2 flex items-center justify-center gap-1.5">
            {[40, 75, 55, 90, 65, 80, 45, 95, 60, 85, 50].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-black dark:bg-white rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.6 + (i % 4) * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Canonical Words of the Adhan / Call */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs space-y-2 font-serif text-neutral-800 dark:text-neutral-200 leading-relaxed">
          <p className="text-base text-black dark:text-white">
            اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ &bull; أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ
          </p>
          <p className="text-xs font-sans text-neutral-500 dark:text-neutral-400">
            "Allah is the Greatest. I bear witness that there is no deity worthy of worship except Allah."
          </p>
        </div>

        {/* Dua After Adhan Reference */}
        <div className="text-left p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
          <span className="font-bold text-black dark:text-white block uppercase tracking-wider text-[10px]">
            Dua After Adhan (Sunnah):
          </span>
          <p className="font-serif text-xs text-neutral-800 dark:text-neutral-200">
            اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ
          </p>
          <p className="text-neutral-500 dark:text-neutral-400 italic">
            "O Allah, Lord of this perfect call and established prayer, grant Muhammad the station of intercession and nobility, and raise him to the praised station which You promised him."
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {isAudioPlaying ? (
            <button
              id="btn-modal-stop-adhan"
              onClick={onStopAudio}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2 animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop Adhan Audio
            </button>
          ) : (
            <button
              id="btn-modal-dismiss"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-black hover:bg-neutral-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 dark:bg-neutral-700 dark:hover:bg-neutral-600"
            >
              <CheckCircle2 className="w-4 h-4" />
              Acknowledge &amp; Close
            </button>
          )}

          <button
            onClick={() => {
              onStopAudio();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 text-sm font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
