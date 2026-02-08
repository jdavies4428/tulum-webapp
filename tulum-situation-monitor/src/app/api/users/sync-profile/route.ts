import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Sync the current user's profile (email, display_name, avatar_url) from Auth
 * to the profiles table. Call after OAuth sign-in to ensure we capture
 * email from Google/Apple.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email =
    user.email ??
    (user.user_metadata?.email as string | undefined) ??
    (user.user_metadata?.email_address as string | undefined) ??
    user.id + "@auth.local";
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;

  const { error: upsertError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: email.trim() || user.id + "@auth.local",
      display_name: displayName?.trim() || null,
      avatar_url: avatarUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    console.error("sync-profile upsert error:", upsertError);
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
