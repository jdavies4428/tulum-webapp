"use client";

import { useState, useEffect, useCallback } from "react";

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

  const deleteEvent = useCallback(
    async (eventId: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));

      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
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
          await fetchEvents();
          throw new Error("Failed to update event");
        }

        const updatedEvent = await response.json();
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

  return { events, loading, refetch: fetchEvents, deleteEvent, updateEvent };
}
