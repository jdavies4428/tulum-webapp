"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useChatMessages } from "@/hooks/useChatMessages";
import { createClient } from "@/lib/supabase/client";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { translations } from "@/lib/i18n";
import { formatMessageTime } from "@/lib/chat-helpers";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { SharePlaceModal } from "@/components/chat/SharePlaceModal";
import type { Lang } from "@/lib/weather";

interface OtherUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useChatMessages(conversationId);
  const [conversation, setConversation] = useState<{
    participant_1: string;
    participant_2: string;
  } | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [sharePlaceOpen, setSharePlaceOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    if (!conversationId || !user) return;
    const load = async () => {
      const { data: conv } = await supabase
        .from("conversations")
        .select("participant_1, participant_2")
        .eq("id", conversationId)
        .single();
      if (conv) {
        setConversation(conv);
        const otherId =
          conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .eq("id", otherId)
          .single();
        if (profile) {
          setOtherUser({
            id: profile.id,
            display_name: profile.display_name ?? "Unknown",
            avatar_url: profile.avatar_url,
          });
        }
      }
    };
    load();
  }, [conversationId, user, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendText = async (text: string) => {
    if (!text.trim()) return;
    await sendMessage("text", text.trim());
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await sendMessage("location", null, {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true }
    );
  };

  const handleSharePlace = () => setSharePlaceOpen(true);

  const handleSelectPlace = async (place: {
    place_id: string;
    place_name: string;
    category?: string;
    image_url?: string;
    rating?: number;
  }) => {
    await sendMessage("place", place.place_name, place);
    setSharePlaceOpen(false);
  };

  const handleShareImage = async (imageUrl: string) => {
    await sendMessage("image", null, { imageUrl });
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
        }}
      >
        <Link
          href={`/signin?lang=${lang}`}
          style={{
            padding: "14px 28px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            color: "#FFF",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {t.signIn ?? "Sign In"}
        </Link>
      </div>
    );
  }

  if (!conversation || !otherUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
        }}
      >
        <div style={{ color: "#666" }}>{t.loading ?? "Loading…"}</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
      }}
    >
      <header
        style={{
          padding: 16,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "2px solid rgba(0, 206, 209, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href={`/messages?lang=${lang}`}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0, 206, 209, 0.1)",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            color: "#333",
          }}
        >
          ←
        </Link>

        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid #00CED1",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "#FFF",
            fontWeight: 700,
          }}
        >
          {otherUser.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.display_name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            otherUser.display_name[0]?.toUpperCase() ?? "👤"
          )}
        </div>

        <Link
          href={`/users/${otherUser.id}?lang=${lang}`}
          style={{ flex: 1, textDecoration: "none", color: "inherit" }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>
            {otherUser.display_name}
          </div>
          <div style={{ fontSize: 13, color: "#999" }}>
            {t.viewProfile ?? "View profile"}
          </div>
        </Link>
      </header>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
            {t.loading ?? "Loading…"}
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.sender_id === user.id;
            const showAvatar =
              !isOwn &&
              (i === messages.length - 1 ||
                messages[i + 1]?.sender_id !== msg.sender_id);
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={isOwn}
                showAvatar={showAvatar}
                otherUser={otherUser}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSendText}
        lang={lang}
        onSharePlace={handleSharePlace}
        onShareLocation={handleShareLocation}
        onShareImage={handleShareImage}
      />

      <SharePlaceModal
        lang={lang}
        isOpen={sharePlaceOpen}
        onClose={() => setSharePlaceOpen(false)}
        onSelectPlace={handleSelectPlace}
      />
    </div>
  );
}
