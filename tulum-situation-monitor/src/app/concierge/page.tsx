"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { useConciergeChat } from "@/hooks/useConciergeChat";
import { VoiceInput } from "@/components/concierge/VoiceInput";
import { BottomNav } from "@/components/layout/BottomNav";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

export default function ConciergePage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang] as Record<string, string>;

  const { messages, isLoading, error, sendMessage, clearChat } = useConciergeChat({ lang });
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoSent = useRef(false);

  // Auto-send query from ?q= param (from sidebar chat input)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !hasAutoSent.current && messages.length === 0) {
      hasAutoSent.current = true;
      sendMessage(q);
    }
  }, [searchParams, messages.length, sendMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(inputValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleVoiceTranscript = async (transcript: string) => {
    setInputValue(transcript);
    await sendMessage(transcript);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Header */}
      <header
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "20px",
          paddingTop: "max(20px, env(safe-area-inset-top))",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--card-bg)",
        }}
      >
        <Link
          href={`/?lang=${lang}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "var(--button-secondary)",
            border: "1px solid var(--border-emphasis)",
            color: "var(--text-primary)",
            fontSize: "20px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", margin: 0 }}>
            🤖 {t.conciergeTitle ?? "AI Travel Assistant"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
            {t.conciergeSubtitle ?? "Ask me anything about Tulum"}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              background: "var(--button-secondary)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {t.conciergeNewConversation ?? "New Chat"}
          </button>
        )}
      </header>

      {/* Messages */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "20px",
          paddingBottom: "20px",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              maxWidth: "600px",
              margin: "40px auto",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🌴</div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "12px" }}>
              {t.conciergeWelcome ?? "Welcome to your AI Travel Assistant"}
            </h2>
            <p style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {t.conciergeWelcomeDesc ??
                "Ask me anything about Tulum - beaches, cenotes, restaurants, activities, or create a personalized itinerary!"}
            </p>

            {/* Example questions */}
            <div
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "32px",
              }}
            >
              {[
                t.conciergeExampleBeaches ?? "What are the best beaches?",
                t.conciergeExampleCenotes ?? "Recommend cenotes for swimming",
                t.conciergeExample3Day ?? "Plan a 3-day itinerary for me",
              ].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => sendMessage(example)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--button-secondary)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--card-bg)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  marginBottom: "20px",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  animation: "fadeIn 0.3s ease-out",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "12px 16px",
                    borderRadius: "16px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                        : "var(--card-bg)",
                    color: msg.role === "user" ? "#FFF" : "var(--text-primary)",
                    border: msg.role === "user" ? "none" : "1px solid var(--border-subtle)",
                    fontSize: "15px",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                  }}
                >
                  {msg.content || (isLoading && idx === messages.length - 1 ? "..." : "")}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto 20px",
              padding: "12px 16px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              color: "#EF4444",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}
      </main>

      {/* Input */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 20px",
          paddingBottom: "max(100px, calc(88px + env(safe-area-inset-bottom)))",
          background: "var(--card-bg)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
              marginBottom: "12px",
            }}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.conciergePlaceholder ?? "Ask a question or request an itinerary..."}
              disabled={isLoading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck={false}
              enterKeyHint="send"
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "20px",
                background: "var(--bg-primary)",
                border: "1px solid var(--border-emphasis)",
                color: "var(--text-primary)",
                fontSize: "16px",
                fontFamily: "inherit",
                resize: "none",
                minHeight: "48px",
                maxHeight: "100px",
                outline: "none",
              }}
              rows={1}
            />
            <VoiceInput lang={lang} onTranscript={handleVoiceTranscript} disabled={isLoading} />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background:
                  !inputValue.trim() || isLoading
                    ? "var(--button-secondary)"
                    : "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
                border: "none",
                color: "#FFF",
                fontSize: "20px",
                cursor: !inputValue.trim() || isLoading ? "not-allowed" : "pointer",
                opacity: !inputValue.trim() || isLoading ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {isLoading ? "⏳" : "➤"}
            </button>
          </form>

          {/* Create AI Itinerary Button */}
          <Link
            href={`/itinerary?lang=${lang}`}
            style={{
              display: "block",
              width: "100%",
              padding: "10px 16px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #9370DB 0%, #8A5FC7 100%)",
              border: "none",
              color: "#FFF",
              fontSize: "14px",
              fontWeight: "600",
              textAlign: "center",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ✨ {t.createItinerary ?? "Create AI Itinerary"}
          </Link>
        </div>
      </div>

      <BottomNav lang={lang} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
