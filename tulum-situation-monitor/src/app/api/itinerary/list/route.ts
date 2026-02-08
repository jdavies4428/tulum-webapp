import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** GET: List saved itineraries for the current user */
export async function GET() {
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
    .select("id, title, summary, days, tips, estimated_total_cost, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ itineraries: data ?? [] });
}
