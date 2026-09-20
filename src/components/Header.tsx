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
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 text-neutral-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-sm border border-black">
                <span className="text-xl">🕌</span>
              </div>
              <div>
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-black flex items-center gap-2">
                  Prayer Times
                  <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                    مواقيت الصلاة
                  </span>
                </h1>
                <p className="text-xs text-neutral-500">
                  Multiple Locations &bull; 7-Day Schedule &bull; Adhan Alerts
                </p>
              </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex sm:hidden items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200">
              <button
                id="btn-mobile-view-today"
                onClick={() => onChangeViewMode('today')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'today'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                Today
              </button>
              <button
                id="btn-mobile-view-week"
                onClick={() => onChangeViewMode('week')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                7 Days
              </button>
            </div>
          </div>

          {/* Controls & Location Bar */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            
            {/* Quick Location Pills / Selector */}
            <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 max-w-full overflow-x-auto scrollbar-none">
              <MapPin className="w-4 h-4 text-neutral-500 ml-1.5 mr-1 shrink-0" />
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
                          ? 'bg-black text-white shadow-xs font-semibold'
                          : 'text-neutral-600 hover:text-black hover:bg-white'
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
                className="ml-1 p-1 text-xs text-neutral-600 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md transition-all flex items-center gap-1.5 px-2 font-medium"
                title="Search and select any city worldwide"
              >
                <Globe className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[11px]">All Cities</span>
              </button>
            </div>

            {/* Desktop View Switcher */}
            <div className="hidden sm:flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200">
              <button
                id="btn-view-today"
                onClick={() => onChangeViewMode('today')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                  viewMode === 'today'
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black'
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
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Next 7 Days
              </button>
            </div>

            {/* Action Icon Buttons */}
            <div className="flex items-center space-x-1 text-neutral-600">
              {/* Audio Mute Quick Toggle */}
              <button
                id="btn-quick-mute"
                onClick={onToggleMute}
                className={`p-2 rounded-lg transition-colors border ${
                  notificationSettings.volume === 0 || !notificationSettings.masterEnabled
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                    : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200'
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
                    ? 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-400 hover:bg-neutral-100'
                }`}
                title="Adhan Notification Settings"
              >
                <Bell className="w-4 h-4" />
                {notificationSettings.masterEnabled && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-black animate-pulse"></span>
                )}
              </button>

              {/* Qibla Direction */}
              <button
                id="btn-qibla-compass"
                onClick={onOpenQiblaModal}
                className="p-2 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200 transition-colors"
                title="Qibla Compass Direction"
              >
                <Compass className="w-4 h-4" />
              </button>

              {/* Calculation Settings */}
              <button
                id="btn-calc-settings"
                onClick={onOpenSettingsModal}
                className="p-2 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-700 hover:bg-neutral-200 transition-colors"
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
