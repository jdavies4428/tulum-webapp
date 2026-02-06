import { NextRequest, NextResponse } from "next/server";
import { nearbySearch, placeToVenueRow } from "@/lib/google-places";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** From google-places-api-integration.md: single center + 10km radius. */
const TULUM_CENTER = { lat: 20.2114, lng: -87.4654 };
const TULUM_RADIUS = 10000; // 10km
const TULUM_SEARCHES: { keyword?: string; type?: string }[] = [
  { keyword: "beach club" },
  { type: "restaurant" },
  { type: "cafe" },
  { keyword: "cenote" },
  { type: "tourist_attraction" },
  { type: "lodging" },
];

/**
 * POST /api/places/sync
 * Fetches venues from Google Places for Tulum grid and upserts to Supabase.
 * Requires GOOGLE_MAPS_API_KEY and SUPABASE_SERVICE_ROLE_KEY.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const seen = new Set<string>();
    let totalUpserted = 0;

    for (const search of TULUM_SEARCHES) {
      const { results } = await nearbySearch({
        ...TULUM_CENTER,
        radius: TULUM_RADIUS,
        keyword: search.keyword,
        type: search.type,
      });

      for (const place of results) {
        if (seen.has(place.place_id)) continue;
        seen.add(place.place_id);

        const v = placeToVenueRow(place);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).rpc("upsert_venue_from_google", {
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
        });
        totalUpserted++;
      }

      // Rate limit: ~1 req/sec for Google Places
      await new Promise((r) => setTimeout(r, 1200));
    }

    return NextResponse.json({ ok: true, upserted: totalUpserted });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
