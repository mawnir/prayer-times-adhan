import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Table as TableIcon, 
  LayoutGrid, 
  Clock, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  Sparkles,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { DayPrayerSchedule, LocationItem, PrayerKey } from '../types';
import { PRAYER_DISPLAY_NAMES, formatPrayerTime } from '../services/prayerService';

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
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [subView, setSubView] = useState<'cards' | 'table'>('table');

  if (!schedule || schedule.length === 0) {
    return <div className="p-8 text-center text-slate-400">Loading schedule...</div>;
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
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-emerald-950 font-serif flex items-center gap-2">
            7-Day Prayer Schedule
            <span className="text-xs font-sans font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              Next Week
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Prayer times for {location.name}, {location.country} across the next 7 days
          </p>
        </div>

        {/* View Switcher: Full Table vs Day by Day */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            id="btn-subview-table"
            onClick={() => setSubView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              subView === 'table'
                ? 'bg-white text-emerald-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-emerald-700" />
            Weekly Table
          </button>
          <button
            id="btn-subview-cards"
            onClick={() => setSubView('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              subView === 'cards'
                ? 'bg-white text-emerald-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-700" />
            Day Inspector
          </button>
        </div>
      </div>

      {/* 7-Day Horizontal Selector Carousel */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {schedule.map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          return (
            <button
              key={day.dateKey}
              id={`btn-day-tab-${idx}`}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-150 min-w-[85px] sm:min-w-[95px] text-center ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-700 shadow-md shadow-emerald-900/20 ring-2 ring-emerald-500/30'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
              }`}
            >
              <span className={`text-[11px] uppercase font-semibold ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                {day.isToday ? 'Today' : day.dayName}
              </span>
              <span className="text-lg font-bold font-mono my-0.5">
                {day.dayNumber} {day.monthName}
              </span>
              <span className={`text-[10px] truncate max-w-[80px] ${isSelected ? 'text-emerald-300' : 'text-emerald-700 font-medium'}`}>
                {day.hijriDate.day} {day.hijriDate.monthName.slice(0, 5)}
              </span>
            </button>
          );
        })}
      </div>

      {/* SUBVIEW 1: Complete 7-Day Timetable Grid */}
      {subView === 'table' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-xs tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-bold text-slate-900">Date &amp; Day</th>
                  <th className="py-3.5 px-3 text-center">Fajr</th>
                  <th className="py-3.5 px-3 text-center text-slate-400 font-normal">Sunrise</th>
                  <th className="py-3.5 px-3 text-center">Dhuhr</th>
                  <th className="py-3.5 px-3 text-center">Asr</th>
                  <th className="py-3.5 px-3 text-center font-bold text-emerald-800">Maghrib</th>
                  <th className="py-3.5 px-3 text-center">Isha</th>
                  <th className="py-3.5 px-4 text-right text-slate-500 hidden md:table-cell">Fasting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                          ? 'bg-emerald-50/70 font-semibold text-emerald-950'
                          : isSelected
                          ? 'bg-slate-50'
                          : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Date & Hijri column */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isToday && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title="Today" />
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span>{day.dayName}, {day.monthName} {day.dayNumber}</span>
                              {isToday && (
                                <span className="text-[10px] uppercase px-1.5 py-0.2 rounded-sm bg-emerald-200 text-emerald-800">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-emerald-700 font-serif">
                              {day.hijriDate.formatted}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Fajr */}
                      <td className="py-3 px-3 text-center font-mono text-slate-800">
                        {formatPrayerTime(day.prayers.fajr, timeFormat, timezone)}
                      </td>

                      {/* Sunrise */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400 text-xs">
                        {formatPrayerTime(day.prayers.sunrise, timeFormat, timezone)}
                      </td>

                      {/* Dhuhr */}
                      <td className="py-3 px-3 text-center font-mono text-slate-800">
                        {formatPrayerTime(day.prayers.dhuhr, timeFormat, timezone)}
                      </td>

                      {/* Asr */}
                      <td className="py-3 px-3 text-center font-mono text-slate-800">
                        {formatPrayerTime(day.prayers.asr, timeFormat, timezone)}
                      </td>

                      {/* Maghrib / Iftar */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-800 bg-emerald-100/30">
                        {formatPrayerTime(day.prayers.maghrib, timeFormat, timezone)}
                      </td>

                      {/* Isha */}
                      <td className="py-3 px-3 text-center font-mono text-slate-800">
                        {formatPrayerTime(day.prayers.isha, timeFormat, timezone)}
                      </td>

                      {/* Fasting Duration */}
                      <td className="py-3 px-4 text-right text-xs text-slate-500 font-mono hidden md:table-cell">
                        {fHours} hrs
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Click any day to highlight details</span>
            <span className="text-emerald-800 font-medium">Times calculated astronomical for {location.name}</span>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: Selected Day Detailed Cards Inspector */}
      {subView === 'cards' && (
        <div className="space-y-4">
          
          {/* Day Highlight Card */}
          <div className="p-4 rounded-2xl bg-emerald-900/10 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-800 text-white font-bold text-lg font-mono">
                {selectedDay.dayNumber}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {selectedDay.dayName}, {selectedDay.monthName} {selectedDay.dayNumber}, {selectedDay.date.getFullYear()}
                </h4>
                <p className="text-xs text-emerald-800 font-serif">
                  {selectedDay.hijriDate.formatted}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <Sunset className="w-4 h-4 text-emerald-600" />
                <span>Fasting window: <strong>{fastingHours} hours</strong></span>
              </div>
            </div>
          </div>

          {/* 5 Prayers Grid for Selected Day */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {prayerCols.map((col) => {
              const time = selectedDay.prayers[col.key];
              const isSunrise = col.key === 'sunrise';

              return (
                <div
                  key={col.key}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    isSunrise
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {col.label}
                    </span>
                    <span className="text-xs font-serif text-slate-400">
                      {col.ar}
                    </span>
                  </div>

                  <div className="my-2 font-mono text-xl font-bold">
                    {formatPrayerTime(time, timeFormat, timezone)}
                  </div>

                  <div className="text-[11px] text-slate-400">
                    {col.key === 'maghrib' ? 'Iftar / Sunset' : col.key === 'fajr' ? 'Suhoor ends' : isSunrise ? 'Shuruq' : 'Obligatory'}
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
