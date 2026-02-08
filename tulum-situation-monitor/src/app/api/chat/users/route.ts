import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/** GET: Search users or list people you follow (for new chat) */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const followingOnly = searchParams.get("following") === "true";

  if (followingOnly) {
    // List people the current user follows
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);

    const ids = (follows ?? []).map((f) => f.following_id);
    if (ids.length === 0) {
      return NextResponse.json({ users: [] });
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", ids)
      .neq("id", user.id);

    return NextResponse.json({
      users: (profiles ?? []).map((p) => ({
        id: p.id,
        display_name: p.display_name ?? "Unknown",
        avatar_url: p.avatar_url,
      })),
    });
  }

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  // Search by display_name (ilike)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .ilike("display_name", `%${q}%`)
    .neq("id", user.id)
    .limit(20);

  return NextResponse.json({
    users: (profiles ?? []).map((p) => ({
      id: p.id,
      display_name: p.display_name ?? "Unknown",
      avatar_url: p.avatar_url,
    })),
  });
}
