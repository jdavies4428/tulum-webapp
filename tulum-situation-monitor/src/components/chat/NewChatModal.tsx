"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface ChatUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface NewChatModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation?: () => void;
  preselectedUserId?: string;
}

export function NewChatModal({
  lang,
  isOpen,
  onClose,
  onSelectConversation,
  preselectedUserId,
}: NewChatModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [followingList, setFollowingList] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "following">("following");

  const t = translations[lang] as Record<string, string>;

  const fetchFollowing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/users?following=true");
      const data = await res.json();
      setFollowingList(data.users ?? []);
    } catch {
      setFollowingList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFollowing();
    }
  }, [isOpen, fetchFollowing]);

  // When preselectedUserId is set (e.g. from profile Message button), create conversation and navigate
  useEffect(() => {
    if (!preselectedUserId || !isOpen) return;
    const run = async () => {
      try {
        const res = await fetch("/api/chat/conversations/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otherUserId: preselectedUserId }),
        });
        const data = await res.json();
        if (data.conversationId) {
          onClose();
          onSelectConversation?.();
          router.push(`/messages/${data.conversationId}?lang=${lang}`);
        }
      } catch {
        // Fall back to showing modal
      }
    };
    run();
  }, [preselectedUserId, isOpen, lang, router, onClose, onSelectConversation]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/chat/users?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSearchResults(data.users ?? []);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectUser = async (user: ChatUser) => {
    try {
      const res = await fetch("/api/chat/conversations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: user.id }),
      });
      const data = await res.json();
      if (data.conversationId) {
        onClose();
        onSelectConversation?.();
        router.push(`/messages/${data.conversationId}?lang=${lang}`);
      }
    } catch {
      // Error starting conversation
    }
  };

  if (!isOpen) return null;

  const displayList = activeTab === "search" ? searchResults : followingList;
  const showList = activeTab === "search" ? searchQuery.length >= 2 : true;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          zIndex: 9998,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 400,
          maxHeight: "80vh",
          background: "#0A0F14",
          borderRadius: 24,
          border: "3px solid rgba(0, 206, 209, 0.3)",
          boxShadow: "0 24px 80px rgba(0, 206, 209, 0.3)",
          zIndex: 9999,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: 20,
            borderBottom: "2px solid rgba(0, 206, 209, 0.2)",
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              margin: "0 0 16px 0",
              color: "#E8ECEF",
            }}
          >
            {t.newConversation ?? "New conversation"}
          </h2>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchUsers ?? "Search users..."}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "2px solid rgba(0, 206, 209, 0.3)",
              fontSize: 15,
              outline: "none",
              marginBottom: 12,
            }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setActiveTab("following")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 10,
                border: "none",
                background:
                  activeTab === "following"
                    ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                    : "rgba(0, 206, 209, 0.15)",
                color: activeTab === "following" ? "#FFF" : "#E8ECEF",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t.following ?? "Following"}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("search")}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 10,
                border: "none",
                background:
                  activeTab === "search"
                    ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                    : "rgba(0, 206, 209, 0.15)",
                color: activeTab === "search" ? "#FFF" : "#E8ECEF",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t.search ?? "Search"}
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 12,
          }}
        >
          {loading && activeTab === "following" ? (
            <div style={{ textAlign: "center", padding: 24, color: "rgba(232, 236, 239, 0.6)" }}>
              {t.loading ?? "Loading…"}
            </div>
          ) : showList && displayList.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "rgba(232, 236, 239, 0.6)" }}>
              {activeTab === "search"
                ? (t.noUsersFound ?? "No users found")
                : (t.noFollowingYet ?? "You're not following anyone yet")}
            </div>
          ) : (
            displayList.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectUser(u)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  marginBottom: 8,
                  background: "rgba(20, 30, 45, 0.85)",
                  border: "2px solid rgba(0, 206, 209, 0.2)",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "#FFF",
                    fontWeight: 700,
                  }}
                >
                  {u.avatar_url ? (
                    <img
                      src={u.avatar_url}
                      alt={u.display_name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    u.display_name[0]?.toUpperCase() ?? "👤"
                  )}
                </div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#E8ECEF",
                  }}
                >
                  {u.display_name}
                </span>
              </button>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.1)",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
    </>
  );
}
