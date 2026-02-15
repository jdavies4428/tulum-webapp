"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuthOptional } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useConversations";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { translations } from "@/lib/i18n";
import { formatChatTimestamp } from "@/lib/chat-helpers";
import type { Lang } from "@/lib/weather";

// Code-split NewChatModal for better bundle size (~15KB savings)
const NewChatModal = dynamic(
  () => import("@/components/chat/NewChatModal").then((mod) => ({ default: mod.NewChatModal })),
  { ssr: false, loading: () => null }
);

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const auth = useAuthOptional();
  const { conversations, loading, error, refetch } = useConversations();
  const newUserId = searchParams.get("new");
  const [newChatOpen, setNewChatOpen] = useState(!!newUserId);

  const t = translations[lang] as Record<string, string>;

  if (!auth?.isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
          padding: 24,
        }}
      >
        <div style={{ fontSize: 64 }}>💬</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#333" }}>
          {t.signInToChat ?? "Sign in to view messages"}
        </h2>
        <Link
          href={`/signin?lang=${lang}`}
          style={{
            padding: "14px 28px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            color: "#FFF",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {t.signIn ?? "Sign In"}
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
        paddingBottom: 80,
      }}
    >
      <header
        style={{
          padding: 24,
          background: "rgba(255, 255, 255, 0.9)",
          borderBottom: "2px solid rgba(0, 206, 209, 0.2)",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            margin: "0 0 8px 0",
            background: "linear-gradient(135deg, #0099CC 0%, #00CED1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {t.messages ?? "Messages"}
        </h1>
        <p style={{ fontSize: 15, color: "#666", margin: 0 }}>
          {conversations.length}{" "}
          {conversations.length === 1
            ? (t.conversation ?? "conversation")
            : (t.conversations ?? "conversations")}
        </p>
      </header>

      <div style={{ padding: 16 }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "#666",
              fontSize: 16,
            }}
          >
            {t.loading ?? "Loading…"}
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "#666",
              fontSize: 16,
            }}
          >
            {error}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyChats lang={lang} onNewChat={() => setNewChatOpen(true)} t={t} />
        ) : (
          conversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              currentUserId={auth.user!.id}
              lang={lang}
              t={t}
            />
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => setNewChatOpen(true)}
        style={{
          position: "fixed",
          bottom: 100,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
          border: "none",
          boxShadow: "0 8px 24px rgba(0, 206, 209, 0.4)",
          cursor: "pointer",
          fontSize: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFF",
          zIndex: 100,
        }}
      >
        ✎
      </button>

      <NewChatModal
        lang={lang}
        isOpen={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelectConversation={() => {
          setNewChatOpen(false);
          refetch();
        }}
        preselectedUserId={newUserId ?? undefined}
      />
    </div>
  );
}

function ConversationCard({
  conversation,
  currentUserId,
  lang,
  t,
}: {
  conversation: import("@/hooks/useConversations").ConversationListItem;
  currentUserId: string;
  lang: Lang;
  t: Record<string, string>;
}) {
  const other = conversation.other_user;
  const unread = conversation.unread_count ?? 0;
  const ts = conversation.last_message_at
    ? new Date(conversation.last_message_at).getTime()
    : null;
  const preview =
    (conversation.last_message_preview || t.noMessagesYet) ?? "No messages yet";

  return (
    <Link
      href={`/messages/${conversation.id}?lang=${lang}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 16,
        marginBottom: 12,
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: 20,
        border: "2px solid rgba(0, 206, 209, 0.1)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "3px solid #00CED1",
            overflow: "hidden",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            color: "#FFF",
            fontWeight: 700,
          }}
        >
          {other.avatar_url ? (
            <img
              src={other.avatar_url}
              alt={other.display_name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            other.display_name[0]?.toUpperCase() ?? "👤"
          )}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#333",
            }}
          >
            {other.display_name}
          </span>
          <span style={{ fontSize: 12, color: "#999" }}>
            {formatChatTimestamp(ts)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: unread > 0 ? "#333" : "#999",
              fontWeight: unread > 0 ? 600 : 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {preview}
          </span>
          {unread > 0 && (
            <span
              style={{
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                background: "#00CED1",
                color: "#FFF",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 6px",
                marginLeft: 8,
              }}
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyChats({
  lang,
  onNewChat,
  t,
}: {
  lang: Lang;
  onNewChat: () => void;
  t: Record<string, string>;
}) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
      <h3
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#333",
          marginBottom: 8,
        }}
      >
        {t.noConversationsYet ?? "No conversations yet"}
      </h3>
      <p
        style={{
          fontSize: 15,
          color: "#666",
          marginBottom: 24,
        }}
      >
        {t.startChattingPrompt ?? "Start chatting with travelers and locals"}
      </p>
      <button
        type="button"
        onClick={onNewChat}
        style={{
          padding: "14px 28px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
          border: "none",
          color: "#FFF",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0, 206, 209, 0.3)",
        }}
      >
        {t.startConversation ?? "Start a Conversation"}
      </button>
    </div>
  );
}
