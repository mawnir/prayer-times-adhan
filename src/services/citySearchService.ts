import { LocationItem } from '../types';
import { POPULAR_CITIES } from '../data/defaultLocations';
import { CITY_AR, COUNTRY_AR } from '../data/arabicNames';

export interface SearchResultItem extends LocationItem {
  isGlobalResult?: boolean;
}

export type CitySearchLanguage = 'en' | 'ar';

interface GeocodingApiItem {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country_code?: string;
}

function toSearchResult(item: GeocodingApiItem, isGlobalResult: boolean): SearchResultItem {
  return {
    id: `global-${item.id}`,
    name: item.name,
    country: item.country || '',
    admin1: item.admin1 || '',
    latitude: Number(item.latitude.toFixed(4)),
    longitude: Number(item.longitude.toFixed(4)),
    timezone: item.timezone || undefined,
    countryCode: item.country_code || undefined,
    isGlobalResult,
  };
}

async function fetchGeocoding(
  query: string,
  language: 'en' | 'ar',
  timeoutMs: number
): Promise<GeocodingApiItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=15&language=${language}&format=json`;

    const response = await fetch(apiUrl, { signal: controller.signal });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data?.results) ? data.results as GeocodingApiItem[] : [];
  } catch (err) {
    console.warn(`Live global city search (${language}) failed or timed out:`, err);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchAllCities(
  query: string,
  lang: CitySearchLanguage = 'en'
): Promise<SearchResultItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return POPULAR_CITIES.map((c) => ({ ...c, isGlobalResult: false }));
  }

  // 1. Instant local search in offline catalog (matches English + Arabic names)
  const localMatches = POPULAR_CITIES.filter((city) => {
    const nameMatch = city.name.toLowerCase().includes(trimmed);
    const countryMatch = city.country.toLowerCase().includes(trimmed);
    const adminMatch = city.admin1 ? city.admin1.toLowerCase().includes(trimmed) : false;
    if (nameMatch || countryMatch || adminMatch) return true;
    if (lang === 'ar') {
      const arCity = (city.nameAr || CITY_AR[city.id] || '').toLowerCase();
      const arCountry = (city.countryAr || COUNTRY_AR[city.country] || '').toLowerCase();
      if (arCity && trimmed && arCity.includes(query.trim())) return true;
      if (arCountry && trimmed && arCountry.includes(query.trim())) return true;
    }
    return false;
  }).map((c) => ({ ...c, isGlobalResult: false }));

  // If query is very short, return local matches
  if (trimmed.length < 2) {
    return localMatches;
  }

  // 2. Query Worldwide Geocoding API (Open-Meteo: 1,000,000+ cities globally, no API key needed)
  // In Arabic mode fetch both languages so remote cities keep their canonical
  // English name while also carrying an Arabic display name.
  try {
    const enResults = await fetchGeocoding(trimmed, 'en', 4000);
    const byId = new Map<number, SearchResultItem>();
    for (const item of enResults) {
      byId.set(item.id, toSearchResult(item, true));
    }

    if (lang === 'ar') {
      const arResults = await fetchGeocoding(query.trim(), 'ar', 4000);
      for (const item of arResults) {
        const existing = byId.get(item.id);
        if (existing) {
          existing.nameAr = item.name;
          if (item.country) existing.countryAr = item.country;
          if (item.admin1) existing.admin1Ar = item.admin1;
        } else {
          const entry = toSearchResult(item, true);
          entry.nameAr = item.name;
          if (item.country) entry.countryAr = item.country;
          if (item.admin1) entry.admin1Ar = item.admin1;
          byId.set(item.id, entry);
        }
      }
    }

    const remoteResults = [...byId.values()];

    if (remoteResults.length > 0 || localMatches.length > 0) {
      // Merge and deduplicate by name + country
      const seen = new Set<string>();
      const combined: SearchResultItem[] = [];

      for (const item of [...localMatches, ...remoteResults]) {
        const key = `${item.name.toLowerCase()}-${item.country.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }

      return combined;
    }
  } catch (err) {
    console.warn('Live global city search failed or timed out, using local catalog:', err);
  }

  return localMatches;
}
