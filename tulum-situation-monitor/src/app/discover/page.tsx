"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Lang } from "@/lib/weather";

type CardSize = "large" | "medium" | "small";

const DISCOVER_ITEMS: {
  id: string;
  icon: string;
  labelKey: string;
  descKey: string;
  size: CardSize;
}[] = [
  { id: "events", icon: "📅", labelKey: "localEvents", descKey: "discoverEventsDesc", size: "small" },
  { id: "transportation", icon: "🚗", labelKey: "transportation", descKey: "discoverTransportationDesc", size: "large" },
  { id: "foodDelivery", icon: "🛵", labelKey: "foodDelivery", descKey: "discoverFoodDesc", size: "medium" },
  { id: "itinerary", icon: "📋", labelKey: "aiItinerary", descKey: "discoverItineraryDesc", size: "medium" },
  { id: "translation", icon: "🌐", labelKey: "translation", descKey: "discoverTranslationDesc", size: "small" },
  { id: "shopLocal", icon: "🛍️", labelKey: "shopLocal", descKey: "discoverShopDesc", size: "small" },
  { id: "healing", icon: "🌿", labelKey: "healing", descKey: "discoverHealingDesc", size: "small" },
  { id: "excursions", icon: "⛵", labelKey: "excursions", descKey: "discoverExcursionsDesc", size: "medium" },
  { id: "marketplace", icon: "🏪", labelKey: "marketplace", descKey: "discoverMarketplaceDesc", size: "medium" },
  { id: "yogaClasses", icon: "🧘", labelKey: "yogaClasses", descKey: "discoverYogaDesc", size: "small" },
  { id: "communityBoard", icon: "📌", labelKey: "communityBoard", descKey: "discoverCommunityDesc", size: "small" },
  { id: "photoMap", icon: "🗺️", labelKey: "photoMap", descKey: "discoverPhotoMapDesc", size: "medium" },
];

const CARD_GRADIENTS: Record<string, string> = {
  transportation: "linear-gradient(135deg, rgba(0, 150, 200, 0.15) 0%, rgba(0, 206, 209, 0.06) 100%)",
  foodDelivery: "linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 142, 83, 0.06) 100%)",
  itinerary: "linear-gradient(135deg, rgba(80, 200, 120, 0.15) 0%, rgba(0, 206, 209, 0.06) 100%)",
  translation: "linear-gradient(135deg, rgba(175, 82, 222, 0.15) 0%, rgba(175, 82, 222, 0.06) 100%)",
  shopLocal: "linear-gradient(135deg, rgba(255, 214, 0, 0.15) 0%, rgba(255, 214, 0, 0.06) 100%)",
  healing: "linear-gradient(135deg, rgba(80, 200, 120, 0.12) 0%, rgba(0, 212, 106, 0.06) 100%)",
  excursions: "linear-gradient(135deg, rgba(0, 150, 200, 0.15) 0%, rgba(0, 206, 209, 0.06) 100%)",
  marketplace: "linear-gradient(135deg, rgba(175, 82, 222, 0.15) 0%, rgba(175, 82, 222, 0.06) 100%)",
  yogaClasses: "linear-gradient(135deg, rgba(80, 200, 120, 0.12) 0%, rgba(0, 212, 106, 0.06) 100%)",
  communityBoard: "linear-gradient(135deg, rgba(255, 214, 0, 0.12) 0%, rgba(255, 214, 0, 0.06) 100%)",
  photoMap: "linear-gradient(135deg, rgba(0, 206, 209, 0.15) 0%, rgba(0, 206, 209, 0.06) 100%)",
  events: "linear-gradient(135deg, rgba(80, 200, 120, 0.15) 0%, rgba(0, 206, 209, 0.06) 100%)",
};

const CARD_BG = "rgba(20, 30, 45, 0.85)";

function getHref(id: string, lang: Lang): string | undefined {
  const base = (path: string) => `${path}?lang=${lang}`;
  switch (id) {
    case "transportation": return base("/discover/transportation");
    case "foodDelivery": return base("/discover/food-delivery");
    case "itinerary": return base("/itinerary");
    case "translation": return base("/discover/translation");
    case "shopLocal": return base("/discover/shop-local");
    case "healing": return base("/discover/healing");
    case "excursions": return base("/discover/excursions");
    case "marketplace": return base("/discover/marketplace");
    case "photoMap": return base("/discover/photo-map");
    case "yogaClasses": return base("/discover/healing");
    case "events": return base("/discover/events");
    case "communityBoard": return base("/discover/community-board");
    default: return undefined;
  }
}

function DiscoverCard({
  item,
  href,
  t,
  gradient,
}: {
  item: (typeof DISCOVER_ITEMS)[0];
  href: string | undefined;
  t: Record<string, string>;
  gradient: string;
}) {
  const [hovered, setHovered] = useState(false);
  const sizeClass =
    item.size === "large"
      ? "discover-card-large"
      : item.size === "medium"
        ? "discover-card-medium"
        : "discover-card-small";

  const content = (
    <div
      className="discover-card-inner"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: item.size === "large" ? "2/1" : "1/1",
        borderRadius: "24px",
        backgroundColor: CARD_BG,
        backgroundImage: gradient,
        padding: 16,
        cursor: href ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(0, 206, 209, 0.12)",
        boxShadow: hovered
          ? "0 12px 40px rgba(0, 0, 0, 0.4)"
          : "0 4px 20px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 8,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          background: "rgba(0, 206, 209, 0.05)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />
      <div
        className="discover-card-icon"
        style={{
          fontSize: 48,
          flexShrink: 0,
          filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))",
          lineHeight: 1,
          transition: "transform 0.2s",
          transform: hovered ? "scale(1.05)" : "scale(1)",
        }}
      >
        {item.icon}
      </div>
      <div className="discover-card-text" style={{ minWidth: 0, overflow: "hidden", flex: 1 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#E8ECEF",
            margin: 0,
            textShadow: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {t[item.labelKey] ?? item.id}
        </h3>
        <p
          className="discover-card-desc"
          style={{
            fontSize: 13,
            color: "#9BA3AF",
            margin: 0,
            fontWeight: 600,
            opacity: 0.9,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {t[item.descKey] ?? ""}
        </p>
      </div>
      {href && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(0, 206, 209, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          →
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        key={item.id}
        href={href}
        className={`${sizeClass} discover-card-link`}
        style={{ textDecoration: "none", color: "inherit", minWidth: 0 }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div key={item.id} className={sizeClass} style={{ minWidth: 0 }}>
      {content}
    </div>
  );
}

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const auth = useAuthOptional();
  const t = translations[lang] as Record<string, string>;

  return (
    <div
      style={{
        height: "100dvh",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        background: "#0F1419",
        color: "var(--text-primary)",
      }}
    >
      <div
        style={{
          padding: "24px",
          paddingTop: "max(48px, calc(24px + env(safe-area-inset-top)))",
          paddingBottom: "max(140px, calc(120px + env(safe-area-inset-bottom)))",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            marginBottom: "40px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(0, 206, 209, 0.08)",
              border: "1px solid rgba(0, 206, 209, 0.15)",
              color: "#9BA3AF",
              fontSize: "20px",
              textDecoration: "none",
              flexShrink: 0,
              boxShadow: "none",
            }}
          >
            ←
          </Link>
          <div style={{ flex: 1, minWidth: 0, paddingLeft: "0" }}>
            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: "800",
                margin: "0 0 8px 0",
                background: "linear-gradient(135deg, #0099CC 0%, #00CED1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ✨ {t.discover ?? "Discover"} Tulum
            </h1>
            <p
              style={{
                fontSize: "clamp(14px, 2vw, 18px)",
                color: "#7C8490",
                margin: 0,
              }}
            >
              {t.discoverSubtitle ?? "Everything you need for an amazing Tulum experience"}
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            {auth?.isAuthenticated && auth.user ? (
              <SignedInMenu user={auth.user} lang={lang} />
            ) : (
              <SignInButton lang={lang} />
            )}
          </div>
        </header>

        <div className="discover-grid">
          {DISCOVER_ITEMS.map((item) => (
            <DiscoverCard
              key={item.id}
              item={item}
              href={getHref(item.id, lang)}
              t={t}
              gradient={CARD_GRADIENTS[item.id] ?? "var(--card-bg)"}
            />
          ))}
        </div>
      </div>

      <BottomNav lang={lang} fixed />
    </div>
  );
}
