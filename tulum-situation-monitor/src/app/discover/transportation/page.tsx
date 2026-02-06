"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";

const ADO_URL = "https://www.ado.com.mx";

const INDRIVE = {
  scheme: "indrive://",
  ios: "https://apps.apple.com/app/indrive-taxi-rides-platform/id780125801",
  android: "https://play.google.com/store/apps/details?id=sinet.startup.inDriver",
};

const EIBY = {
  scheme: "eiby://",
  ios: "https://apps.apple.com/us/app/eiby-taxi-cliente/id1254888887",
  android: "https://play.google.com/store/apps/details?id=mx.eiby.eibyusuario",
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

const linkStyle = {
  display: "flex" as const,
  alignItems: "center" as const,
  gap: "16px",
  padding: "16px 20px",
  background: "var(--card-bg)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "16px",
  color: "var(--text-primary)",
  textDecoration: "none" as const,
  fontWeight: 600 as const,
  fontSize: "16px",
  transition: "background 0.2s, border-color 0.2s",
};

const buttonStyle = {
  ...linkStyle,
  width: "100%" as const,
  cursor: "pointer" as const,
  fontFamily: "inherit",
};

export default function TransportationPage() {
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
          🚗 {tAny.transportation ?? "Transportation"}
        </h1>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <a
          href={ADO_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--card-hover)";
            e.currentTarget.style.borderColor = "var(--border-emphasis)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <span style={{ fontSize: "28px" }}>🚌</span>
          <span>ADO</span>
        </a>

        <button
          type="button"
          style={buttonStyle}
          onClick={() => openAppOrStore(INDRIVE.scheme, INDRIVE.ios, INDRIVE.android)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--card-hover)";
            e.currentTarget.style.borderColor = "var(--border-emphasis)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <span style={{ fontSize: "28px" }}>🚗</span>
          <span>InDrive</span>
        </button>

        <button
          type="button"
          style={buttonStyle}
          onClick={() => openAppOrStore(EIBY.scheme, EIBY.ios, EIBY.android)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--card-hover)";
            e.currentTarget.style.borderColor = "var(--border-emphasis)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card-bg)";
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <span style={{ fontSize: "28px" }}>🚕</span>
          <span>Eiby</span>
        </button>
      </div>
    </div>
  );
}
