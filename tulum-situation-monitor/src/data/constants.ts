export const TULUM_LAT = 20.2114;
export const TULUM_LNG = -87.4654;
export const DEFAULT_ZOOM = 13;

/**
 * Coastal strip for "Beach Clubs" – only venues on the beach, not in town.
 * Data comes from Google Places (cached in DB); Google has no beach_club type so we
 * sync by keyword "beach club" / type night_club and filter by this zone.
 * Town is ~ -87.465; coast is east (less negative). lngMin -87.45 excludes downtown.
 */
export const BEACH_ZONE = {
  latMin: 20.1,
  latMax: 20.23,
  lngMin: -87.45, // west edge of beach strip (excludes town at ~-87.465)
  lngMax: -87.42,
};

export function isInBeachZone(lat: number, lng: number): boolean {
  return (
    lat >= BEACH_ZONE.latMin &&
    lat <= BEACH_ZONE.latMax &&
    lng >= BEACH_ZONE.lngMin &&
    lng <= BEACH_ZONE.lngMax
  );
}

export const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
export const OPEN_METEO_MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";
