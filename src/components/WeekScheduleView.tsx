import React, { useState } from 'react';
import { 
  Table as TableIcon, 
  LayoutGrid, 
  Sunset, 
} from 'lucide-react';
import { DayPrayerSchedule, LocationItem, PrayerKey } from '../types';
import { formatPrayerTime } from '../services/prayerService';
import { useLanguage } from '../context/LanguageContext';

interface WeekScheduleViewProps {
  schedule: DayPrayerSchedule[];
  location: LocationItem;
  timeFormat: '12h' | '24h';
  timezone?: string;
}

export const WeekScheduleView: React.FC<WeekScheduleViewProps> = ({
  schedule,
  location,
  timeFormat,
  timezone,
}) => {
  const { language, t } = useLanguage();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [subView, setSubView] = useState<'cards' | 'table'>('table');

  if (!schedule || schedule.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-400 dark:text-neutral-500 font-medium">
        Loading schedule...
      </div>
    );
  }

  const selectedDay = schedule[selectedDayIndex] || schedule[0];

  // Calculate fasting duration for selected day (Fajr to Maghrib)
  const fajrMs = selectedDay.prayers.fajr.getTime();
  const maghribMs = selectedDay.prayers.maghrib.getTime();
  const fastingHours = ((maghribMs - fajrMs) / 3600000).toFixed(1);

  const prayerCols: { key: PrayerKey; label: string; ar: string }[] = [
    { key: 'fajr', label: 'Fajr', ar: 'الفجر' },
    { key: 'sunrise', label: 'Sunrise', ar: 'الشروق' },
    { key: 'dhuhr', label: 'Dhuhr', ar: 'الظهر' },
    { key: 'asr', label: 'Asr', ar: 'العصر' },
    { key: 'maghrib', label: 'Maghrib', ar: 'المغرب' },
    { key: 'isha', label: 'Isha', ar: 'العشاء' },
  ];

  return (
    <div className="space-y-5">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <span>{t.scheduleTitle}</span>
            <span 
              className="text-[11px] font-medium text-white px-2 py-0.5 rounded-full shadow-2xs"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {t.nextWeek}
            </span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.scheduleSubtitle
              .replace('{city}', location.name)
              .replace('{country}', location.country)}
          </p>
        </div>

        {/* View Switcher: Full Table vs Day by Day (shadcn tabs / segmented button) */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg border border-neutral-200/80 dark:border-neutral-700/80 text-xs shadow-2xs self-start sm:self-auto">
          <button
            id="btn-subview-table"
            onClick={() => setSubView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              subView === 'table'
                ? 'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span>{t.weeklyTable}</span>
          </button>
          <button
            id="btn-subview-cards"
            onClick={() => setSubView('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              subView === 'cards'
                ? 'bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span>{t.dayInspector}</span>
          </button>
        </div>
      </div>

      {/* 7-Day Horizontal Selector Carousel */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse overflow-x-auto pb-2 scrollbar-none">
        {schedule.map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={day.dateKey}
              id={`btn-day-tab-${idx}`}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-150 min-w-[85px] sm:min-w-[95px] text-center shadow-2xs ${
                isSelected
                  ? 'text-white shadow-xs'
                  : 'bg-white text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-700/80 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
              style={isSelected ? {
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-primary)',
              } : undefined}
            >
              <span className={`text-[11px] uppercase font-semibold ${isSelected ? 'text-white/80' : 'text-neutral-400 dark:text-neutral-500'}`}>
                {day.isToday ? t.today : day.dayName}
              </span>
              <span className="text-lg font-bold font-mono my-0.5">
                {day.dayNumber} {day.monthName}
              </span>
              <span className={`text-[10px] truncate max-w-[80px] ${isSelected ? 'text-white/90' : 'text-neutral-500 font-medium dark:text-neutral-400'}`}>
                {day.hijriDate.day} {day.hijriDate.monthName.slice(0, 7)}
              </span>
            </button>
          );
        })}
      </div>

      {/* SUBVIEW 1: Complete 7-Day Timetable Grid */}
      {subView === 'table' && (
        <div className="overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200/80 dark:border-neutral-700/80 text-neutral-600 dark:text-neutral-400 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 text-start">{t.dateAndDay}</th>
                  {prayerCols.map((col) => (
                    <th 
                      key={col.key} 
                      className={`py-3 px-3 text-center ${
                        col.key === 'maghrib' 
                          ? 'font-bold text-neutral-900 dark:text-neutral-100' 
                          : col.key === 'sunrise'
                          ? 'text-neutral-400 font-normal dark:text-neutral-500'
                          : ''
                      }`}
                    >
                      {language === 'ar' ? col.ar : col.label}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-end text-neutral-500 dark:text-neutral-400 hidden md:table-cell">{t.fasting}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {schedule.map((day, idx) => {
                  const isToday = day.isToday;
                  const isSelected = idx === selectedDayIndex;
                  const fMs = day.prayers.fajr.getTime();
                  const mMs = day.prayers.maghrib.getTime();
                  const fHours = ((mMs - fMs) / 3600000).toFixed(1);

                  return (
                    <tr
                      key={day.dateKey}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`cursor-pointer transition-colors ${
                        isToday
                          ? 'bg-neutral-50/90 font-medium text-neutral-900 dark:bg-neutral-800/90 dark:text-neutral-100'
                          : isSelected
                          ? 'bg-neutral-50/60 dark:bg-neutral-800/60'
                          : 'hover:bg-neutral-50/60 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      {/* Date & Hijri column */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isToday && (
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: 'var(--color-primary)' }}
                              title={t.today} 
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
                              <span>{day.dayName}, {day.monthName} {day.dayNumber}</span>
                              {isToday && (
                                <span 
                                  className="text-[10px] uppercase px-1.5 py-0.2 rounded text-white font-semibold"
                                  style={{ backgroundColor: 'var(--color-primary)' }}
                                >
                                  {t.today}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {day.hijriDate.formatted}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Fajr */}
                      <td className="py-3 px-3 text-center font-mono text-neutral-800 dark:text-neutral-200" dir="ltr">
                        {formatPrayerTime(day.prayers.fajr, timeFormat, timezone)}
                      </td>

                      {/* Sunrise */}
                      <td className="py-3 px-3 text-center font-mono text-neutral-400 dark:text-neutral-500 text-xs" dir="ltr">
                        {formatPrayerTime(day.prayers.sunrise, timeFormat, timezone)}
                      </td>

                      {/* Dhuhr */}
                      <td className="py-3 px-3 text-center font-mono text-neutral-800 dark:text-neutral-200" dir="ltr">
                        {formatPrayerTime(day.prayers.dhuhr, timeFormat, timezone)}
                      </td>

                      {/* Asr */}
                      <td className="py-3 px-3 text-center font-mono text-neutral-800 dark:text-neutral-200" dir="ltr">
                        {formatPrayerTime(day.prayers.asr, timeFormat, timezone)}
                      </td>

                      {/* Maghrib / Iftar */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-neutral-900 dark:text-neutral-100 bg-neutral-50/70 dark:bg-neutral-800/70" dir="ltr">
                        {formatPrayerTime(day.prayers.maghrib, timeFormat, timezone)}
                      </td>

                      {/* Isha */}
                      <td className="py-3 px-3 text-center font-mono text-neutral-800 dark:text-neutral-200" dir="ltr">
                        {formatPrayerTime(day.prayers.isha, timeFormat, timezone)}
                      </td>

                      {/* Fasting Duration */}
                      <td className="py-3 px-4 text-end text-xs text-neutral-500 dark:text-neutral-400 font-mono hidden md:table-cell" dir="ltr">
                        {fHours} {t.hoursShort}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-neutral-50/80 dark:bg-neutral-800/80 border-t border-neutral-200/80 dark:border-neutral-700/80 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
            <span>{t.tableHint}</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {t.tableCalculatedFor} {location.name}
            </span>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: Selected Day Detailed Cards Inspector */}
      {subView === 'cards' && (
        <div className="space-y-4">
          
          {/* Day Highlight Card */}
          <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-lg text-white font-bold text-lg font-mono shadow-xs"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {selectedDay.dayNumber}
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                  {selectedDay.dayName}, {selectedDay.monthName} {selectedDay.dayNumber}, {selectedDay.date.getFullYear()}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {selectedDay.hijriDate.formatted}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-md border border-neutral-200/80 dark:border-neutral-700/80 shadow-2xs">
                <Sunset className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                <span>{t.fastingWindow}: <strong className="text-neutral-900 dark:text-neutral-100">{fastingHours} {t.hoursShort}</strong></span>
              </div>
            </div>
          </div>

          {/* 6 Prayers Grid for Selected Day */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {prayerCols.map((col) => {
              const time = selectedDay.prayers[col.key];
              const isSunrise = col.key === 'sunrise';
              const isMaghrib = col.key === 'maghrib';

              return (
                <div
                  key={col.key}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isSunrise
                      ? 'bg-neutral-50/80 dark:bg-neutral-800/80 border-neutral-200/80 dark:border-neutral-700/80 text-neutral-600 dark:text-neutral-400'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-700/80 text-neutral-900 dark:text-neutral-100 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      {language === 'ar' ? col.ar : col.label}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium dark:text-neutral-500">
                      {language === 'ar' ? col.label : col.ar}
                    </span>
                  </div>

                  <div className="my-2.5 font-mono text-xl font-bold tracking-tight" dir="ltr">
                    {formatPrayerTime(time, timeFormat, timezone)}
                  </div>

                  <div className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {isMaghrib
                      ? t.iftarSunset
                      : col.key === 'fajr'
                      ? t.suhoorEnds
                      : isSunrise
                      ? t.shuruq
                      : t.obligatory}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};

