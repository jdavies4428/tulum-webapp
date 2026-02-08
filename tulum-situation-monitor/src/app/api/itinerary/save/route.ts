import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/** POST: Save an AI itinerary for the current user */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to save itineraries" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "My Tulum Itinerary";
    const summary = typeof body.summary === "string" ? body.summary : null;
    const days = Array.isArray(body.days) ? body.days : [];
    const tips = Array.isArray(body.tips) ? body.tips : [];
    const estimated_total_cost =
      typeof body.estimated_total_cost === "string" ? body.estimated_total_cost : null;
    const raw_data = body.raw_data != null ? body.raw_data : null;

    const { data, error } = await supabase
      .from("saved_itineraries")
      .insert({
        user_id: user.id,
        title: title || "My Tulum Itinerary",
        summary,
        days,
        tips,
        estimated_total_cost,
        raw_data,
      })
      .select("id, title, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, itinerary: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save" },
      { status: 500 }
    );
  }
}
