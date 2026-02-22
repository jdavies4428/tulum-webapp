import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth-helpers";

/**
 * GET /api/insider-picks
 * Returns array of place IDs that are insider picks
 * Cached for 5 minutes — this data rarely changes
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("insider_picks")
      .select("place_id");

    if (error) throw error;

    const placeIds = data?.map((row) => row.place_id) ?? [];
    return NextResponse.json(
      { placeIds },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (error) {
    console.error("Error fetching insider picks:", error);
    return NextResponse.json({ placeIds: [] });
  }
}

/**
 * POST /api/insider-picks
 * Adds or removes a place from insider picks (admin only)
 * Body: { placeId: string, action: "add" | "remove" }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { placeId, action } = body;

    if (!placeId || !action) {
      return NextResponse.json({ error: "Missing placeId or action" }, { status: 400 });
    }

    if (action === "add") {
      // Add to insider picks
      const { error } = await supabase
        .from("insider_picks")
        .upsert({ place_id: placeId, added_by: user.id }, { onConflict: "place_id" });

      if (error) throw error;
      return NextResponse.json({ success: true, action: "added" });

    } else if (action === "remove") {
      // Remove from insider picks
      const { error } = await supabase
        .from("insider_picks")
        .delete()
        .eq("place_id", placeId);

      if (error) throw error;
      return NextResponse.json({ success: true, action: "removed" });

    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error managing insider picks:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
