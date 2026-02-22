import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth-helpers";

/**
 * GET /api/events
 * Returns all local events, newest first
 * Public endpoint - no auth required
 * Cached for 60s to reduce Supabase egress
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("local_events")
      .select("id, author_id, author_name, author_handle, author_avatar, content, image_url, metadata, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json(
      { events: data ?? [] },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (error) {
    console.error("Error fetching local events:", error);
    return NextResponse.json(
      { events: [], error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Create a new local event (admin only)
 * Body: { content: string, authorName: string, authorHandle: string, authorAvatar?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, authorName, authorHandle, authorAvatar, imageUrl } = body;

    // Validation
    if (!content || !authorName || !authorHandle) {
      return NextResponse.json(
        {
          error: "Missing required fields: content, authorName, authorHandle",
        },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Content too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    // Insert event
    const { data, error } = await supabase
      .from("local_events")
      .insert({
        author_id: user.id,
        content: content.trim(),
        author_name: authorName.trim(),
        author_handle: authorHandle.trim(),
        author_avatar: authorAvatar || "📅",
        image_url: imageUrl || null,
        metadata: { likes_count: 0, replies_count: 0 },
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, event: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating local event:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
