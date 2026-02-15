import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      user.user_metadata?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, authorName, authorHandle, authorAvatar, imageUrl } = body;

    // Validate required fields
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Content must be less than 2000 characters" },
        { status: 400 }
      );
    }

    // Check if event exists and user is the author
    const { data: existingEvent, error: fetchError } = await supabase
      .from("local_events")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.author_id !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own events" },
        { status: 403 }
      );
    }

    // Update the event
    const updateData: Record<string, unknown> = {
      content: content.trim(),
      updated_at: new Date().toISOString(),
    };

    if (authorName) updateData.author_name = authorName;
    if (authorHandle) updateData.author_handle = authorHandle;
    if (authorAvatar) updateData.author_avatar = authorAvatar;
    if (imageUrl !== undefined) updateData.image_url = imageUrl;

    const { data: updatedEvent, error: updateError } = await supabase
      .from("local_events")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating event:", updateError);
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error in PATCH /api/events/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      user.user_metadata?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    // Check if event exists and user is the author
    const { data: existingEvent, error: fetchError } = await supabase
      .from("local_events")
      .select("author_id, image_url")
      .eq("id", params.id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.author_id !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own events" },
        { status: 403 }
      );
    }

    // Delete the event image from storage if it exists
    if (existingEvent.image_url) {
      try {
        const url = new URL(existingEvent.image_url);
        const pathMatch = url.pathname.match(/event-images\/(.+)$/);
        if (pathMatch) {
          const filePath = pathMatch[1];
          await supabase.storage.from("event-images").remove([filePath]);
        }
      } catch (error) {
        console.error("Error deleting event image:", error);
        // Continue with event deletion even if image deletion fails
      }
    }

    // Delete the event
    const { error: deleteError } = await supabase
      .from("local_events")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      console.error("Error deleting event:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete event" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/events/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
