# Google Places API Integration – Implementation Plan

Based on `google-places-api-integration.md` and the current **tulum-situation-monitor** codebase.

---

## Current State

| Component | What exists |
|-----------|-------------|
| **`src/lib/google-places.ts`** | `nearbySearch()`, `getPlaceDetails()` (minimal fields), `placeToVenueRow()`, `inferCategory()`. Uses `GOOGLE_MAPS_API_KEY`. |
| **`/api/places/nearby`** | GET: lat, lng, radius, keyword, type, optional `sync` to Supabase. Returns Google results as venues. |
| **`/api/places/sync`** | Syncs Google places into Supabase via `upsert_venue_from_google`. |
| **`useVenues`** | Loads venues from **Supabase** via `get_venues` RPC. Map markers come from DB, not live Google. |
| **`PlacePopup`** | Simple popup: name, description, Website/Call/Chat/Directions. Uses local place type (no `place_id`). |
| **PlacesModal** | List/grid of places with cards; no real photos (gradient placeholder), reviews always 0. |
| **DB `venues`** | Has `place_id`, `google_data` (JSON). Good for linking to Google Details. |

**Gap:** We never call Place Details with **photos** and **reviews**, and we don’t expose a photo URL safely. Place types don’t carry `place_id` from Supabase to the popup.

---

## Goals (from the integration doc)

1. **Place Details** with photos, reviews, opening_hours, website, phone, price_level.
2. **Place Photos** via a server-side proxy/redirect so the API key is never exposed.
3. **Rich place UI**: modal/sheet with Overview, Photos, Reviews (and optional caching to limit cost).

---

## Implementation Plan

### Phase 1: Backend – Details + Photo proxy

1. **Extend `src/lib/google-places.ts`**
   - Add a **details** response type that includes:
     - `photos: { photo_reference: string; width; height }[]`
     - `reviews: { author_name; profile_photo_url; rating; relative_time_description; text; time }[]`
     - `opening_hours: { open_now; weekday_text[] }`
     - `formatted_address`, `formatted_phone_number`, `website`, `rating`, `user_ratings_total`, `price_level`, `geometry`
   - In `getPlaceDetails()`, request a single `fields` string that includes:
     - `name,formatted_address,geometry,photos,reviews,rating,user_ratings_total,opening_hours,website,formatted_phone_number,price_level,types`
   - Keep using the existing Place Details JSON endpoint (legacy API is fine).

2. **New API route: GET `/api/places/details/[placeId]`** (or `?place_id=...`)
   - Reads `place_id` (from path or query).
   - Calls `getPlaceDetails({ place_id, fields: "..." })`.
   - Returns `{ result: <details> }` or 404.
   - **Optional:** Cache response for 1 hour (in-memory Map keyed by `place_id` or Vercel KV) to reduce cost.

3. **New API route: GET `/api/places/photo`**
   - Query: `photo_reference=...`, `maxwidth=400` (default).
   - Server builds Google photo URL:  
     `https://maps.googleapis.com/maps/api/place/photo?maxwidth=...&photo_reference=...&key=GOOGLE_MAPS_API_KEY`
   - Respond with **302 redirect** to that URL (so the browser loads the image from Google; key stays server-side).
   - No response body needed; client uses `<img src="/api/places/photo?photo_reference=...&maxwidth=800" />`.

4. **Env**
   - Ensure `GOOGLE_MAPS_API_KEY` is set in Vercel (and locally). Same key can be used for Places + Maps if already configured.

---

### Phase 2: Data flow – Pass `place_id` to the UI

5. **Add `place_id` to place types**
   - In `src/types/place.ts`, add optional `place_id?: string` to `PlaceBase` (or to a shared type used by BeachClub, Restaurant, CulturalPlace).

6. **Include `place_id` when mapping DB → place**
   - In `useVenues.ts`, `VenueRow` already has `place_id`. In `venueToPlace()`, add `place_id: venue.place_id` to the returned object so every place from Supabase carries its Google `place_id`.

7. **DashboardClient / map**
   - When user clicks a marker, `selectedPlace` is already set. No change needed except that `selectedPlace` will now have `place_id` when it comes from Supabase.

---

### Phase 3: Rich place UI (Details modal with photos & reviews)

8. **Place details fetcher**
   - Add a small hook or fetch helper, e.g. `usePlaceDetails(placeId: string | null)`, that:
     - When `placeId` is set, calls `GET /api/places/details/<placeId>` (or with `?place_id=...`).
     - Returns `{ details, loading, error }`.
   - Use it when the user opens a place that has `place_id`.

9. **Photo URL helper**
   - In the app, define something like:
     - `getPlacePhotoUrl(photoReference: string, maxWidth = 400) => \`/api/places/photo?photo_reference=${encodeURIComponent(photoReference)}&maxwidth=${maxWidth}\``
   - Use this for all place images (list thumbnails and modal gallery).

10. **PlaceDetailsModal (or extend PlacePopup)**
    - **Option A (recommended):** When the selected place has `place_id`, fetch details and show a **richer modal** (tabs: Overview, Photos, Reviews). When there’s no `place_id`, keep the current simple `PlacePopup`.
    - **Option B:** Always show the same modal; if `place_id` exists, fetch details and show photos/reviews; otherwise show only the basic info we already have.
    - Modal content (from the doc):
      - **Header:** Cover image (first photo via `/api/places/photo?…&maxwidth=800`), name, rating, `user_ratings_total`, price level, Open now / Closed.
      - **Tabs:** Overview | Photos | Reviews.
      - **Overview:** Address, phone, website, opening_hours.weekday_text, and action buttons (Website, Call, Chat, Directions) using existing logic.
      - **Photos:** Main image + thumbnails; click thumbnail to change main. All `src` use `getPlacePhotoUrl(photo.photo_reference, 150)` or `800`.
      - **Reviews:** List of reviews with author photo, name, relative_time_description, star rating, and text. Reuse styling from the doc (cards, stars).

11. **Types**
    - Add TypeScript interfaces for the Place Details response (photos, reviews, opening_hours) in `src/types/` or in `google-places.ts`, and use them in the modal and in the API route response.

---

### Phase 4: Cost control and polish

12. **Caching**
    - Details: cache by `place_id` for 1 hour (in-memory in serverless is per-instance; for shared cache use Vercel KV or similar).
    - Photos: no need to cache the image ourselves; redirect is enough. Optionally cache the 302 response with appropriate cache headers if desired.

13. **Only fetch details on demand**
    - Do **not** fetch Place Details for every marker. Only when the user opens a place (clicks marker or list item) and the place has `place_id`, call the details API.

14. **Photo sizes**
    - Thumbnails: `maxwidth=150` or `200`. Modal main/cover: `maxwidth=800`. List cards: `maxwidth=400`. This keeps usage and layout reasonable.

15. **Error and loading states**
    - If details fail to load, show a fallback (e.g. current simple popup or “Details unavailable”) and optionally a retry.

---

## Suggested order of work

| Step | Task | Notes |
|------|------|--------|
| 1 | Extend `google-places.ts` types and `getPlaceDetails` fields | Enables details + photos + reviews |
| 2 | Add `/api/places/details/[placeId]` | Returns full details for one place |
| 3 | Add `/api/places/photo` with 302 redirect | Safe photo URLs in the app |
| 4 | Add `place_id` to place types and `venueToPlace()` | So UI has place_id for Supabase venues |
| 5 | Implement `usePlaceDetails(placeId)` and photo URL helper | Data + URLs for modal |
| 6 | Build PlaceDetailsModal (tabs: Overview, Photos, Reviews) | Match doc design |
| 7 | Wire map/list click: if `place_id` → fetch details → show modal; else current popup | Single entry point |
| 8 | (Optional) Add server-side cache for details | Reduces API cost |

---

## API cost (from doc)

- Nearby Search: ~$32 / 1k requests  
- Place Details: ~$17 / 1k (basic)  
- Place Photo: ~$7 / 1k  

By fetching details only on user click and caching for 1 hour, cost stays manageable.

---

## Optional later

- **Text search:** Add `GET /api/places/search?q=cenotes` using Places Text Search (or New API) for “search in Tulum” from the app.
- **Places API (New):** If you need better ranking or newer features, add a path that calls `places:searchText` (v1) and map results to your venue/place shape.
- **Store photos/reviews in DB:** If you want to show something before a details request, you could store the first photo_reference and a few reviews in `venues.google_data` during sync and use them as fallback in the UI.

---

## Files to add or touch

| File | Action |
|------|--------|
| `src/lib/google-places.ts` | Extend details type and `getPlaceDetails` fields |
| `src/app/api/places/details/[placeId]/route.ts` (or `route.ts?place_id=`) | New: return place details |
| `src/app/api/places/photo/route.ts` | New: 302 to Google photo URL |
| `src/types/place.ts` | Add `place_id?` to base type |
| `src/hooks/useVenues.ts` | Add `place_id` to `venueToPlace()` |
| `src/hooks/usePlaceDetails.ts` | New: fetch details by place_id |
| `src/components/places/PlaceDetailsModal.tsx` | New: tabs Overview / Photos / Reviews |
| `src/components/places/PlacePopup.tsx` or `DashboardClient.tsx` | Use details when `place_id` present and show PlaceDetailsModal |
| `src/app/globals.css` | Any extra styles for modal/tabs (optional) |

This plan aligns the integration doc with your existing Supabase + Google sync and keeps the API key server-side while adding photos and reviews to the experience.
