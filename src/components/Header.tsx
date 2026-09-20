import React from 'react';
import { 
  MapPin, 
  Bell, 
  Settings, 
  Compass, 
  Volume2, 
  VolumeX,
  Globe,
  SunMoon
} from 'lucide-react';
import { LocationItem, NotificationSettings } from '../types';

interface HeaderProps {
  activeLocation: LocationItem;
  onOpenLocationModal: () => void;
  onOpenNotificationModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenQiblaModal: () => void;
  notificationSettings: NotificationSettings;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeLocation,
  onOpenLocationModal,
  onOpenNotificationModal,
  onOpenSettingsModal,
  onOpenQiblaModal,
  notificationSettings,
  onToggleMute,
}) => {
  const isMuted = notificationSettings.volume === 0 || !notificationSettings.masterEnabled;

  const activeLocationPill = (
    <button
      id={`location-pill-${activeLocation.id}`}
      className="px-2.5 py-1 text-xs rounded-md font-semibold text-white bg-black shadow-xs whitespace-nowrap"
      title={`${activeLocation.name}, ${activeLocation.country}`}
    >
      {activeLocation.name}
    </button>
  );

  const allCitiesButton = (
    <button
      id="btn-open-location-manager"
      onClick={onOpenLocationModal}
      className="ml-1 px-2 py-1 text-xs text-neutral-600 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md transition-all flex items-center gap-1.5 font-medium"
      title="Search and select any city worldwide"
    >
      <Globe className="w-3.5 h-3.5 text-neutral-500" />
      <span className="text-[11px]">All Cities</span>
    </button>
  );

  const actionToolbar = (
    <div className="flex items-center rounded-lg border border-neutral-200 bg-white divide-x divide-neutral-200 shrink-0">
      {/* Audio Mute Quick Toggle */}
      <button
        id="btn-quick-mute"
        onClick={onToggleMute}
        className={`p-2 rounded-l-lg transition-colors ${
          isMuted
            ? 'bg-red-50 text-red-600'
            : 'text-neutral-700 hover:bg-neutral-100'
        }`}
        title={isMuted ? 'Unmute Adhan Audio' : 'Mute Adhan Audio'}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      {/* Notification Settings */}
      <button
        id="btn-notification-settings"
        onClick={onOpenNotificationModal}
        className={`relative p-2 transition-colors ${
          notificationSettings.masterEnabled
            ? 'text-neutral-700 hover:bg-neutral-100'
            : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'
        }`}
        title="Adhan Notification Settings"
      >
        <Bell className="w-4 h-4" />
        {notificationSettings.masterEnabled && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
        )}
      </button>

      {/* Qibla Direction */}
      <button
        id="btn-qibla-compass"
        onClick={onOpenQiblaModal}
        className="p-2 text-neutral-700 hover:bg-neutral-100 transition-colors"
        title="Qibla Compass Direction"
      >
        <Compass className="w-4 h-4" />
      </button>

      {/* Calculation Settings */}
      <button
        id="btn-calc-settings"
        onClick={onOpenSettingsModal}
        className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-r-lg transition-colors"
        title="Calculation Methods & Adjustments"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 text-neutral-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 py-2.5">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-black flex items-center justify-center shadow-xs border border-black">
<SunMoon className="text-gray-100"/>
            </div>
            <div className="min-w-0">
<h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-black flex items-center gap-2">
                  Prayer Times
                </h1>
              <p className="text-[11px] text-neutral-500 truncate hidden sm:block">
                Multiple Locations &bull; 7-Day Schedule &bull; Adhan Alerts
              </p>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center justify-end gap-2">
            {/* Quick Location Selector */}
            <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 max-w-80 overflow-x-auto scrollbar-none">
              <MapPin className="w-4 h-4 text-neutral-500 ml-1.5 mr-1 shrink-0" />
              {activeLocationPill}
              {allCitiesButton}
            </div>
          </div>

          {/* Action Icon Toolbar */}
          {actionToolbar}

        </div>

        {/* Mobile Location Row */}
        <div className="md:hidden flex items-center gap-2 pb-2.5 pt-1">
          <div className="flex items-center flex-1 min-w-0 bg-neutral-100 border border-neutral-200 rounded-lg p-1 overflow-x-auto scrollbar-none">
            <MapPin className="w-4 h-4 text-neutral-500 ml-1.5 mr-1 shrink-0" />
            {activeLocationPill}
            {allCitiesButton}
          </div>
        </div>
      </div>
    </header>
  );
};