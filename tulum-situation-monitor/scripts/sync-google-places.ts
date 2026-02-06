/**
 * Standalone sync: venues from Google Places → Supabase.
 * No dev server needed.
 *
 * Run: npm run sync:places  (from tulum-situation-monitor or tulum-web root)
 * Requires: .env.local with GOOGLE_MAPS_API_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL
 */
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local from tulum-situation-monitor (works from root or subdir)
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), "tulum-situation-monitor/.env.local") });

const TULUM_GRID = [
  { lat: 20.21, lng: -87.43, keyword: "beach club" },
  { lat: 20.18, lng: -87.46, keyword: "restaurant" },
  { lat: 20.15, lng: -87.46, keyword: "restaurant" },
  { lat: 20.21, lng: -87.5, keyword: "cenote" },
  { lat: 20.17, lng: -87.44, keyword: "bar" },
  { lat: 20.14, lng: -87.46, keyword: "hotel" },
];

async function nearbySearch(params: {
  lat: number;
  lng: number;
  radius: number;
  keyword?: string;
}) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY missing in .env.local");
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${params.lat},${params.lng}`);
  url.searchParams.set("radius", String(params.radius));
  url.searchParams.set("key", key);
  if (params.keyword) url.searchParams.set("keyword", params.keyword);
  const res = await fetch(url.toString());
  const data = (await res.json()) as { status: string; results?: unknown[]; error_message?: string };
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(data.error_message ?? data.status ?? "Google Places API error");
  }
  return { results: data.results ?? [] };
}

function inferCategory(types: string[] = []): "club" | "restaurant" | "cultural" {
  const t = types.map((s) => s.toLowerCase());
  if (t.some((x) => ["bar", "night_club", "casino"].includes(x))) return "club";
  if (t.some((x) => ["restaurant", "food", "meal_takeaway", "meal_delivery"].includes(x)))
    return "restaurant";
  if (
    t.some((x) =>
      ["museum", "art_gallery", "tourist_attraction", "aquarium", "zoo", "park", "place_of_worship"].includes(x)
    )
  )
    return "cultural";
  return "restaurant";
}

function placeToVenueRow(place: Record<string, unknown>) {
  const loc = (place.geometry as { location?: { lat: number; lng: number } })?.location ?? { lat: 0, lng: 0 };
  const types = (place.types as string[]) ?? [];
  const category = inferCategory(types);
  return {
    place_id: place.place_id as string,
    name: (place.name as string) ?? "Unknown",
    category,
    location: { lat: loc.lat, lng: loc.lng },
    rating: (place.rating as number) ?? null,
    price_level: place.price_level != null ? String(place.price_level) : null,
    formatted_address: (place.vicinity as string) ?? (place.formatted_address as string) ?? null,
    phone:
      (place.international_phone_number as string) ?? (place.formatted_phone_number as string) ?? null,
    website: (place.website as string) ?? null,
    description: (place.vicinity as string) ?? null,
    google_data: place,
  };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);
  const seen = new Set<string>();
  let total = 0;

  for (let i = 0; i < TULUM_GRID.length; i++) {
    const point = TULUM_GRID[i];
    console.log(`[${i + 1}/${TULUM_GRID.length}] Searching ${point.keyword} @ ${point.lat},${point.lng}...`);
    const { results } = await nearbySearch({ ...point, radius: 4000 });
    console.log(`  Found ${results.length} places`);

    for (const place of results as Record<string, unknown>[]) {
      if (seen.has(place.place_id as string)) continue;
      seen.add(place.place_id as string);
      const v = placeToVenueRow(place);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).rpc(
        "upsert_venue_from_google",
        {
          p_place_id: v.place_id,
          p_name: v.name,
          p_category: v.category,
          p_lat: v.location.lat,
          p_lng: v.location.lng,
          p_rating: v.rating,
          p_price_level: v.price_level,
          p_formatted_address: v.formatted_address,
          p_phone: v.phone,
          p_website: v.website,
          p_description: v.description,
          p_google_data: v.google_data,
        }
      );
      total++;
    }
    if (i < TULUM_GRID.length - 1) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  console.log("Sync ok. Total upserted:", total);
}

main().catch((e) => {
  console.error("Sync failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
