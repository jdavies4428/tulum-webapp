import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** GET: List conversations for the current user */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, participant_1, participant_2, last_message_at, last_message_sender_id, last_message_preview, updated_at")
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch unread counts and participant profiles
  const enriched = await Promise.all(
    (conversations ?? []).map(async (c) => {
      const otherId =
        c.participant_1 === user.id ? c.participant_2 : c.participant_1;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", otherId)
        .single();

      const { count } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .neq("sender_id", user.id)
        .is("read_at", null);

      return {
        ...c,
        other_user: {
          id: otherId,
          display_name: profile?.display_name ?? "Unknown",
          avatar_url: profile?.avatar_url ?? null,
        },
        unread_count: count ?? 0,
      };
    })
  );

  return NextResponse.json({ conversations: enriched });
}
