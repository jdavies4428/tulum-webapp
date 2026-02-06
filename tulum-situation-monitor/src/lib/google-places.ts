/**
 * Google Places API (Legacy Nearby Search) wrapper.
 * Server-side only - never expose API key to client.
 */

const BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

export type VenueCategory = "club" | "restaurant" | "cultural" | "cafe";

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  vicinity?: string;
  rating?: number;
  price_level?: number;
  types?: string[];
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  photos?: { photo_reference: string; width: number; height: number }[];
  [key: string]: unknown;
}

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: number;
  keyword?: string;
  type?: string;
  /** For pagination: use token from previous response; only key + pagetoken are sent */
  pagetoken?: string;
}

export interface PlaceDetailsParams {
  place_id: string;
  fields?: string;
  /** Language code for localized name, reviews, opening_hours (e.g. en, es, fr). */
  language?: string;
}

/** Fields for rich Place Details (photos, reviews, opening_hours) */
export const PLACE_DETAILS_FIELDS =
  "name,formatted_address,geometry,photos,reviews,rating,user_ratings_total,opening_hours,website,formatted_phone_number,price_level,types";

export interface PlaceDetailsResult {
  name?: string;
  formatted_address?: string;
  geometry?: { location?: { lat: number; lng: number } };
  photos?: { photo_reference: string; width: number; height: number }[];
  reviews?: {
    author_name: string;
    profile_photo_url?: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time?: number;
  }[];
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { open_now?: boolean; weekday_text?: string[] };
  website?: string;
  formatted_phone_number?: string;
  price_level?: number;
  types?: string[];
  [key: string]: unknown;
}

function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_MAPS_API_KEY is not set");
  }
  return key;
}

export async function nearbySearch(
  params: NearbySearchParams
): Promise<{ results: GooglePlaceResult[]; next_page_token?: string }> {
  const key = getApiKey();
  const url = new URL(BASE_URL);
  url.searchParams.set("key", key);
  if (params.pagetoken) {
    url.searchParams.set("pagetoken", params.pagetoken);
  } else {
    url.searchParams.set("location", `${params.lat},${params.lng}`);
    url.searchParams.set("radius", String(params.radius ?? 5000));
    if (params.keyword) url.searchParams.set("keyword", params.keyword);
    if (params.type) url.searchParams.set("type", params.type);
  }

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(data.error_message ?? data.status ?? "Google Places API error");
  }

  return {
    results: data.results ?? [],
    next_page_token: data.next_page_token,
  };
}

/** Fetch all pages for a nearby search (Google returns max 20 per page). */
export async function nearbySearchAllPages(
  params: Omit<NearbySearchParams, "pagetoken">
): Promise<GooglePlaceResult[]> {
  const all: GooglePlaceResult[] = [];
  let token: string | undefined;
  do {
    const { results, next_page_token } = await nearbySearch(
      token ? { ...params, pagetoken: token } : params
    );
    all.push(...results);
    token = next_page_token;
    if (token) {
      await new Promise((r) => setTimeout(r, 2200));
    }
  } while (token);
  return all;
}

export async function getPlaceDetails(
  params: PlaceDetailsParams
): Promise<GooglePlaceResult | PlaceDetailsResult | null> {
  const key = getApiKey();
  const url = new URL(DETAILS_URL);
  url.searchParams.set("place_id", params.place_id);
  url.searchParams.set("key", key);
  url.searchParams.set("fields", params.fields ?? PLACE_DETAILS_FIELDS);
  if (params.language) {
    url.searchParams.set("language", params.language);
  }

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "OK") {
    return null;
  }

  return data.result ?? null;
}

/** Infer category from Google place types (maps to our 4: club | restaurant | cafe | cultural) */
export function inferCategory(types: string[] = []): VenueCategory {
  const t = types.map((s) => s.toLowerCase());
  // club: bars, nightlife
  if (t.some((x) => ["bar", "night_club", "casino"].includes(x))) return "club";
  // cafe: coffee, light bites
  if (t.some((x) => ["cafe", "coffee_shop", "bakery"].includes(x))) return "cafe";
  // restaurant: sit-down, food, meals
  if (
    t.some((x) =>
      [
        "restaurant",
        "food",
        "meal_takeaway",
        "meal_delivery",
        "meal_dine_in",
        "supermarket",
      ].includes(x)
    )
  )
    return "restaurant";
  // cultural: museums, galleries, attractions, nature, wellness
  if (
    t.some((x) =>
      [
        "museum",
        "art_gallery",
        "tourist_attraction",
        "aquarium",
        "zoo",
        "park",
        "place_of_worship",
        "natural_feature",
        "spa",
        "gym",
        "stadium",
        "library",
        "movie_theater",
      ].includes(x)
    )
  )
    return "cultural";
  return "restaurant"; // default
}

/** Map Google place to our venue schema for Supabase upsert */
export function placeToVenueRow(place: GooglePlaceResult): {
  place_id: string;
  name: string;
  category: VenueCategory;
  location: { lng: number; lat: number };
  rating: number | null;
  price_level: string | null;
  formatted_address: string | null;
  phone: string | null;
  website: string | null;
  description: string | null;
  google_data: unknown;
} {
  const loc = place.geometry?.location ?? { lat: 0, lng: 0 };
  const category = inferCategory(place.types);

  return {
    place_id: place.place_id,
    name: place.name ?? "Unknown",
    category,
    location: { lng: loc.lng, lat: loc.lat },
    rating: place.rating ?? null,
    price_level: place.price_level != null ? String(place.price_level) : null,
    formatted_address: place.vicinity ?? place.formatted_address ?? null,
    phone: place.international_phone_number ?? place.formatted_phone_number ?? null,
    website: place.website ?? null,
    description: place.vicinity ?? null,
    google_data: place,
  };
}
