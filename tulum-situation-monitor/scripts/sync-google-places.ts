/**
 * CLI to sync venues from Google Places → Supabase.
 * Uses same logic as POST /api/places/sync (pagination, expanded searches).
 * Delete/truncate venues in Supabase manually if you want a fresh sync.
 *
 * Run: npm run sync:places
 *
 * Requires: .env.local with GOOGLE_MAPS_API_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), "tulum-situation-monitor/.env.local") });

import { nearbySearchAllPages, placeToVenueRow } from "../src/lib/google-places";
import { createAdminClient } from "../src/lib/supabase/admin";
import { TULUM_CENTER, TULUM_RADIUS, TULUM_SEARCHES } from "../src/lib/sync-places-config";
import { cacheVenuePhotoIfNeeded, ensureBucket } from "../src/lib/venue-photo-cache";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createAdminClient();
  await ensureBucket(supabase as Parameters<typeof ensureBucket>[0]);
  const seen = new Set<string>();
  let total = 0;

  for (let i = 0; i < TULUM_SEARCHES.length; i++) {
    const search = TULUM_SEARCHES[i];
    const label = search.keyword ?? search.type ?? "places";
    console.log(
      `[${i + 1}/${TULUM_SEARCHES.length}] Searching ${label} @ ${TULUM_CENTER.lat},${TULUM_CENTER.lng} (${TULUM_RADIUS}m)...`
    );
    const results = await nearbySearchAllPages({
      ...TULUM_CENTER,
      radius: TULUM_RADIUS,
      keyword: search.keyword,
      type: search.type,
    });
    console.log(`  Found ${results.length} places`);

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
      total++;
      const photoRef = place.photos?.[0]?.photo_reference;
      if (photoRef) {
        try {
          await cacheVenuePhotoIfNeeded(supabase as Parameters<typeof cacheVenuePhotoIfNeeded>[0], place.place_id, photoRef);
        } catch {
          // non-fatal
        }
        await new Promise((r) => setTimeout(r, 350));
      }
    }

    if (i < TULUM_SEARCHES.length - 1) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  console.log("Sync ok. Total upserted:", total);
}

main().catch((e) => {
  console.error("Sync failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
