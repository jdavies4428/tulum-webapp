import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { conversationIdFor } from "@/lib/chat-helpers";

/** POST: Get or create a conversation with another user */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { otherUserId } = body as { otherUserId?: string };

  if (!otherUserId || typeof otherUserId !== "string") {
    return NextResponse.json(
      { error: "otherUserId is required" },
      { status: 400 }
    );
  }

  if (otherUserId === user.id) {
    return NextResponse.json(
      { error: "Cannot create conversation with yourself" },
      { status: 400 }
    );
  }

  const p1 = user.id < otherUserId ? user.id : otherUserId;
  const p2 = user.id < otherUserId ? otherUserId : user.id;

  // Check if conversation exists
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant_1", p1)
    .eq("participant_2", p2)
    .single();

  if (existing) {
    return NextResponse.json({
      conversationId: existing.id,
      created: false,
    });
  }

  // Create new conversation
  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      participant_1: p1,
      participant_2: p2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    conversationId: created.id,
    created: true,
  });
}
