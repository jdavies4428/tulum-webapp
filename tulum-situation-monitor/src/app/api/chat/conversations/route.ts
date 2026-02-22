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

  const convos = conversations ?? [];
  if (convos.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  // Batch: collect all other-user IDs and conversation IDs
  const otherIds = convos.map((c) =>
    c.participant_1 === user.id ? c.participant_2 : c.participant_1
  );
  const convoIds = convos.map((c) => c.id);

  // Single query: fetch all needed profiles at once
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", [...new Set(otherIds)]);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );

  // Single query: fetch unread counts per conversation using RPC or grouped query
  // Supabase doesn't support GROUP BY in the client, so we use a single filtered query
  // and count client-side (still 1 query instead of N)
  const { data: unreadRows } = await supabase
    .from("chat_messages")
    .select("conversation_id")
    .in("conversation_id", convoIds)
    .neq("sender_id", user.id)
    .is("read_at", null);

  const unreadMap = new Map<string, number>();
  for (const row of unreadRows ?? []) {
    unreadMap.set(row.conversation_id, (unreadMap.get(row.conversation_id) ?? 0) + 1);
  }

  // Assemble enriched list — 0 extra queries
  const enriched = convos.map((c, i) => {
    const otherId = otherIds[i];
    const profile = profileMap.get(otherId);
    return {
      ...c,
      other_user: {
        id: otherId,
        display_name: profile?.display_name ?? "Unknown",
        avatar_url: profile?.avatar_url ?? null,
      },
      unread_count: unreadMap.get(c.id) ?? 0,
    };
  });

  return NextResponse.json({ conversations: enriched });
}
