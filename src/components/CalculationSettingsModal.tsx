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
import { useLanguage } from '../context/LanguageContext';

type LocalizedText = { en: string; ar: string };

const CALCULATION_METHOD_TEXT: Record<CalculationMethodKey, { label: LocalizedText; description: LocalizedText }> = {
  MuslimWorldLeague: {
    label: { en: 'Muslim World League (MWL)', ar: 'رابطة العالم الإسلامي' },
    description: { en: 'Standard in Europe, Far East, parts of America', ar: 'معيار في أوروبا وشرق آسيا وأجزاء من أمريكا' },
  },
  UmmAlQura: {
    label: { en: 'Umm Al-Qura University, Makkah', ar: 'جامعة أم القرى، مكة المكرمة' },
    description: { en: 'Standard across Saudi Arabia and Arabian Peninsula', ar: 'المعيار في السعودية وشبه الجزيرة العربية' },
  },
  Egyptian: {
    label: { en: 'Egyptian General Authority of Survey', ar: 'الهيئة المصرية العامة للمساحة' },
    description: { en: 'Widely used in Africa, Egypt, Middle East', ar: 'شائع الاستخدام في أفريقيا ومصر والشرق الأوسط' },
  },
  NorthAmerica: {
    label: { en: 'Islamic Society of North America (ISNA)', ar: 'الجمعية الإسلامية لأمريكا الشمالية' },
    description: { en: 'Standard across USA and Canada', ar: 'المعيار في الولايات المتحدة وكندا' },
  },
  Karachi: {
    label: { en: 'Univ. of Islamic Sciences, Karachi', ar: 'جامعة العلوم الإسلامية، كراتشي' },
    description: { en: 'Standard across Pakistan, India, Bangladesh', ar: 'المعيار في باكستان والهند وبنغلاديش' },
  },
  Dubai: {
    label: { en: 'Dubai (UAE)', ar: 'دبي، الإمارات العربية المتحدة' },
    description: { en: 'Authorized Department of Islamic Affairs', ar: 'إدارة الشؤون الدينية المعتمدة' },
  },
  Turkey: {
    label: { en: 'Diyanet İşleri Başkanlığı (Turkey)', ar: 'رئاسة الشؤون الدينية في تركيا' },
    description: { en: 'Official Turkish religious authority', ar: 'السلطة الدينية الرسمية في تركيا' },
  },
  Qatar: {
    label: { en: 'Qatar Ministry of Awqaf', ar: 'وزارة الأوقاف القطرية' },
    description: { en: 'Official Qatari prayer calendar', ar: 'التقويم الرسمي لصلوات دولة قطر' },
  },
  Kuwait: {
    label: { en: 'Kuwait Ministry of Awqaf', ar: 'وزارة الأوقاف الكويتية' },
    description: { en: 'Official Kuwaiti prayer calendar', ar: 'التقويم الرسمي لصلوات دولة الكويت' },
  },
  Singapore: {
    label: { en: 'MUIS (Singapore)', ar: 'مجلس العلماء الإسلامي في سنغافورة' },
    description: { en: 'Majlis Ugama Islam Singapura', ar: 'هيئة الشريعة الإسلامية بسنغافورة' },
  },
  Tehran: {
    label: { en: 'Institute of Geophysics, Tehran', ar: 'معهد الجيوفيزياء، طهران' },
    description: { en: 'Leva Institute method', ar: 'طريقة معهد ليفا' },
  },
};

const OFFSET_CONTROL_LABELS = {
  en: {
    decrease: (prayer: string) => `Decrease ${prayer} time by one minute`,
    increase: (prayer: string) => `Increase ${prayer} time by one minute`,
  },
  ar: {
    decrease: (prayer: string) => `إنقاص وقت ${prayer} بمقيقة واحدة`,
    increase: (prayer: string) => `زيادة وقت ${prayer} بمقيقة واحدة`,
  },
};

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
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  const calculationMethods: { key: CalculationMethodKey; label: string; description: string }[] =
    (Object.entries(CALCULATION_METHOD_TEXT) as [CalculationMethodKey, (typeof CALCULATION_METHOD_TEXT)[CalculationMethodKey]][])
      .map(([key, text]) => ({
        key,
        label: text.label[language],
        description: text.description[language],
      }));

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
                {t.calculation.title}
              </h2>
              <p className="mt-0.5 text-xs leading-5 text-foreground/50">
                {t.calculation.subtitle}
              </p>
            </div>
          </div>
          <button id="btn-close-calc-modal" type="button" onClick={onClose} className="icon-button" aria-label={t.calculation.close}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body space-y-5">

          {/* Time Display Format */}
          <div className="flex items-center justify-between gap-3 rounded-[0.7rem_0.7rem_0.25rem_0.25rem] border border-muted-border bg-muted/65 p-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{t.calculation.timeFormat}</h3>
              <p className="mt-0.5 text-xs text-foreground/50">
                {t.calculation.timeFormatDescription}
              </p>
            </div>
            <div className="view-switch shrink-0">
              <button
                id="btn-format-12h"
                onClick={() => onUpdateSettings({ ...settings, timeFormat: '12h' })}
                data-active={settings.timeFormat === '12h'}
                aria-pressed={settings.timeFormat === '12h'}
                className="!px-3 !text-xs !font-semibold"
              >
                {t.calculation.twelveHour}
              </button>
              <button
                id="btn-format-24h"
                onClick={() => onUpdateSettings({ ...settings, timeFormat: '24h' })}
                data-active={settings.timeFormat === '24h'}
                aria-pressed={settings.timeFormat === '24h'}
                className="!px-3 !text-xs !font-semibold"
              >
                {t.calculation.twentyFourHour}
              </button>
            </div>
          </div>

          {/* Asr Juristic Method (Madhab) */}
          <div className="space-y-2">
            <h3 className="px-1 text-sm font-semibold text-foreground">{t.calculation.asrMethod}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="btn-madhab-shafi"
                aria-pressed={settings.madhab === 'shafi'}
                onClick={() => handleMadhabChange('shafi')}
                className={`rounded-[0.75rem_0.75rem_0.25rem_0.25rem] border p-3.5 text-start transition-colors ${
                  settings.madhab === 'shafi'
                    ? 'border-primary/55 bg-primary/[0.055]'
                    : 'border-muted-border bg-surface hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {t.calculation.standard}
                  </span>
                  {settings.madhab === 'shafi' && (
                    <Check className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-5 text-foreground/48">
                  {t.calculation.standardDescription}
                </p>
              </button>

              <button
                id="btn-madhab-hanafi"
                aria-pressed={settings.madhab === 'hanafi'}
                onClick={() => handleMadhabChange('hanafi')}
                className={`rounded-[0.75rem_0.75rem_0.25rem_0.25rem] border p-3.5 text-start transition-colors ${
                  settings.madhab === 'hanafi'
                    ? 'border-primary/55 bg-primary/[0.055]'
                    : 'border-muted-border bg-surface hover:bg-muted'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {t.calculation.hanafi}
                  </span>
                  {settings.madhab === 'hanafi' && (
                    <Check className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  )}
                </div>
                <p className="mt-1 text-xs leading-5 text-foreground/48">
                  {t.calculation.hanafiDescription}
                </p>
              </button>
            </div>
          </div>

          {/* Calculation Method Selection */}
          <div className="space-y-2">
            <h3 className="px-1 text-sm font-semibold text-foreground">{t.calculation.method}</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {calculationMethods.map((m) => {
                const isSelected = settings.method === m.key;
                return (
                  <button
                    key={m.key}
                    id={`method-choice-${m.key}`}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleMethodChange(m.key)}
                    className={`flex w-full items-center justify-between gap-3 rounded-[0.7rem_0.7rem_0.22rem_0.22rem] border p-3 text-start transition-colors ${
                      isSelected
                        ? 'border-primary/55 bg-primary/[0.055]'
                        : 'border-muted-border bg-surface hover:bg-muted'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">{m.label}</div>
                      <div className="mt-0.5 text-xs leading-5 text-foreground/48">{m.description}</div>
                    </div>
                    {isSelected ? (
                      <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> {t.calculation.selected}
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
                <h3 className="text-sm font-semibold text-foreground">{t.calculation.adjustments}</h3>
                <p className="mt-0.5 text-xs text-foreground/48">
                  {t.calculation.adjustmentsDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetOffsets}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" /> {t.calculation.reset}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {prayersList.map((prayer) => {
                const meta = PRAYER_DISPLAY_NAMES[prayer];
                const prayerName = meta[language];
                const offset = settings.manualOffsets[prayer] || 0;

                return (
                  <div
                    key={prayer}
                    className="flex items-center justify-between gap-2 rounded-[0.65rem_0.65rem_0.2rem_0.2rem] border border-muted-border bg-surface p-2.5"
                  >
                    <span className="text-xs font-semibold capitalize text-foreground">
                      {prayerName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={OFFSET_CONTROL_LABELS[language].decrease(prayerName)}
                        onClick={() => handleOffsetChange(prayer, offset - 1)}
                        className="grid h-6 w-6 place-items-center rounded-md bg-muted text-xs font-bold text-foreground/55 transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-primary">
                        {offset > 0 ? `+${offset}` : offset} {t.calculation.minutes}
                      </span>
                      <button
                        type="button"
                        aria-label={OFFSET_CONTROL_LABELS[language].increase(prayerName)}
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
            {t.calculation.methodLabel} <strong className="font-semibold text-foreground/75">{calculationMethods.find((method) => method.key === settings.method)?.label}</strong>
          </span>
          <button type="button" onClick={onClose} className="primary-button shrink-0">
            {t.calculation.apply}
          </button>
        </div>

      </div>
    </div>
  );
};
