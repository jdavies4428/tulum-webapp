import { NextRequest, NextResponse } from "next/server";
import { nearbySearchAllPages, placeToVenueRow } from "@/lib/google-places";
import { createAdminClient } from "@/lib/supabase/admin";
import { TULUM_CENTER, TULUM_RADIUS, TULUM_SEARCHES } from "@/lib/sync-places-config";
import { cacheVenuePhotoIfNeeded, ensureBucket } from "@/lib/venue-photo-cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/places/sync
 * Fetches venues from Google Places for Tulum grid and upserts to Supabase.
 * Caches first photo to Storage (venue-photos bucket) and sets venue.photo_url to save API cost.
 * Requires GOOGLE_MAPS_API_KEY and SUPABASE_SERVICE_ROLE_KEY.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    await ensureBucket(supabase as unknown as Parameters<typeof ensureBucket>[0]);
    const seen = new Set<string>();
    let totalUpserted = 0;

    for (const search of TULUM_SEARCHES) {
      const results = await nearbySearchAllPages({
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

        const photoRef = place.photos?.[0]?.photo_reference;
        if (photoRef) {
          try {
            await cacheVenuePhotoIfNeeded(supabase as unknown as Parameters<typeof cacheVenuePhotoIfNeeded>[0], place.place_id, photoRef);
          } catch {
            // non-fatal: venue is saved, thumbnail may use proxy until next sync
          }
          await new Promise((r) => setTimeout(r, 350));
        }
      }

      await new Promise((r) => setTimeout(r, 1200));
    }

    return NextResponse.json({ ok: true, upserted: totalUpserted });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
