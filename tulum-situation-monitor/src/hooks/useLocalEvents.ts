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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { events, loading, refetch: fetchEvents };
}
