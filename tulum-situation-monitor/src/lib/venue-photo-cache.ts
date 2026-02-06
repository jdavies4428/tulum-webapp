/**
 * Cache Google Place photos to Supabase Storage and set venue.photo_url.
 * Saves Google Photo API cost by fetching once at sync time.
 */

const BUCKET = "venue-photos";
const MAXWIDTH = 400;

function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY required for photo cache");
  return key;
}

function sanitizePath(placeId: string): string {
  return placeId.replace(/[/\\]/g, "_") + ".jpg";
}

type SupabaseAdmin = {
  from: (table: string) => {
    select: (cols: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: { photo_url: string | null } | null }> } };
    update: (row: { photo_url: string }) => { eq: (col: string, val: string) => Promise<{ error: unknown }> };
  };
  storage: {
    createBucket: (name: string, opts: { public: boolean }) => Promise<{ error: unknown }>;
    from: (bucket: string) => {
      upload: (path: string, body: ArrayBuffer, opts: { contentType: string; upsert?: boolean }) => Promise<{ error: unknown }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
};

/** Ensure bucket exists (idempotent). */
export async function ensureBucket(supabase: SupabaseAdmin): Promise<void> {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error && (error as { message?: string }).message !== "The resource already exists") {
    throw new Error(`Failed to create bucket: ${(error as { message?: string }).message ?? String(error)}`);
  }
}

/** Fetch image bytes from Google Place Photo API. */
async function fetchGooglePhoto(photoReference: string): Promise<ArrayBuffer> {
  const key = getApiKey();
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${MAXWIDTH}&photo_reference=${encodeURIComponent(photoReference)}&key=${key}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Google Photo fetch failed: ${res.status}`);
  return res.arrayBuffer();
}

/**
 * If the venue has no photo_url but has a photo_reference, fetch from Google,
 * upload to Storage, and set venue.photo_url. No-op if already cached.
 */
export async function cacheVenuePhotoIfNeeded(
  supabase: SupabaseAdmin,
  placeId: string,
  photoReference: string | undefined
): Promise<void> {
  if (!photoReference) return;

  const { data: row } = await supabase.from("venues").select("photo_url").eq("place_id", placeId).single();
  if (row?.photo_url) return;

  const buffer = await fetchGooglePhoto(photoReference);
  const path = sanitizePath(placeId);
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (uploadError) throw new Error(`Storage upload failed: ${(uploadError as { message?: string }).message ?? String(uploadError)}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const { error: updateError } = await supabase.from("venues").update({ photo_url: urlData.publicUrl }).eq("place_id", placeId);
  if (updateError) throw new Error(`Venue update failed: ${(updateError as { message?: string }).message ?? String(updateError)}`);
}
