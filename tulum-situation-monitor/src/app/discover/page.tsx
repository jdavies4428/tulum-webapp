"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const DISCOVER_ITEMS: { id: keyof typeof translations.en; icon: string; labelKey?: keyof typeof translations.en }[] = [
  { id: "event", icon: "📅", labelKey: "localEvents" },
  { id: "transportation", icon: "🚗" },
  { id: "foodDelivery", icon: "🛵" },
  { id: "itinerary", icon: "📋", labelKey: "aiItinerary" },
  { id: "translation", icon: "🌐" },
];

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const lang = (searchParams.get("lang") as Lang) || "en";
  const t = translations[lang];
  const tAny = t as Record<string, string>;

  const CARD_GRADIENTS: Record<string, string> = {
    event: "linear-gradient(135deg, #FFE4CC 0%, #FFD4B8 100%)",
    transportation: "linear-gradient(135deg, #B8E6F0 0%, #A0D8E8 100%)",
    foodDelivery: "linear-gradient(135deg, #FFD4E5 0%, #FFC0D9 100%)",
    itinerary: "linear-gradient(135deg, #D4E4BC 0%, #C2D8A8 100%)",
    translation: "linear-gradient(135deg, #E8D4F1 0%, #DCC5E8 100%)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #E0F7FA 0%, #FFF8E7 50%, #FFFFFF 100%)",
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
            background: "rgba(0, 206, 209, 0.12)",
            border: "2px solid rgba(0, 206, 209, 0.2)",
            color: "var(--tulum-ocean)",
            fontSize: "20px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "800",
            margin: 0,
            color: "var(--tulum-ocean)",
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
        {DISCOVER_ITEMS.map(({ id, icon, labelKey }) => {
          const href =
            id === "transportation"
              ? `/discover/transportation?lang=${lang}`
              : id === "foodDelivery"
                ? `/discover/food-delivery?lang=${lang}`
                : id === "itinerary"
                  ? `/itinerary?lang=${lang}`
                  : id === "translation"
                    ? `/discover/translation?lang=${lang}`
                    : undefined;
          const cardStyle = {
            background: CARD_GRADIENTS[id] ?? "var(--card-bg)",
            border: "none",
            borderRadius: "24px",
            padding: "24px",
            display: "flex" as const,
            flexDirection: "column" as const,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            gap: "12px",
            minHeight: "120px",
            transition: "all 0.3s",
            cursor: href ? "pointer" : undefined,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          };
          const onEnter = (e: React.MouseEvent<HTMLElement>) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 206, 209, 0.15)";
          };
          const onLeave = (e: React.MouseEvent<HTMLElement>) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
          };
          const content = (
            <>
              <span style={{ fontSize: "48px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))" }}>{icon}</span>
              <span style={{ fontSize: "16px", fontWeight: "800", color: "#333", letterSpacing: "0.3px" }}>
                {tAny[labelKey ?? id] ?? id}
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
