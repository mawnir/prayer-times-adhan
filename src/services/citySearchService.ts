import { LocationItem } from '../types';
import { POPULAR_CITIES } from '../data/defaultLocations';

export interface SearchResultItem extends LocationItem {
  isGlobalResult?: boolean;
}

export async function searchAllCities(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return POPULAR_CITIES.map((c) => ({ ...c, isGlobalResult: false }));
  }

  // 1. Instant local search in offline catalog
  const localMatches = POPULAR_CITIES.filter((city) => {
    const nameMatch = city.name.toLowerCase().includes(trimmed);
    const countryMatch = city.country.toLowerCase().includes(trimmed);
    const adminMatch = city.admin1 ? city.admin1.toLowerCase().includes(trimmed) : false;
    return nameMatch || countryMatch || adminMatch;
  }).map((c) => ({ ...c, isGlobalResult: false }));

  // If query is very short, return local matches
  if (trimmed.length < 2) {
    return localMatches;
  }

  // 2. Query Worldwide Geocoding API (Open-Meteo: 1,000,000+ cities globally, no API key needed)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=15&language=en&format=json`;

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.results)) {
        const remoteResults: SearchResultItem[] = data.results.map((item: {
          id: number;
          name: string;
          country: string;
          admin1?: string;
          latitude: number;
          longitude: number;
          timezone?: string;
          country_code?: string;
        }) => ({
          id: `global-${item.id}`,
          name: item.name,
          country: item.country || '',
          admin1: item.admin1 || '',
          latitude: Number(item.latitude.toFixed(4)),
          longitude: Number(item.longitude.toFixed(4)),
          timezone: item.timezone || undefined,
          countryCode: item.country_code || undefined,
          isGlobalResult: true,
        }));

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
    }
  } catch (err) {
    console.warn('Live global city search failed or timed out, using local catalog:', err);
  }

  return localMatches;
}
