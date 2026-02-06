import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/places/photo?photo_reference=xxx&maxwidth=400
 * Redirects to Google Place Photo URL. Keeps API key server-side.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoReference = searchParams.get("photo_reference");
    const maxwidth = searchParams.get("maxwidth") ?? "400";

    if (!photoReference) {
      return NextResponse.json({ error: "photo_reference required" }, { status: 400 });
    }

    const key = process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(photoReference)}&key=${key}`;

    return NextResponse.redirect(photoUrl, 302);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate photo URL";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
