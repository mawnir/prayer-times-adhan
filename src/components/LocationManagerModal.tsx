import React, { useState, useEffect, useTransition } from 'react';
import { 
  X, 
  MapPin, 
  Plus, 
  Trash2, 
  Check, 
  Navigation, 
  Search, 
  Globe, 
  Loader2, 
  Building2, 
  Compass, 
  Layers, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { CalculationSettings, LocationItem } from '../types';
import { POPULAR_CITIES, WORLD_REGIONS } from '../data/defaultLocations';
import { searchAllCities, SearchResultItem } from '../services/citySearchService';
import { calculateDayPrayerSchedule, formatPrayerTime } from '../services/prayerService';

interface LocationManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationItem[];
  activeLocation: LocationItem;
  onSelectLocation: (loc: LocationItem) => void;
  onAddLocation: (loc: LocationItem) => void;
  onRemoveLocation: (id: string) => void;
  calculationSettings: CalculationSettings;
}

export const LocationManagerModal: React.FC<LocationManagerModalProps> = ({
  isOpen,
  onClose,
  locations,
  activeLocation,
  onSelectLocation,
  onAddLocation,
  onRemoveLocation,
  calculationSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'compare' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>(() =>
    POPULAR_CITIES.map((c) => ({ ...c, isGlobalResult: false }))
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // GPS State
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Custom location form fields
  const [customName, setCustomName] = useState('');
  const [customCountry, setCustomCountry] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');

  // Live debounced search effect for all cities worldwide
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      // If empty query, show by region
      if (selectedRegion === 'All') {
        setSearchResults(POPULAR_CITIES.map((c) => ({ ...c, isGlobalResult: false })));
      } else {
        // filter popular cities roughly or return all
        setSearchResults(POPULAR_CITIES.map((c) => ({ ...c, isGlobalResult: false })));
      }
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(() => {
      searchAllCities(trimmed)
        .then((results) => {
          startTransition(() => {
            setSearchResults(results);
            setIsSearching(false);
          });
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 280);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedRegion, isOpen]);

  if (!isOpen) return null;

  // Filter by region if no text search
  const displayedCities = searchQuery.trim()
    ? searchResults
    : selectedRegion === 'All'
    ? searchResults
    : searchResults.filter((c) => {
        // Quick regional heuristic based on country
        if (selectedRegion === 'Middle East & Gulf') {
          return ['Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Syria', 'Iraq', 'Iran', 'Yemen', 'Palestine'].includes(c.country);
        }
        if (selectedRegion === 'North America') {
          return ['United States', 'Canada', 'Mexico'].includes(c.country);
        }
        if (selectedRegion === 'Europe') {
          return ['United Kingdom', 'France', 'Germany', 'Turkey', 'Netherlands', 'Belgium', 'Austria', 'Switzerland', 'Spain', 'Italy', 'Sweden', 'Norway', 'Denmark', 'Bosnia and Herzegovina', 'Kosovo', 'Albania', 'Russia'].includes(c.country);
        }
        if (selectedRegion === 'South Asia') {
          return ['Pakistan', 'Bangladesh', 'India', 'Sri Lanka', 'Afghanistan', 'Maldives'].includes(c.country);
        }
        if (selectedRegion === 'Southeast Asia') {
          return ['Indonesia', 'Malaysia', 'Singapore', 'Brunei', 'Thailand', 'Philippines'].includes(c.country);
        }
        if (selectedRegion === 'North & East Africa') {
          return ['Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan', 'Somalia', 'Ethiopia', 'Kenya', 'Tanzania'].includes(c.country);
        }
        if (selectedRegion === 'West & South Africa') {
          return ['Nigeria', 'Senegal', 'Ghana', 'Ivory Coast', 'Mali', 'Niger', 'Chad', 'South Africa'].includes(c.country);
        }
        if (selectedRegion === 'Central & East Asia') {
          return ['Uzbekistan', 'Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Azerbaijan', 'Japan', 'South Korea', 'China', 'Hong Kong'].includes(c.country);
        }
        if (selectedRegion === 'Oceania & Pacific') {
          return ['Australia', 'New Zealand', 'Fiji'].includes(c.country);
        }
        return true;
      });

  const handleSelectOrAddCity = (city: LocationItem) => {
    onAddLocation(city);
    onSelectLocation(city);
    onClose();
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingGps(false);
        const lat = Number(position.coords.latitude.toFixed(4));
        const lng = Number(position.coords.longitude.toFixed(4));

        const newLoc: LocationItem = {
          id: `gps-${Date.now()}`,
          name: 'My GPS Location',
          country: 'Local',
          latitude: lat,
          longitude: lng,
        };

        onAddLocation(newLoc);
        onSelectLocation(newLoc);
        onClose();
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError(err.message || 'Unable to retrieve your location. Check browser permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);

    if (!customName.trim() || isNaN(lat) || isNaN(lng)) return;

    const newLoc: LocationItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      country: customCountry.trim() || 'Custom',
      latitude: lat,
      longitude: lng,
    };

    onAddLocation(newLoc);
    onSelectLocation(newLoc);
    setCustomName('');
    setCustomCountry('');
    setCustomLat('');
    setCustomLng('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-800 text-emerald-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-serif flex items-center gap-2">
                All Cities Worldwide
                <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                  Global Database
                </span>
              </h3>
              <p className="text-xs text-emerald-300/80">
                Search and select any city in the world for accurate prayer times
              </p>
            </div>
          </div>
          <button
            id="btn-close-location-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold shrink-0 overflow-x-auto">
          <button
            id="tab-btn-search-all-cities"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'search'
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search All Cities ({displayedCities.length})
          </button>

          <button
            id="tab-btn-manage-locations"
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'saved'
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            My Saved Cities ({locations.length})
          </button>

          <button
            id="tab-btn-compare-locations"
            onClick={() => setActiveTab('compare')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'compare'
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Multi-City Timetable
          </button>

          <button
            id="tab-btn-custom-location"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Custom Lat / Lng
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Search & Browse ALL Cities Worldwide */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              
              {/* Main Search Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="input-global-city-search"
                    type="text"
                    autoFocus
                    placeholder="Search any city or country worldwide (e.g. Cairo, Toronto, Dearborn, Kozhikode, Sydney)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 rounded-2xl border-2 border-emerald-700/30 text-sm focus:outline-hidden focus:border-emerald-700 bg-white shadow-xs font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="flex items-center gap-1.5">
                    {isSearching ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                        Searching 1M+ cities worldwide...
                      </>
                    ) : searchQuery ? (
                      <>Found {displayedCities.length} matching cities worldwide</>
                    ) : (
                      <>Showing popular global cities &bull; Type any name above to find ANY city</>
                    )}
                  </span>

                  {/* GPS Shortcut */}
                  <button
                    onClick={handleUseGps}
                    disabled={isDetectingGps}
                    className="text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3 text-emerald-700" />
                    {isDetectingGps ? 'Locating...' : 'Use Current GPS'}
                  </button>
                </div>
                {gpsError && (
                  <p className="text-xs text-red-600 font-medium px-1">{gpsError}</p>
                )}
              </div>

              {/* World Region Selector (visible when no search query) */}
              {!searchQuery && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Filter by Region
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {WORLD_REGIONS.map((region) => (
                      <button
                        key={region}
                        onClick={() => setSelectedRegion(region)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          selectedRegion === region
                            ? 'bg-emerald-800 text-white font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cities List Cards */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {displayedCities.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                    <Globe className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No cities found matching "{searchQuery}"</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try checking spelling or add custom coordinates in the "Custom Lat/Lng" tab.
                    </p>
                  </div>
                ) : (
                  displayedCities.map((city) => {
                    const isAlreadyActive = city.name.toLowerCase() === activeLocation.name.toLowerCase() && 
                                           city.country.toLowerCase() === activeLocation.country.toLowerCase();
                    const isSaved = locations.some(
                      (l) => l.name.toLowerCase() === city.name.toLowerCase() && l.country.toLowerCase() === city.country.toLowerCase()
                    );

                    return (
                      <div
                        key={`${city.id}-${city.name}-${city.country}`}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isAlreadyActive
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                            : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
                              isAlreadyActive
                                ? 'bg-emerald-700 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Building2 className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-slate-900 truncate">
                                {city.name}
                              </span>
                              {city.admin1 && (
                                <span className="text-xs text-slate-500 truncate">
                                  {city.admin1}
                                </span>
                              )}
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {city.country}
                              </span>
                              {isAlreadyActive && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                                  Active
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>Lat: {city.latitude.toFixed(2)}°, Lng: {city.longitude.toFixed(2)}°</span>
                              {city.timezone && <span>&bull; {city.timezone}</span>}
                            </p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                          {isAlreadyActive ? (
                            <span className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Selected
                            </span>
                          ) : (
                            <button
                              id={`btn-select-city-${city.id}`}
                              onClick={() => handleSelectOrAddCity(city)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Select City
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 2: Manage Saved Cities */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  Your Active &amp; Saved Cities
                </span>
                <button
                  onClick={() => setActiveTab('search')}
                  className="text-xs text-emerald-800 font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Search &amp; Add More Cities
                </button>
              </div>

              <div className="space-y-2">
                {locations.map((loc) => {
                  const isActive = loc.id === activeLocation.id;
                  return (
                    <div
                      key={loc.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className="flex-1 cursor-pointer flex items-center space-x-3"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isActive
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {loc.name}
                            </h4>
                            {isActive && (
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                                Active Now
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {loc.country} {loc.admin1 && `(${loc.admin1})`} &bull; Lat: {loc.latitude}°, Lng: {loc.longitude}°
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!isActive && (
                          <button
                            onClick={() => {
                              onSelectLocation(loc);
                              onClose();
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 transition-colors"
                          >
                            Set Active
                          </button>
                        )}
                        {locations.length > 1 && (
                          <button
                            onClick={() => onRemoveLocation(loc.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Multi-City Timetable Comparison */}
          {activeTab === 'compare' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Compare today's 5 prayer times across all your saved cities at a glance:
              </div>

              <div className="space-y-3">
                {locations.map((loc) => {
                  const todaySched = calculateDayPrayerSchedule(loc, new Date(), calculationSettings);
                  const isCurrent = loc.id === activeLocation.id;

                  return (
                    <div
                      key={loc.id}
                      className={`p-4 rounded-2xl border ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/40'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-700" />
                          <h4 className="font-bold text-sm text-slate-900">
                            {loc.name}, {loc.country}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                              Active
                            </span>
                          )}
                        </div>
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              onSelectLocation(loc);
                              onClose();
                            }}
                            className="text-xs text-emerald-800 font-semibold hover:underline"
                          >
                            Switch to this city
                          </button>
                        )}
                      </div>

                      {/* 5 Prayers Grid */}
                      <div className="grid grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-semibold">FAJR</div>
                          <div className="font-mono font-bold text-slate-800 mt-0.5">
                            {formatPrayerTime(todaySched.prayers.fajr, calculationSettings.timeFormat, loc.timezone)}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-semibold">DHUHR</div>
                          <div className="font-mono font-bold text-slate-800 mt-0.5">
                            {formatPrayerTime(todaySched.prayers.dhuhr, calculationSettings.timeFormat, loc.timezone)}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-semibold">ASR</div>
                          <div className="font-mono font-bold text-slate-800 mt-0.5">
                            {formatPrayerTime(todaySched.prayers.asr, calculationSettings.timeFormat, loc.timezone)}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-100/50 border border-emerald-200/50">
                          <div className="text-[10px] text-emerald-700 font-bold">MAGHRIB</div>
                          <div className="font-mono font-bold text-emerald-900 mt-0.5">
                            {formatPrayerTime(todaySched.prayers.maghrib, calculationSettings.timeFormat, loc.timezone)}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-semibold">ISHA</div>
                          <div className="font-mono font-bold text-slate-800 mt-0.5">
                            {formatPrayerTime(todaySched.prayers.isha, calculationSettings.timeFormat, loc.timezone)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Custom Coordinates Form */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-900/5 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-emerald-700" />
                    Detect via GPS
                  </h4>
                  <p className="text-xs text-slate-500">
                    Fetch your exact device coordinates automatically
                  </p>
                  {gpsError && (
                    <p className="text-xs text-red-600 mt-1 font-medium">{gpsError}</p>
                  )}
                </div>
                <button
                  id="btn-detect-gps"
                  onClick={handleUseGps}
                  disabled={isDetectingGps}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {isDetectingGps ? 'Locating...' : 'Auto Detect GPS'}
                </button>
              </div>

              <form onSubmit={handleAddCustom} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <span className="text-xs font-semibold uppercase text-slate-600 tracking-wider block">
                  Add Custom Coordinates
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Location / City Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Oxford, Cambridge, My Town"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Country / Territory</label>
                    <input
                      type="text"
                      placeholder="e.g. United Kingdom"
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Latitude (-90 to +90)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 51.7520"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Longitude (-180 to +180)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. -1.2577"
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Save &amp; Set Active
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Active Location: <strong className="text-slate-800">{activeLocation.name}, {activeLocation.country}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
