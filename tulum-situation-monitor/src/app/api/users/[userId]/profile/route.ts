import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url, bio, user_type, is_public")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Run all follow queries in parallel instead of sequentially (3 → 1 round-trip)
  const [followersRes, followingRes, followCheck] = await Promise.all([
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", userId),
    currentUser && currentUser.id !== userId
      ? supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUser.id)
          .eq("following_id", userId)
          .single()
      : Promise.resolve({ data: null }),
  ]);
  const followersCount = followersRes.count ?? 0;
  const followingCount = followingRes.count ?? 0;
  const isFollowing = !!followCheck.data;

  return NextResponse.json({
    id: profile.id,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    user_type: profile.user_type,
    is_public: profile.is_public,
    email: currentUser?.id === userId ? profile.email : undefined,
    followers_count: followersCount,
    following_count: followingCount,
    is_following: isFollowing,
    is_own_profile: currentUser?.id === userId,
  });
}
