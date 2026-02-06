import { NextRequest, NextResponse } from "next/server";
import { nearbySearch, placeToVenueRow } from "@/lib/google-places";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/places/nearby?lat=20.21&lng=-87.46&keyword=restaurant
 * Proxies Google Places Nearby Search and optionally upserts to Supabase.
 * Never exposes the Google API key to the client.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") ?? "20.2114");
    const lng = parseFloat(searchParams.get("lng") ?? "-87.4654");
    const radius = parseInt(searchParams.get("radius") ?? "5000", 10);
    const keyword = searchParams.get("keyword") ?? undefined;
    const type = searchParams.get("type") ?? undefined;
    const sync = searchParams.get("sync") === "true";

    const { results, next_page_token } = await nearbySearch({
      lat,
      lng,
      radius,
      keyword,
      type,
    });

    const venues = results.map(placeToVenueRow);

    if (sync && venues.length > 0) {
      const supabase = createAdminClient();
      for (const v of venues) {
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
      }
    }

    return NextResponse.json({
      venues,
      next_page_token: next_page_token ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to fetch places";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
