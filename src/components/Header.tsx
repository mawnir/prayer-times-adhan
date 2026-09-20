import React from 'react';
import { 
  MapPin, 
  Bell, 
  Settings, 
  Compass, 
  Calendar, 
  Clock, 
  Volume2, 
  VolumeX,
  Plus,
  Globe
} from 'lucide-react';
import { LocationItem, NotificationSettings } from '../types';

interface HeaderProps {
  locations: LocationItem[];
  activeLocation: LocationItem;
  onSelectLocation: (loc: LocationItem) => void;
  onOpenLocationModal: () => void;
  onOpenNotificationModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenQiblaModal: () => void;
  notificationSettings: NotificationSettings;
  onToggleMute: () => void;
  viewMode: 'today' | 'week';
  onChangeViewMode: (mode: 'today' | 'week') => void;
}

export const Header: React.FC<HeaderProps> = ({
  locations,
  activeLocation,
  onSelectLocation,
  onOpenLocationModal,
  onOpenNotificationModal,
  onOpenSettingsModal,
  onOpenQiblaModal,
  notificationSettings,
  onToggleMute,
  viewMode,
  onChangeViewMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-emerald-950 border-b border-emerald-800/40 text-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center shadow-md shadow-emerald-950/50 border border-emerald-500/30">
                <span className="text-xl">🕌</span>
              </div>
              <div>
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Prayer Times
                  <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-800/60 text-emerald-200 border border-emerald-700/50">
                    مواقيت الصلاة
                  </span>
                </h1>
                <p className="text-xs text-emerald-300/80">
                  Multiple Locations &bull; 7-Day Schedule &bull; Adhan Alerts
                </p>
              </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex sm:hidden items-center bg-emerald-900/60 rounded-lg p-0.5 border border-emerald-700/40">
              <button
                id="btn-mobile-view-today"
                onClick={() => onChangeViewMode('today')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'today'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                id="btn-mobile-view-week"
                onClick={() => onChangeViewMode('week')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                7 Days
              </button>
            </div>
          </div>

          {/* Controls & Location Bar */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            
            {/* Quick Location Pills / Selector */}
            <div className="flex items-center bg-emerald-900/50 border border-emerald-700/50 rounded-lg p-1 max-w-full overflow-x-auto scrollbar-none">
              <MapPin className="w-4 h-4 text-emerald-400 ml-1.5 mr-1 shrink-0" />
              <div className="flex items-center space-x-1">
                {locations.slice(0, 3).map((loc) => {
                  const isActive = loc.id === activeLocation.id;
                  return (
                    <button
                      key={loc.id}
                      id={`location-pill-${loc.id}`}
                      onClick={() => onSelectLocation(loc)}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                          : 'text-emerald-300 hover:text-white hover:bg-emerald-800/50'
                      }`}
                      title={`${loc.name}, ${loc.country}`}
                    >
                      {loc.name}
                    </button>
                  );
                })}
              </div>

              <button
                id="btn-open-location-manager"
                onClick={onOpenLocationModal}
                className="ml-1 p-1 text-xs text-emerald-200 hover:text-white bg-emerald-800/50 hover:bg-emerald-700/60 rounded-md transition-all flex items-center gap-1.5 px-2 font-medium"
                title="Search and select any city worldwide"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-[11px]">All Cities</span>
              </button>
            </div>

            {/* Desktop View Switcher */}
            <div className="hidden sm:flex items-center bg-emerald-900/60 rounded-lg p-0.5 border border-emerald-700/40">
              <button
                id="btn-view-today"
                onClick={() => onChangeViewMode('today')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'today'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Today
              </button>
              <button
                id="btn-view-week"
                onClick={() => onChangeViewMode('week')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Next 7 Days
              </button>
            </div>

            {/* Action Icon Buttons */}
            <div className="flex items-center space-x-1 text-emerald-200">
              {/* Audio Mute Quick Toggle */}
              <button
                id="btn-quick-mute"
                onClick={onToggleMute}
                className={`p-2 rounded-lg transition-colors border ${
                  notificationSettings.volume === 0 || !notificationSettings.masterEnabled
                    ? 'bg-red-950/40 border-red-800/50 text-red-300 hover:bg-red-900/50'
                    : 'bg-emerald-900/40 border-emerald-800/50 text-emerald-200 hover:bg-emerald-800/50'
                }`}
                title={notificationSettings.volume === 0 ? 'Unmute Adhan Audio' : 'Mute Adhan Audio'}
              >
                {notificationSettings.volume === 0 || !notificationSettings.masterEnabled ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              {/* Notification Settings */}
              <button
                id="btn-notification-settings"
                onClick={onOpenNotificationModal}
                className={`p-2 rounded-lg transition-colors border relative ${
                  notificationSettings.masterEnabled
                    ? 'bg-emerald-900/40 border-emerald-800/50 text-emerald-200 hover:bg-emerald-800/50'
                    : 'bg-slate-900/40 border-slate-800/50 text-slate-400 hover:bg-slate-800/50'
                }`}
                title="Adhan Notification Settings"
              >
                <Bell className="w-4 h-4" />
                {notificationSettings.masterEnabled && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>

              {/* Qibla Direction */}
              <button
                id="btn-qibla-compass"
                onClick={onOpenQiblaModal}
                className="p-2 rounded-lg bg-emerald-900/40 border border-emerald-800/50 text-emerald-200 hover:bg-emerald-800/50 transition-colors"
                title="Qibla Compass Direction"
              >
                <Compass className="w-4 h-4" />
              </button>

              {/* Calculation Settings */}
              <button
                id="btn-calc-settings"
                onClick={onOpenSettingsModal}
                className="p-2 rounded-lg bg-emerald-900/40 border border-emerald-800/50 text-emerald-200 hover:bg-emerald-800/50 transition-colors"
                title="Calculation Methods & Adjustments"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
