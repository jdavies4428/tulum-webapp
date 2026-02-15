import { NextRequest, NextResponse } from "next/server";
import { validateQuery, withErrorHandling } from "@/lib/api/utils";
import { placePhotoSchema } from "@/lib/api/schemas";
import { validateServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/places/photo?photo_reference=xxx&maxwidth=400
 * Redirects to Google Place Photo URL. Keeps API key server-side.
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const { photo_reference, maxwidth } = await validateQuery(placePhotoSchema, searchParams);

  // Validate server environment variables
  const serverEnv = validateServerEnv();
  const key = serverEnv.GOOGLE_MAPS_API_KEY;

  // Generate Google Maps photo URL
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(photo_reference)}&key=${key}`;

  return NextResponse.redirect(photoUrl, 302);
});
