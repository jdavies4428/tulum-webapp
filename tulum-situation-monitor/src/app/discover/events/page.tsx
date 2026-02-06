"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";

const FAKE_EVENTS = [
  {
    id: "1",
    author: "Tulum Beach Club",
    handle: "@tulumbeach",
    avatar: "🏖️",
    content:
      "Sunset yoga every Tuesday at 6pm! Free for hotel guests. Join us on the beach for a magical evening. 🧘‍♀️🌅",
    time: "2h",
    likes: 24,
    replies: 5,
  },
  {
    id: "2",
    author: "Cenote Tours QR",
    handle: "@cenotetours",
    avatar: "🏊",
    content:
      "New cenote discovery tour launching next week! Crystal clear waters, hidden caves. Limited spots. DM to book! #Tulum #Cenotes",
    time: "5h",
    likes: 89,
    replies: 12,
  },
  {
    id: "3",
    author: "Tulum Food Fest",
    handle: "@tulumfoodfest",
    avatar: "🍽️",
    content:
      "🌴 Tulum Food Festival March 15–17! Street food, fine dining pop-ups, live music. Get your tickets at tulumfoodfest.com",
    time: "1d",
    likes: 312,
    replies: 47,
  },
  {
    id: "4",
    author: "Sian Ka'an Eco",
    handle: "@siankaantours",
    avatar: "🐢",
    content:
      "Whale shark season is here! Book your snorkel tour with us—biosphere-certified, small groups. Protecting the reef since 2010.",
    time: "2d",
    likes: 156,
    replies: 23,
  },
];

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang] as Record<string, string>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #E0F7FA 0%, #FFF8E7 50%, #FFFFFF 100%)",
        color: "var(--text-primary)",
        paddingTop: "max(24px, env(safe-area-inset-top))",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255, 248, 231, 0.95)",
          borderBottom: "1px solid rgba(0, 206, 209, 0.2)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(0, 206, 209, 0.12)",
            border: "2px solid rgba(0, 206, 209, 0.2)",
            color: "var(--tulum-ocean)",
            fontSize: "18px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "800",
            margin: 0,
            color: "var(--tulum-ocean)",
          }}
        >
          📅 {t.localEvents ?? "Local Events"}
        </h1>
      </header>

      {/* Feed */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {FAKE_EVENTS.map((event) => (
          <article
            key={event.id}
            style={{
              padding: "16px",
              borderBottom: "1px solid rgba(0, 206, 209, 0.15)",
              display: "flex",
              gap: "12px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
                border: "2px solid rgba(0, 206, 209, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                flexShrink: 0,
              }}
            >
              {event.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "15px",
                    color: "#333",
                  }}
                >
                  {event.author}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  {event.handle}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#999",
                  }}
                >
                  · {event.time}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "15px",
                  lineHeight: "1.5",
                  color: "#333",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {event.content}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  marginTop: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "#999",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  💬 {event.replies}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#999",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  ♥️ {event.likes}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
