/**
 * Rewrites Supabase Storage public URLs to go through Next.js image optimization.
 *
 * Before: browser fetches directly from Supabase CDN → counted as Supabase egress.
 * After:  browser fetches from /_next/image → Vercel CDN caches it → Supabase hit only once.
 *
 * Works in both React components and raw HTML strings (e.g. Leaflet popups).
 *
 * Allowed widths must match Next.js deviceSizes + imageSizes defaults:
 * [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
 */

const ALLOWED_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

function nearestAllowedWidth(w: number): number {
  for (const aw of ALLOWED_WIDTHS) {
    if (aw >= w) return aw;
  }
  return ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
}

/**
 * Rewrite a Supabase Storage URL to go through Next.js image proxy.
 * Returns null if the input is null/undefined.
 * Non-Supabase URLs are returned unchanged.
 */
export function proxyImageUrl(
  url: string | null | undefined,
  width = 400,
  quality = 75
): string | null {
  if (!url) return null;

  // Only rewrite Supabase Storage URLs
  if (url.includes("supabase.co/storage/")) {
    const w = nearestAllowedWidth(width);
    return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=${quality}`;
  }

  return url;
}
