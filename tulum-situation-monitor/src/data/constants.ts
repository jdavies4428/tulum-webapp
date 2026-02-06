export const TULUM_LAT = 20.2114;
export const TULUM_LNG = -87.4654;
export const DEFAULT_ZOOM = 13;

/** Coastal strip for "Beach Clubs" – excludes venues in town (Google has no beach_club type) */
export const BEACH_ZONE = {
  latMin: 20.1,
  latMax: 20.23,
  lngMin: -87.48, // east of this = coastal strip
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
