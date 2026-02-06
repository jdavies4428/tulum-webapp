"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const DISCOVER_ITEMS: { id: keyof typeof translations.en; icon: string }[] = [
  { id: "itinerary", icon: "📋" },
  { id: "event", icon: "📅" },
  { id: "transportation", icon: "🚗" },
  { id: "translation", icon: "🌐" },
  { id: "foodDelivery", icon: "🛵" },
];

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const lang = (searchParams.get("lang") as Lang) || "en";
  const t = translations[lang];
  const tAny = t as Record<string, string>;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        padding: "24px",
        paddingTop: "max(24px, env(safe-area-inset-top))",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "16px",
        }}
      >
        <Link
          href="/"
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
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            margin: 0,
          }}
        >
          ✨ {tAny.discover ?? "Discover"}
        </h1>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
        }}
      >
        {DISCOVER_ITEMS.map(({ id, icon }) => {
          const href =
            id === "transportation"
              ? `/discover/transportation?lang=${lang}`
              : id === "foodDelivery"
                ? `/discover/food-delivery?lang=${lang}`
                : undefined;
          const cardStyle = {
            background: "var(--card-bg)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px",
            padding: "24px",
            display: "flex" as const,
            flexDirection: "column" as const,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            gap: "12px",
            minHeight: "120px",
            transition: "background 0.2s, border-color 0.2s",
            cursor: href ? "pointer" : undefined,
          };
          const onEnter = (e: React.MouseEvent<HTMLElement>) => {
            e.currentTarget.style.background = "var(--card-hover)";
            e.currentTarget.style.borderColor = "var(--border-emphasis)";
          };
          const onLeave = (e: React.MouseEvent<HTMLElement>) => {
            e.currentTarget.style.background = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          };
          const content = (
            <>
              <span style={{ fontSize: "40px" }}>{icon}</span>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                {tAny[id] ?? id}
              </span>
            </>
          );
          if (href) {
            return (
              <Link
                key={id}
                href={href}
                style={{ ...cardStyle, textDecoration: "none" }}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                {content}
              </Link>
            );
          }
          return (
            <div key={id} style={cardStyle} onMouseEnter={onEnter} onMouseLeave={onLeave}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
