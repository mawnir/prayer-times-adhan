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
    <div className="modal-backdrop">
      <div className="modal-panel max-w-3xl" role="dialog" aria-modal="true" aria-labelledby="location-manager-title">
        <div className="modal-header">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.7rem_0.7rem_0.25rem_0.25rem] bg-primary text-white">
              <Globe className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="location-manager-title" className="text-lg font-semibold tracking-[-0.025em] text-foreground">
                Prayer locations
              </h2>
              <p className="mt-0.5 text-xs leading-5 text-foreground/50">
                Search, save, and compare cities around the world.
              </p>
            </div>
          </div>
          <button id="btn-close-location-modal" type="button" onClick={onClose} className="icon-button" aria-label="Close locations">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="scrollbar-none flex shrink-0 overflow-x-auto border-b border-muted-border bg-muted text-xs font-semibold">
          <button
            id="tab-btn-search-all-cities"
            onClick={() => setActiveTab('search')}
            className={`flex min-w-max flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-center transition-colors ${activeTab === 'search'
              ? 'border-primary bg-surface text-primary'
              : 'border-transparent text-foreground/48 hover:bg-surface/60 hover:text-foreground'
              }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search All Cities ({displayedCities.length})
          </button>

          <button
            id="tab-btn-manage-locations"
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${activeTab === 'saved'
              ? 'border-primary bg-surface text-primary'
              : 'border-transparent text-foreground/48 hover:bg-surface/60 hover:text-foreground'
              }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            My Saved Cities ({locations.length})
          </button>

          <button
            id="tab-btn-compare-locations"
            onClick={() => setActiveTab('compare')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${activeTab === 'compare'
              ? 'border-primary bg-surface text-primary'
              : 'border-transparent text-foreground/48 hover:bg-surface/60 hover:text-foreground'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Multi-City Timetable
          </button>

          <button
            id="tab-btn-custom-location"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 ${activeTab === 'custom'
              ? 'border-primary bg-surface text-primary'
              : 'border-transparent text-foreground/48 hover:bg-surface/60 hover:text-foreground'
              }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Custom Lat / Lng
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body space-y-5">

          {/* TAB 1: Search & Browse ALL Cities Worldwide */}
          {activeTab === 'search' && (
            <div className="space-y-4">

              {/* Main Search Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-foreground/38" aria-hidden="true" />
                  <input
                    id="input-global-city-search"
                    type="text"
                    autoFocus
                    placeholder="Search by city or country"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control py-3 pe-10 ps-11 text-sm font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3.5 text-foreground/35 hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-foreground/48">
                  <span className="flex items-center gap-1.5">
                    {isSearching ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" aria-hidden="true" />
                        Searching cities…
                      </>
                    ) : searchQuery ? (
                      <>Found {displayedCities.length} matching cities worldwide</>
                    ) : (
                      <>Popular cities are shown. Type any place to search worldwide.</>
                    )}
                  </span>

                  {/* GPS Shortcut */}
                  <button
                    onClick={handleUseGps}
                    disabled={isDetectingGps}
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <Navigation className="h-3 w-3 text-primary" aria-hidden="true" />
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
                  <h3 className="text-sm font-semibold text-foreground">Filter by region</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {WORLD_REGIONS.map((region) => (
                      <button
                        key={region}
                        onClick={() => setSelectedRegion(region)}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${selectedRegion === region
                          ? 'border-primary bg-primary text-white'
                          : 'border-muted-border bg-surface text-foreground/58 hover:bg-muted hover:text-foreground'
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
                  <div className="rounded-[0.75rem_0.75rem_0.25rem_0.25rem] border border-dashed border-muted-border bg-muted/55 p-6 text-center">
                    <Globe className="mx-auto mb-2 h-8 w-8 text-foreground/32" aria-hidden="true" />
                    <p className="text-sm font-semibold text-foreground">No cities found matching “{searchQuery}”</p>
                    <p className="mt-1 text-xs text-foreground/48">
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
                        className={`flex items-center justify-between gap-3 rounded-[0.65rem_0.65rem_0.2rem_0.2rem] border p-3 transition-colors ${isAlreadyActive
                          ? 'border-primary/55 bg-primary/[0.055]'
                          : 'border-muted-border bg-surface hover:bg-muted'
                          }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-[0.6rem_0.6rem_0.18rem_0.18rem] text-sm font-bold ${isAlreadyActive || isSaved
                              ? 'bg-primary text-white'
                              : 'bg-muted text-foreground/45'
                              }`}
                          >
                            <Building2 className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="truncate text-sm font-semibold text-foreground">
                                {city.name}
                              </span>
                              {city.admin1 && (
                                <span className="truncate text-xs text-foreground/45">
                                  {city.admin1}
                                </span>
                              )}
                              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground/55">
                                {city.country}
                              </span>
                              {isAlreadyActive && (
                                <span className="text-[0.66rem] font-semibold text-primary">Active</span>
                              )}
                            </div>

                            <p className="mt-0.5 flex items-center gap-2 text-[0.68rem] text-foreground/40">
                              <span>{city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°</span>
                              {city.timezone && <span>{city.timezone}</span>}
                            </p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                          {isAlreadyActive ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                              <Check className="h-3.5 w-3.5" aria-hidden="true" /> Selected
                            </span>
                          ) : (
                            <button
                              id={`btn-select-city-${city.id}`}
                              onClick={() => handleSelectOrAddCity(city)}
                              className="primary-button min-h-9 px-3 py-1.5"
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
                <h3 className="text-sm font-semibold text-foreground">Saved cities</h3>
                <button
                  onClick={() => setActiveTab('search')}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
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
                      className={`flex items-center justify-between rounded-[0.65rem_0.65rem_0.2rem_0.2rem] border p-3.5 transition-colors ${isActive
                        ? 'border-primary/55 bg-primary/[0.055]'
                        : 'border-muted-border bg-surface hover:bg-muted'
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className="flex min-w-0 flex-1 items-center space-x-3 text-start"
                      >
                        <div
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-[0.6rem_0.6rem_0.18rem_0.18rem] text-sm font-bold ${isActive
                            ? 'bg-primary text-white'
                            : 'bg-muted text-foreground/45'
                            }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-foreground">
                              {loc.name}
                            </h4>
                            {isActive && (
                              <span className="text-[0.66rem] font-semibold text-primary">Active</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-foreground/46">
                            {loc.country}{loc.admin1 ? `, ${loc.admin1}` : ''}, {loc.latitude}°, {loc.longitude}°
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center space-x-2">
                        {!isActive && (
                          <button
                            onClick={() => {
                              onSelectLocation(loc);
                              onClose();
                            }}
                            className="secondary-button min-h-9 px-3 py-1.5"
                          >
                            Set Active
                          </button>
                        )}
                        {locations.length > 1 && (
                          <button
                            onClick={() => onRemoveLocation(loc.id)}
                            className="icon-button hover:!border-danger/30 hover:!bg-danger/10 hover:!text-danger"
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
              <div className="text-sm text-foreground/50">
                Compare today's 5 prayer times across all your saved cities at a glance:
              </div>

              <div className="space-y-3">
                {locations.map((loc) => {
                  const todaySched = calculateDayPrayerSchedule(loc, new Date(), calculationSettings);
                  const isCurrent = loc.id === activeLocation.id;

                  return (
                    <div
                      key={loc.id}
                      className={`rounded-[0.75rem_0.75rem_0.25rem_0.25rem] border p-4 ${isCurrent
                        ? 'border-primary/55 bg-primary/[0.055]'
                        : 'border-muted-border bg-surface'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                          <h4 className="text-sm font-semibold text-foreground">
                            {loc.name}, {loc.country}
                          </h4>
                          {isCurrent && (
                            <span className="text-[0.65rem] font-semibold text-primary">Active</span>
                          )}
                        </div>
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              onSelectLocation(loc);
                              onClose();
                            }}
                            className="text-xs text-primary font-semibold hover:underline"
                          >
                            Switch to this city
                          </button>
                        )}
                      </div>

                      {/* 5 Prayers Grid */}
                      <div className="grid grid-cols-5 overflow-hidden rounded-[0.55rem_0.55rem_0.18rem_0.18rem] border border-muted-border text-center text-xs">
                        <div className="border-e border-muted-border bg-muted/55 p-2 last:border-e-0">
                          <div className="text-[0.62rem] font-semibold text-foreground/45">Fajr</div>
                          <div className="font-mono font-bold text-primary mt-0.5">
                            {formatPrayerTime(todaySched.prayers.fajr, calculationSettings.timeFormat, loc.timezone)}
                          </div>
                        </div>
                        <div className="border-e border-muted-border bg-muted/55 p-2 last:border-e-0">
                          <div className="text-[0.62rem] font-semibold text-foreground/45">Dhuhr</div>
                          <div className="font-mono font-bold text-primary mt-0.5">
                            {formatPrayerTime(todaySched.prayers.dhuhr, calculationSettings.timeFormat, loc.timezone)}
                          </div>
                        </div>
                        <div className="border-e border-muted-border bg-muted/55 p-2 last:border-e-0">
                          <div className="text-[0.62rem] font-semibold text-foreground/45">Asr</div>
                          <div className="font-mono font-bold text-primary mt-0.5">
                            {formatPrayerTime(todaySched.prayers.asr, calculationSettings.timeFormat, loc.timezone)}
                          </div>
                        </div>
                        <div className="border-e border-muted-border bg-primary/[0.07] p-2">
                          <div className="text-[0.62rem] font-semibold text-primary">Maghrib</div>
                          <div className="mt-0.5 font-mono font-semibold text-foreground">
                            {formatPrayerTime(todaySched.prayers.maghrib, calculationSettings.timeFormat, loc.timezone)}
                          </div>
                        </div>
                        <div className="border-e border-muted-border bg-muted/55 p-2 last:border-e-0">
                          <div className="text-[0.62rem] font-semibold text-foreground/45">Isha</div>
                          <div className="font-mono font-bold text-primary mt-0.5">
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
              <div className="flex flex-col justify-between gap-3 rounded-[0.75rem_0.75rem_0.25rem_0.25rem] border border-muted-border bg-muted/60 p-4 sm:flex-row sm:items-center">
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Navigation className="h-4 w-4 text-primary" aria-hidden="true" />
                    Detect via GPS
                  </h4>
                  <p className="mt-0.5 text-xs text-foreground/48">
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
                  className="primary-button shrink-0 disabled:opacity-50"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {isDetectingGps ? 'Locating...' : 'Auto Detect GPS'}
                </button>
              </div>

              <form onSubmit={handleAddCustom} className="space-y-4 rounded-[0.75rem_0.75rem_0.25rem_0.25rem] border border-muted-border bg-muted/55 p-5">
                <h3 className="text-sm font-semibold text-foreground">Add custom coordinates</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground/58">Location / City Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Oxford, Cambridge, My Town"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      required
                      className="form-control px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground/58">Country / Territory</label>
                    <input
                      type="text"
                      placeholder="e.g. United Kingdom"
                      value={customCountry}
                      onChange={(e) => setCustomCountry(e.target.value)}
                      className="form-control px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground/58">Latitude (-90 to +90)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 51.7520"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      required
                      className="form-control px-3.5 py-2.5 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground/58">Longitude (-180 to +180)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. -1.2577"
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      required
                      className="form-control px-3.5 py-2.5 font-mono text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="primary-button w-full"
                >
                  Save &amp; Set Active
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer justify-between">
          <span className="min-w-0 truncate text-xs text-foreground/48">
            Active: <strong className="font-semibold text-foreground/75">{activeLocation.name}, {activeLocation.country}</strong>
          </span>
          <button type="button" onClick={onClose} className="primary-button shrink-0">
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
