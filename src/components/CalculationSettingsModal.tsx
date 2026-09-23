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
    <div className="modal-backdrop">
      <div className="modal-panel max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="calculation-settings-title">
        <div className="modal-header">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.7rem_0.7rem_0.25rem_0.25rem] bg-primary text-white">
              <Settings className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="calculation-settings-title" className="text-lg font-semibold tracking-[-0.025em] text-foreground">
                Calculation settings
              </h2>
              <p className="mt-0.5 text-xs leading-5 text-foreground/50">
                Match your local mosque and preferred method.
              </p>
            </div>
          </div>
          <button id="btn-close-calc-modal" type="button" onClick={onClose} className="icon-button" aria-label="Close settings">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body space-y-5">

          {/* Time Display Format */}
          <div className="flex items-center justify-between gap-3 rounded-[0.7rem_0.7rem_0.25rem_0.25rem] border border-muted-border bg-muted/65 p-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Time format</h3>
              <p className="mt-0.5 text-xs text-foreground/50">
                Toggle between standard 12-hour (AM/PM) and 24-hour military format
              </p>
            </div>
            <div className="view-switch shrink-0">
              <button
                id="btn-format-12h"
                onClick={() => onUpdateSettings({ ...settings, timeFormat: '12h' })}
                data-active={settings.timeFormat === '12h'}
                className="!px-3 !text-xs !font-semibold"
              >
                12-Hour
              </button>
              <button
                id="btn-format-24h"
                onClick={() => onUpdateSettings({ ...settings, timeFormat: '24h' })}
                data-active={settings.timeFormat === '24h'}
                className="!px-3 !text-xs !font-semibold"
              >
                24-Hour
              </button>
            </div>
          </div>

          {/* Asr Juristic Method (Madhab) */}
          <div className="space-y-2">
            <h3 className="px-1 text-sm font-semibold text-foreground">Asr calculation method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="btn-madhab-shafi"
                onClick={() => handleMadhabChange('shafi')}
                className={`rounded-[0.75rem_0.75rem_0.25rem_0.25rem] border p-3.5 text-left transition-colors ${
                  settings.madhab === 'shafi'
                    ? 'border-primary/55 bg-primary/[0.055]'
                    : 'border-muted-border bg-surface hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Standard (Shafi'i, Maliki, Hanbali)
                  </span>
                  {settings.madhab === 'shafi' && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-5 text-foreground/48">
                  Shadow length equals object height (1x shadow ratio).
                </p>
              </button>

              <button
                id="btn-madhab-hanafi"
                onClick={() => handleMadhabChange('hanafi')}
                className={`rounded-[0.75rem_0.75rem_0.25rem_0.25rem] border p-3.5 text-left transition-colors ${
                  settings.madhab === 'hanafi'
                    ? 'border-primary/55 bg-primary/[0.055]'
                    : 'border-muted-border bg-surface hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Hanafi
                  </span>
                  {settings.madhab === 'hanafi' && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-5 text-foreground/48">
                  Shadow length equals twice object height (2x shadow ratio, later Asr).
                </p>
              </button>
            </div>
          </div>

          {/* Calculation Method Selection */}
          <div className="space-y-2">
            <h3 className="px-1 text-sm font-semibold text-foreground">Calculation method</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {calculationMethods.map((m) => {
                const isSelected = settings.method === m.key;
                return (
                  <button
                    key={m.key}
                    id={`method-choice-${m.key}`}
                    type="button"
                    onClick={() => handleMethodChange(m.key)}
                    className={`flex w-full items-center justify-between gap-3 rounded-[0.7rem_0.7rem_0.22rem_0.22rem] border p-3 text-start transition-colors ${
                      isSelected
                        ? 'border-primary/55 bg-primary/[0.055]'
                        : 'border-muted-border bg-surface hover:bg-muted'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">{m.label}</div>
                      <div className="mt-0.5 text-xs leading-5 text-foreground/48">{m.desc}</div>
                    </div>
                    {isSelected ? (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> Selected
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Minute Offsets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Minute adjustments</h3>
                <p className="mt-0.5 text-xs text-foreground/48">
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

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {prayersList.map((prayer) => {
                const meta = PRAYER_DISPLAY_NAMES[prayer];
                const offset = settings.manualOffsets[prayer] || 0;

                return (
                  <div
                    key={prayer}
                    className="flex items-center justify-between gap-2 rounded-[0.65rem_0.65rem_0.2rem_0.2rem] border border-muted-border bg-surface p-2.5"
                  >
                    <span className="text-xs font-semibold capitalize text-foreground">
                      {meta.en}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOffsetChange(prayer, offset - 1)}
                        className="grid h-6 w-6 place-items-center rounded-md bg-muted text-xs font-bold text-foreground/55 transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-primary">
                        {offset > 0 ? `+${offset}` : offset}m
                      </span>
                      <button
                        onClick={() => handleOffsetChange(prayer, offset + 1)}
                        className="grid h-6 w-6 place-items-center rounded-md bg-muted text-xs font-bold text-foreground/55 transition-colors hover:bg-primary/10 hover:text-primary"
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
        <div className="modal-footer justify-between">
          <span className="min-w-0 truncate text-xs text-foreground/48">
            Method: <strong className="font-semibold text-foreground/75">{calculationMethods.find((method) => method.key === settings.method)?.label}</strong>
          </span>
          <button type="button" onClick={onClose} className="primary-button shrink-0">
            Apply settings
          </button>
        </div>

      </div>
    </div>
  );
};
