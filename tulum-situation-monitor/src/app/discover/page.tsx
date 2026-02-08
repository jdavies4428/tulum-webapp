"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";

const DISCOVER_ITEMS: { id: string; icon: string; labelKey?: string }[] = [
  { id: "transportation", icon: "🚗" },
  { id: "foodDelivery", icon: "🛵" },
  { id: "itinerary", icon: "📋", labelKey: "aiItinerary" },
  { id: "translation", icon: "🌐" },
  { id: "shopLocal", icon: "🛍️", labelKey: "shopLocal" },
  { id: "healing", icon: "🌿", labelKey: "healing" },
  { id: "excursions", icon: "⛵", labelKey: "excursions" },
  { id: "marketplace", icon: "🏪", labelKey: "marketplace" },
  { id: "yogaClasses", icon: "🧘", labelKey: "yogaClasses" },
  { id: "communityBoard", icon: "📌", labelKey: "communityBoard" },
];

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const auth = useAuthOptional();
  const t = translations[lang];
  const tAny = t as Record<string, string>;

  const CARD_GRADIENTS: Record<string, string> = {
    transportation: "linear-gradient(135deg, #B8E6F0 0%, #A0D8E8 100%)",
    foodDelivery: "linear-gradient(135deg, #FFD4E5 0%, #FFC0D9 100%)",
    itinerary: "linear-gradient(135deg, #D4E4BC 0%, #C2D8A8 100%)",
    translation: "linear-gradient(135deg, #E8D4F1 0%, #DCC5E8 100%)",
    shopLocal: "linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)",
    healing: "linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)",
    excursions: "linear-gradient(135deg, #B3E5FC 0%, #81D4FA 100%)",
    marketplace: "linear-gradient(135deg, #E1BEE7 0%, #CE93D8 100%)",
    yogaClasses: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
    communityBoard: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
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
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "24px",
          paddingBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
        </div>
        <div>
          {auth?.isAuthenticated && auth.user ? (
            <SignedInMenu user={auth.user} lang={lang} />
          ) : (
            <SignInButton lang={lang} />
          )}
        </div>
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
                      : id === "shopLocal"
                        ? `/discover/shop-local?lang=${lang}`
                        : id === "healing"
                          ? `/discover/healing?lang=${lang}`
                          : id === "excursions"
                            ? `/discover/excursions?lang=${lang}`
                            : id === "marketplace"
                              ? `/discover/marketplace?lang=${lang}`
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
