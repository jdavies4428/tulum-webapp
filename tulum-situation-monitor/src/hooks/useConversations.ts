"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface ConversationListItem {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
  other_user: ChatUser;
  unread_count: number;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/conversations");
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
}
