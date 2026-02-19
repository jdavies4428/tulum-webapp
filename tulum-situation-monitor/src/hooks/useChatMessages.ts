"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: "text" | "image" | "place" | "location";
  content: string | null;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export function useChatMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, conversation_id, sender_id, type, content, metadata, read_at, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages((data ?? []) as ChatMessage[]);

      await fetch("/api/chat/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newMsg = payload.new as unknown as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          if (newMsg.sender_id !== user.id) {
            fetch("/api/chat/messages/read", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ conversationId }),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?.id]);

  const sendMessage = useCallback(
    async (
      type: "text" | "image" | "place" | "location",
      content: string | null,
      metadata?: Record<string, unknown>
    ) => {
      if (!conversationId || !user) return null;
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          type,
          content,
          metadata: metadata ?? null,
        })
        .select("id")
        .single();

      if (error) throw error;

      const preview =
        type === "text" && content
          ? content.slice(0, 100)
          : type === "place"
            ? "📍 Shared a place"
            : type === "image"
              ? "📷 Shared a photo"
              : type === "location"
                ? "📍 Shared location"
                : null;

      await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_sender_id: user.id,
          last_message_preview: preview,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      return data?.id;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId, user?.id]
  );

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
