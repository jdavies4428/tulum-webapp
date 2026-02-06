import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetails } from "@/lib/google-places";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/places/details?place_id=xxx
 * Returns Place Details (photos, reviews, opening_hours, etc.) from Google.
 * API key stays server-side.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("place_id");
    if (!placeId) {
      return NextResponse.json({ error: "place_id required" }, { status: 400 });
    }

    const result = await getPlaceDetails({ place_id: placeId });
    if (!result) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    return NextResponse.json({ result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to fetch place details";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
