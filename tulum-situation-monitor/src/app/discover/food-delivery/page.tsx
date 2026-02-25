"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { BottomNav } from "@/components/layout/BottomNav";

const TOMATO_MX = {
  scheme: "tomato://",
  ios: "https://apps.apple.com/us/app/tomato-mx-food-delivery/id1453730747",
  android: "https://play.google.com/store/apps/details?id=com.tomatomxmobil",
};

const UBER_EATS = {
  scheme: "ubereats://",
  ios: "https://apps.apple.com/us/app/uber-eats-food-delivery/id1058959277",
  android: "https://play.google.com/store/apps/details?id=com.ubercab.eats",
};

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

function openAppOrStore(scheme: string, iosStore: string, androidStore: string) {
  const storeUrl = isIOS() ? iosStore : isAndroid() ? androidStore : iosStore;
  window.location.href = scheme;
  setTimeout(() => {
    window.location.href = storeUrl;
  }, 1500);
}

const buttonStyle = {
  display: "flex" as const,
  alignItems: "center" as const,
  gap: "16px",
  padding: "16px 20px",
  background: "var(--card-bg)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "16px",
  color: "var(--text-primary)",
  fontWeight: 600 as const,
  fontSize: "16px",
  width: "100%" as const,
  cursor: "pointer" as const,
  fontFamily: "inherit",
  transition: "background 0.2s, border-color 0.2s",
};

export default function FoodDeliveryPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
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
        paddingBottom: "100px",
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
          href={`/discover?lang=${lang}`}
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
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
          🛵 {tAny.foodDelivery ?? "Food Delivery"}
        </h1>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => openAppOrStore(TOMATO_MX.scheme, TOMATO_MX.ios, TOMATO_MX.android)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--card-hover)";
            e.currentTarget.style.borderColor = "var(--border-emphasis)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <span style={{ fontSize: "28px" }}>🍅</span>
          <span>Tomato.mx</span>
        </button>

        <button
          type="button"
          style={buttonStyle}
          onClick={() => openAppOrStore(UBER_EATS.scheme, UBER_EATS.ios, UBER_EATS.android)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--card-hover)";
            e.currentTarget.style.borderColor = "var(--border-emphasis)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <span style={{ fontSize: "28px" }}>🍔</span>
          <span>Uber Eats</span>
        </button>
      </div>

      <BottomNav lang={lang} />
    </div>
  );
}
