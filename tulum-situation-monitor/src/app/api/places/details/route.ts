import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetails } from "@/lib/google-places";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/places/details?place_id=xxx&lang=es
 * Returns Place Details (photos, reviews, opening_hours, etc.) from Google.
 * lang (en, es, fr) returns localized name, reviews, and text. API key stays server-side.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("place_id");
    const lang = searchParams.get("lang") ?? undefined;
    if (!placeId) {
      return NextResponse.json({ error: "place_id required" }, { status: 400 });
    }

    const result = await getPlaceDetails({ place_id: placeId, language: lang });
    if (!result) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    return NextResponse.json({ result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to fetch place details";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
