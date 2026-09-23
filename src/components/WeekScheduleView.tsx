import React, { useState } from 'react';
import { Table as TableIcon, LayoutGrid, Sunset } from 'lucide-react';
import { DayPrayerSchedule, LocationItem, PrayerKey } from '../types';
import { formatPrayerTime, PRAYER_DISPLAY_NAMES } from '../services/prayerService';
import {
  formatLocationDisplay,
  getCityDisplayName,
  getCountryDisplayName,
  getDayName,
  getDayNumber,
  getGregorianDisplay,
  getHijriDisplay,
  getHijriShort,
  getMonthName,
} from '../services/locationLocalization';
import { useLanguage } from '../context/LanguageContext';

interface WeekScheduleViewProps {
  schedule: DayPrayerSchedule[];
  location: LocationItem;
  timeFormat: '12h' | '24h';
  timezone?: string;
}

const PRAYER_KEYS: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const WeekScheduleView: React.FC<WeekScheduleViewProps> = ({ schedule, location, timeFormat, timezone }) => {
  const { language, locale, t } = useLanguage();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [subView, setSubView] = useState<'table' | 'cards'>('cards');
  const locationName = formatLocationDisplay(location, language);

  if (!schedule?.length) {
    return <div className="paper-panel grid min-h-48 place-items-center p-8 text-sm font-medium text-foreground/50">{t.loadingSchedule}</div>;
  }

  const visibleSchedule = schedule.slice(0, 7);
  const selectedDay = visibleSchedule[selectedDayIndex] || visibleSchedule[0];
  const formatHours = (value: number) => new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
  const fastingHours = formatHours((selectedDay.prayers.maghrib.getTime() - selectedDay.prayers.fajr.getTime()) / 3_600_000);
  const prayerLabel = (key: PrayerKey) => PRAYER_DISPLAY_NAMES[key][language];

  return (
    <section className="space-y-4" aria-labelledby="weekly-schedule-title">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-primary">
            <span>{t.scheduleTitle}</span><span className="h-px w-7 bg-primary/40" aria-hidden="true" /><span className="text-foreground/45">{t.nextWeek}</span>
          </div>
          <h2 id="weekly-schedule-title" className="text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-[1.7rem]">{getCityDisplayName(location, language)}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-foreground/52">
            {t.scheduleSubtitle.replace('{city}', getCityDisplayName(location, language)).replace('{country}', getCountryDisplayName(location, language))}
          </p>
        </div>

        <div className="view-switch self-start sm:self-auto" role="group" aria-label={t.scheduleView}>
          <button id="btn-subview-table" type="button" onClick={() => setSubView('table')} data-active={subView === 'table'} aria-pressed={subView === 'table'}>
            <TableIcon className="h-3.5 w-3.5" aria-hidden="true" /><span>{t.weeklyTable}</span>
          </button>
          <button id="btn-subview-cards" type="button" onClick={() => setSubView('cards')} data-active={subView === 'cards'} aria-pressed={subView === 'cards'}>
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" /><span>{t.dayInspector}</span>
          </button>
        </div>
      </div>

      <div className="schedule-rail scrollbar-none" role="tablist" aria-label={t.chooseDay}>
        {visibleSchedule.map((day, index) => {
          const isSelected = index === selectedDayIndex;
          return (
            <button key={day.dateKey} id={`btn-day-tab-${index}`} type="button" role="tab" aria-selected={isSelected} onClick={() => setSelectedDayIndex(index)} className="schedule-date" data-selected={isSelected}>
              <span className={`block text-[0.68rem] font-semibold ${isSelected ? 'text-white/72' : day.isToday ? 'text-primary' : 'text-foreground/45'}`}>
                {day.isToday ? t.today : getDayName(day, language)}
              </span>
              <span className="mt-1 block font-mono text-base font-semibold tracking-[-0.04em] sm:text-lg">{getDayNumber(day, language)} {getMonthName(day, language)}</span>
              <span className={`mt-0.5 block truncate text-[0.64rem] ${isSelected ? 'text-white/66' : 'text-foreground/42'}`}>{getHijriShort(day, language)}</span>
            </button>
          );
        })}
      </div>

      {subView === 'table' ? (
        <div className="schedule-sheet">
          <div className="overflow-x-auto">
            <table className="schedule-table w-full min-w-[48rem] text-sm">
              <thead><tr>
                <th className="text-start">{t.dateAndDay}</th>
                {PRAYER_KEYS.map((key) => <th key={key} className={key === 'sunrise' ? 'text-foreground/34' : ''} scope="col">{prayerLabel(key)}</th>)}
                <th className="hidden pe-4 text-end md:table-cell">{t.fasting}</th>
              </tr></thead>
              <tbody>
                {visibleSchedule.map((day, index) => {
                  const isSelected = index === selectedDayIndex;
                  const fastingWindow = formatHours((day.prayers.maghrib.getTime() - day.prayers.fajr.getTime()) / 3_600_000);
                  const selectDay = () => setSelectedDayIndex(index);
                  return (
                    <tr
                      key={day.dateKey} onClick={selectDay}
                      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectDay(); } }}
                      tabIndex={0} data-selected={isSelected} data-today={day.isToday}
                      aria-label={getGregorianDisplay(day, language)} className="cursor-pointer"
                    >
                      <td className="min-w-44 px-4 text-start">
                        <div className="flex items-center gap-3">
                          <span className={`h-7 w-0.5 shrink-0 rounded-full ${day.isToday ? 'bg-accent' : 'bg-transparent'}`} aria-hidden="true" />
                          <div>
                            <div className="date-primary flex items-center gap-2 font-semibold tracking-[-0.01em] text-foreground">
                              <span>{getGregorianDisplay(day, language)}</span>
                              {day.isToday && <span className="text-[0.65rem] font-semibold text-primary">{t.today}</span>}
                            </div>
                            <div className="mt-0.5 text-[0.68rem] text-foreground/45">{getHijriDisplay(day, language)}</div>
                          </div>
                        </div>
                      </td>
                      {PRAYER_KEYS.map((key) => (
                        <td key={key} dir="ltr">
                          <time className={`schedule-time ${key === 'sunrise' ? 'text-foreground/34' : key === 'maghrib' ? 'font-semibold text-primary' : 'text-foreground/78'}`} dateTime={day.prayers[key].toISOString()}>
                            {formatPrayerTime(day.prayers[key], timeFormat, timezone, locale)}
                          </time>
                        </td>
                      ))}
                      <td className="schedule-time hidden whitespace-nowrap pe-4 text-end text-foreground/48 md:table-cell" dir="ltr">{fastingWindow} {t.hoursShort}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-1 border-t border-muted-border bg-muted/60 px-4 py-3 text-[0.68rem] text-foreground/45 sm:flex-row sm:items-center sm:justify-between">
            <span>{t.tableHint}</span><span>{t.tableCalculatedFor} {locationName}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-[0.3rem_0.3rem_1rem_1rem] border border-muted-border bg-muted/65 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
            <div>
              <p className="text-xs font-medium text-primary">{selectedDay.isToday ? t.today : getDayName(selectedDay, language)}</p>
              <h3 className="mt-0.5 text-lg font-semibold tracking-[-0.02em] text-foreground">
                {getGregorianDisplay(selectedDay, language)}, {new Intl.NumberFormat(locale, { useGrouping: false }).format(Number(selectedDay.dateKey.slice(0, 4)))}
              </h3>
              <p className="mt-0.5 text-xs text-foreground/48">{getHijriDisplay(selectedDay, language)}</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-[0.65rem] border border-muted-border bg-surface px-3 py-2 text-xs text-foreground/58 sm:self-auto">
              <Sunset className="h-4 w-4 text-accent" aria-hidden="true" /><span>{t.fastingWindow}:</span>
              <strong className="font-mono font-semibold text-foreground" dir="auto">{fastingHours} {t.hoursShort}</strong>
            </div>
          </div>

          <div className="day-detail-grid grid grid-cols-2 overflow-hidden rounded-[0.3rem_0.3rem_1rem_1rem] border border-muted-border sm:grid-cols-3 lg:grid-cols-6">
            {PRAYER_KEYS.map((key) => {
              const isSunrise = key === 'sunrise';
              const contextLabel = isSunrise ? t.shuruq : key === 'fajr' ? t.suhoorEnds : key === 'maghrib' ? t.iftarSunset : t.obligatory;
              const meta = PRAYER_DISPLAY_NAMES[key];
              return (
                <div key={key} className="day-detail-cell">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[0.68rem] font-semibold ${isSunrise ? 'text-foreground/38' : 'text-foreground/64'}`}>{meta[language]}</span>
                    <span className="font-serif text-sm text-primary/70" dir="rtl">{language === 'ar' ? meta.en : meta.ar}</span>
                  </div>
                  <time className={`mt-5 block font-mono text-xl font-semibold tracking-[-0.045em] ${isSunrise ? 'text-foreground/38' : key === 'maghrib' ? 'text-primary' : 'text-foreground'}`} dateTime={selectedDay.prayers[key].toISOString()} dir="ltr">
                    {formatPrayerTime(selectedDay.prayers[key], timeFormat, timezone, locale)}
                  </time>
                  <p className="mt-2 text-[0.66rem] text-foreground/40">{contextLabel}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
