import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/insider-picks
 * Returns array of place IDs that are insider picks
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("insider_picks")
      .select("place_id");

    if (error) throw error;

    const placeIds = data?.map((row) => row.place_id) ?? [];
    return NextResponse.json({ placeIds });
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

    // Check if user is admin (you can customize this check)
    // For now, checking user metadata or a specific email
    const isAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
                    user.user_metadata?.role === "admin";

    if (!isAdmin) {
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
