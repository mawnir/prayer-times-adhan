import React from 'react';
import { 
  X, 
  Settings, 
  Compass, 
  RotateCcw,
  Sliders,
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

  const handleTimeFormatToggle = () => {
    onUpdateSettings({
      ...settings,
      timeFormat: settings.timeFormat === '12h' ? '24h' : '12h',
    });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-800 text-emerald-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif">Calculation &amp; Jurisprudence</h3>
              <p className="text-xs text-emerald-300">
                Astronomical methods, Asr madhab, and minute adjustments
              </p>
            </div>
          </div>
          <button
            id="btn-close-calc-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Time Display Format */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Time Display Format</h4>
              <p className="text-xs text-slate-500">
                Toggle between standard 12-hour (AM/PM) and 24-hour military format
              </p>
            </div>
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
              <button
                id="btn-format-12h"
                onClick={() => onUpdateSettings({ ...settings, timeFormat: '12h' })}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  settings.timeFormat === '12h'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                12-Hour
              </button>
              <button
                id="btn-format-24h"
                onClick={() => onUpdateSettings({ ...settings, timeFormat: '24h' })}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  settings.timeFormat === '24h'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                24-Hour
              </button>
            </div>
          </div>

          {/* Asr Juristic Method (Madhab) */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
              Asr Juristic Method (Madhab)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-madhab-shafi"
                onClick={() => handleMadhabChange('shafi')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  settings.madhab === 'shafi'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">
                    Standard (Shafi'i, Maliki, Hanbali)
                  </span>
                  {settings.madhab === 'shafi' && (
                    <Check className="w-4 h-4 text-emerald-700" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Shadow length equals object height (1x shadow ratio).
                </p>
              </button>

              <button
                id="btn-madhab-hanafi"
                onClick={() => handleMadhabChange('hanafi')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  settings.madhab === 'hanafi'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">
                    Hanafi
                  </span>
                  {settings.madhab === 'hanafi' && (
                    <Check className="w-4 h-4 text-emerald-700" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Shadow length equals twice object height (2x shadow ratio, later Asr).
                </p>
              </button>
            </div>
          </div>

          {/* Calculation Method Selection */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
              Calculation Method &amp; Convention
            </h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {calculationMethods.map((m) => {
                const isSelected = settings.method === m.key;
                return (
                  <div
                    key={m.key}
                    id={`method-choice-${m.key}`}
                    onClick={() => handleMethodChange(m.key)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{m.label}</div>
                      <div className="text-xs text-slate-500">{m.desc}</div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual Minute Offsets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-xs">
                  Manual Minute Adjustments
                </h4>
                <p className="text-xs text-slate-500">
                  Calibrate prayer times to sync with your local mosque (+/- minutes)
                </p>
              </div>
              <button
                onClick={handleResetOffsets}
                className="text-xs text-slate-500 hover:text-emerald-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {prayersList.map((prayer) => {
                const meta = PRAYER_DISPLAY_NAMES[prayer];
                const offset = settings.manualOffsets[prayer] || 0;

                return (
                  <div
                    key={prayer}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-slate-800 capitalize">
                      {meta.en}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOffsetChange(prayer, offset - 1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-slate-900">
                        {offset > 0 ? `+${offset}` : offset}m
                      </span>
                      <button
                        onClick={() => handleOffsetChange(prayer, offset + 1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            Apply &amp; Close
          </button>
        </div>

      </div>
    </div>
  );
};
