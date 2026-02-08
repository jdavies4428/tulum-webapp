"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import type { Lang } from "@/lib/weather";

type CardSize = "large" | "medium" | "small";

const DISCOVER_ITEMS: {
  id: string;
  icon: string;
  labelKey: string;
  descKey: string;
  size: CardSize;
}[] = [
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
  { id: "events", icon: "📅", labelKey: "localEvents", descKey: "discoverEventsDesc", size: "small" },
];

const CARD_GRADIENTS: Record<string, string> = {
  transportation: "linear-gradient(135deg, #B3E5FC 0%, #81D4FA 100%)",
  foodDelivery: "linear-gradient(135deg, #F8BBD0 0%, #F48FB1 100%)",
  itinerary: "linear-gradient(135deg, #DCEDC8 0%, #C5E1A5 100%)",
  translation: "linear-gradient(135deg, #E1BEE7 0%, #CE93D8 100%)",
  shopLocal: "linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)",
  healing: "linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)",
  excursions: "linear-gradient(135deg, #B3E5FC 0%, #81D4FA 100%)",
  marketplace: "linear-gradient(135deg, #E1BEE7 0%, #CE93D8 100%)",
  yogaClasses: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
  communityBoard: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
  photoMap: "linear-gradient(135deg, #B2DFDB 0%, #80CBC4 100%)",
  events: "linear-gradient(135deg, #DCEDC8 0%, #C5E1A5 100%)",
};

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: item.size === "large" ? "2/1" : "1/1",
        borderRadius: "32px",
        background: gradient,
        padding: "32px",
        cursor: href ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        border: "3px solid rgba(255, 255, 255, 0.5)",
        boxShadow: hovered
          ? "0 20px 60px rgba(0, 0, 0, 0.15)"
          : "0 8px 32px rgba(0, 0, 0, 0.1)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-20%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.2)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontSize: item.size === "large" ? "80px" : "64px",
          marginBottom: item.size === "large" ? "24px" : "16px",
          filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
          transition: "transform 0.3s",
          transform: hovered ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
        }}
      >
        {item.icon}
      </div>
      <div>
        <h3
          style={{
            fontSize: item.size === "large" ? "32px" : "24px",
            fontWeight: "800",
            color: "#1a1a1a",
            margin: "0 0 8px 0",
            textShadow: "0 2px 4px rgba(255, 255, 255, 0.5)",
          }}
        >
          {t[item.labelKey] ?? item.id}
        </h3>
        <p
          style={{
            fontSize: item.size === "large" ? "16px" : "14px",
            color: "#333",
            margin: 0,
            fontWeight: "600",
            opacity: 0.9,
          }}
        >
          {t[item.descKey] ?? ""}
        </p>
      </div>
      {href && (
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "24px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            transition: "transform 0.3s",
            transform: hovered ? "translateX(4px)" : "translateX(0)",
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
        className={sizeClass}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div key={item.id} className={sizeClass}>
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
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
        color: "var(--text-primary)",
      }}
    >
      <div
        style={{
          padding: "24px",
          paddingTop: "max(24px, env(safe-area-inset-top))",
          paddingBottom: "100px",
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
              background: "rgba(255, 255, 255, 0.9)",
              border: "2px solid rgba(0, 206, 209, 0.2)",
              color: "var(--tulum-ocean)",
              fontSize: "20px",
              textDecoration: "none",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
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
                color: "#666",
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
    </div>
  );
}
