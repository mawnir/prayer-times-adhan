import React from 'react';
import {
  X,
  Settings,
  RotateCcw,
  Check
} from 'lucide-react';
import {
  CalculationMethodKey,
  CalculationSettings,
  HighLatitudeRuleKey,
  MadhabKey,
  PrayerKey
} from '../types';
import { PRAYER_DISPLAY_NAMES } from '../services/prayerService';

interface CalculationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CalculationSettings;
  onUpdateSettings: (newSettings: CalculationSettings) => void;
}

export const CalculationSettingsModal: React.FC<CalculationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const calculationMethods: { key: CalculationMethodKey; label: string; desc: string }[] = [
    { key: 'MuslimWorldLeague', label: 'Muslim World League (MWL)', desc: 'Standard in Europe, Far East, parts of America' },
    { key: 'UmmAlQura', label: 'Umm Al-Qura University, Makkah', desc: 'Standard across Saudi Arabia and Arabian Peninsula' },
    { key: 'Egyptian', label: 'Egyptian General Authority of Survey', desc: 'Widely used in Africa, Egypt, Middle East' },
    { key: 'NorthAmerica', label: 'Islamic Society of North America (ISNA)', desc: 'Standard across USA and Canada' },
    { key: 'Karachi', label: 'Univ. of Islamic Sciences, Karachi', desc: 'Standard across Pakistan, India, Bangladesh' },
    { key: 'Dubai', label: 'Dubai (UAE)', desc: 'Authorized Department of Islamic Affairs' },
    { key: 'Turkey', label: 'Diyanet İşleri Başkanlığı (Turkey)', desc: 'Official Turkish religious authority' },
    { key: 'Qatar', label: 'Qatar Ministry of Awqaf', desc: 'Official Qatari prayer calendar' },
    { key: 'Kuwait', label: 'Kuwait Ministry of Awqaf', desc: 'Official Kuwaiti prayer calendar' },
    { key: 'Singapore', label: 'MUIS (Singapore)', desc: 'Majlis Ugama Islam Singapura' },
    { key: 'Tehran', label: 'Institute of Geophysics, Tehran', desc: 'Leva Institute method' },
  ];

  const handleMethodChange = (method: CalculationMethodKey) => {
    onUpdateSettings({ ...settings, method });
  };

  const handleMadhabChange = (madhab: MadhabKey) => {
    onUpdateSettings({ ...settings, madhab });
  };

  const handleHighLatChange = (highLatitudeRule: HighLatitudeRuleKey) => {
    onUpdateSettings({ ...settings, highLatitudeRule });
  };

  const handleOffsetChange = (prayer: PrayerKey, delta: number) => {
    onUpdateSettings({
      ...settings,
      manualOffsets: {
        ...settings.manualOffsets,
        [prayer]: delta,
      },
    });
  };

  const handleResetOffsets = () => {
    onUpdateSettings({
      ...settings,
      manualOffsets: {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      },
    });
  };

  const prayersList: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  // Reference to avoid unused-parameter lint while keeping the API stable
  void handleHighLatChange;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white text-primary flex items-center justify-between border-b border-neutral-200 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-primary text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif flex items-center gap-2">
                Calculation &amp; Jurisprudence
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Fiqh &amp; Astronomy
                </span>
              </h3>
              <p className="text-xs text-neutral-500">
                Astronomical methods, Asr madhab, and minute adjustments
              </p>
            </div>
          </div>
          <button
            id="btn-close-calc-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-primary hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

          {/* Time Display Format */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-neutral-900">Time Display Format</h4>
              <p className="text-xs text-neutral-500">
                Toggle between standard 12-hour (AM/PM) and 24-hour military format
              </p>
            </div>
            <div className="flex items-center bg-neutral-200/80 p-1 rounded-xl shrink-0">
              <button
                id="btn-format-12h"
                onClick={() => onUpdateSettings({ ...settings, timeFormat: '12h' })}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  settings.timeFormat === '12h'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                12-Hour
              </button>
              <button
                id="btn-format-24h"
                onClick={() => onUpdateSettings({ ...settings, timeFormat: '24h' })}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  settings.timeFormat === '24h'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                24-Hour
              </button>
            </div>
          </div>

          {/* Asr Juristic Method (Madhab) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-1">
              Asr Juristic Method (Madhab)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="btn-madhab-shafi"
                onClick={() => handleMadhabChange('shafi')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  settings.madhab === 'shafi'
                    ? 'border-primary bg-neutral-50/70 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-neutral-900">
                    Standard (Shafi'i, Maliki, Hanbali)
                  </span>
                  {settings.madhab === 'shafi' && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Shadow length equals object height (1x shadow ratio).
                </p>
              </button>

              <button
                id="btn-madhab-hanafi"
                onClick={() => handleMadhabChange('hanafi')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  settings.madhab === 'hanafi'
                    ? 'border-primary bg-neutral-50/70 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-neutral-900">
                    Hanafi
                  </span>
                  {settings.madhab === 'hanafi' && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Shadow length equals twice object height (2x shadow ratio, later Asr).
                </p>
              </button>
            </div>
          </div>

          {/* Calculation Method Selection */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-1">
              Calculation Method &amp; Convention
            </span>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {calculationMethods.map((m) => {
                const isSelected = settings.method === m.key;
                return (
                  <div
                    key={m.key}
                    id={`method-choice-${m.key}`}
                    onClick={() => handleMethodChange(m.key)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-primary bg-neutral-50/70 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80 bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-neutral-900">{m.label}</div>
                      <div className="text-xs text-neutral-500">{m.desc}</div>
                    </div>
                    {isSelected && (
                      <span className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 text-primary flex items-center gap-1 shrink-0">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual Minute Offsets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Manual Minute Adjustments
                </span>
                <p className="text-xs text-neutral-500">
                  Calibrate prayer times to sync with your local mosque (+/- minutes)
                </p>
              </div>
              <button
                onClick={handleResetOffsets}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {prayersList.map((prayer) => {
                const meta = PRAYER_DISPLAY_NAMES[prayer];
                const offset = settings.manualOffsets[prayer] || 0;

                return (
                  <div
                    key={prayer}
                    className="p-2.5 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-bold text-neutral-900 capitalize">
                      {meta.en}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOffsetChange(prayer, offset - 1)}
                        className="w-6 h-6 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-primary flex items-center justify-center font-bold text-xs transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-primary">
                        {offset > 0 ? `+${offset}` : offset}m
                      </span>
                      <button
                        onClick={() => handleOffsetChange(prayer, offset + 1)}
                        className="w-6 h-6 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-primary flex items-center justify-center font-bold text-xs transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <span>Method: <strong className="text-primary">{calculationMethods.find((m) => m.key === settings.method)?.label}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-all shadow-xs"
          >
            Apply &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};
