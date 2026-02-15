"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface LocalEvent {
  id: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_avatar: string;
  content: string;
  image_url: string | null;
  metadata: {
    likes_count?: number;
    replies_count?: number;
  } | null;
  created_at: string;
  updated_at: string;
}

export function useLocalEvents() {
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data.events ?? []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Delete event
  const deleteEvent = useCallback(
    async (eventId: string) => {
      // Optimistic update
      setEvents((prev) => prev.filter((e) => e.id !== eventId));

      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          // Revert on failure
          await fetchEvents();
          throw new Error("Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
      }
    },
    [fetchEvents]
  );

  // Update event
  const updateEvent = useCallback(
    async (
      eventId: string,
      updates: {
        content: string;
        authorName?: string;
        authorHandle?: string;
        authorAvatar?: string;
        imageUrl?: string | null;
      }
    ) => {
      // Optimistic update
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                content: updates.content,
                author_name: updates.authorName ?? e.author_name,
                author_handle: updates.authorHandle ?? e.author_handle,
                author_avatar: updates.authorAvatar ?? e.author_avatar,
                image_url: updates.imageUrl ?? e.image_url,
                updated_at: new Date().toISOString(),
              }
            : e
        )
      );

      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          // Revert on failure
          await fetchEvents();
          throw new Error("Failed to update event");
        }

        const updatedEvent = await response.json();
        // Update with server response
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? updatedEvent : e))
        );
      } catch (error) {
        console.error("Error updating event:", error);
        throw error;
      }
    },
    [fetchEvents]
  );

  // Real-time subscription (pattern from useChatMessages.ts)
  useEffect(() => {
    const channel = supabase
      .channel("local_events_feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "local_events",
        },
        (payload) => {
          const newEvent = payload.new as LocalEvent;
          setEvents((prev) => [newEvent, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "local_events",
        },
        (payload) => {
          const updatedEvent = payload.new as LocalEvent;
          setEvents((prev) =>
            prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "local_events",
        },
        (payload) => {
          const deletedId = payload.old.id as string;
          setEvents((prev) => prev.filter((e) => e.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { events, loading, refetch: fetchEvents, deleteEvent, updateEvent };
}
