import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/** GET: Fetch a single saved itinerary */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to view itineraries" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("saved_itineraries")
    .select("id, title, summary, days, tips, estimated_total_cost, raw_data, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    title: data.title,
    summary: data.summary,
    days: data.days ?? [],
    tips: data.tips ?? [],
    estimated_total_cost: data.estimated_total_cost,
    raw_data: data.raw_data,
    created_at: data.created_at,
  });
}

/** DELETE: Remove a saved itinerary */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to delete itineraries" }, { status: 401 });
  }

  const { error } = await supabase
    .from("saved_itineraries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
