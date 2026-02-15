"use client";

import { TULUM_LAT, TULUM_LNG } from "@/data/constants";
import { translations } from "@/lib/i18n";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import type { Lang } from "@/lib/weather";
import { spacing, radius, shadows } from "@/lib/design-tokens";

function formatCoords(lat: number, lng: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng <= 0 ? "W" : "E";
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

interface StatusBarProps {
  lang: Lang;
  userLocation: { lat: number; lng: number; accuracy: number } | null;
  onReset: () => void;
  lastUpdated?: string;
}

export function StatusBar({ lang, userLocation, onReset, lastUpdated }: StatusBarProps) {
  const t = translations[lang];
  const tAny = t as Record<string, string>;
  const auth = useAuthOptional();
  const coords = userLocation
    ? formatCoords(userLocation.lat, userLocation.lng)
    : formatCoords(TULUM_LAT, TULUM_LNG);

  return (
    <div
      className="glass-heavy"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
        borderTop: "2px solid rgba(0, 206, 209, 0.15)",
        background: "rgba(20, 20, 30, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        padding: `${spacing.sm}px ${spacing.md}px`,
        fontSize: "10px",
        boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Left: Status Indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
        {/* Online Status */}
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          <div
            className="quick-action-sos-pulse"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#50C878",
              boxShadow: "0 0 8px rgba(80, 200, 120, 0.6)",
            }}
          />
          <span
            style={{
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.6)",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            {tAny.online}
          </span>
        </div>

        {/* GPS Status */}
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          <div
            className={userLocation ? "quick-action-sos-pulse" : ""}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: userLocation ? "#00CED1" : "rgba(255, 255, 255, 0.3)",
              boxShadow: userLocation ? "0 0 10px rgba(0, 206, 209, 0.7)" : "none",
            }}
          />
          <span
            style={{
              textTransform: "uppercase",
              color: userLocation ? "#00CED1" : "rgba(255, 255, 255, 0.4)",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            {userLocation ? "GPS" : "—"}
          </span>
        </div>
      </div>

      {/* Center: Coordinates */}
      <span
        style={{
          fontFamily: "monospace",
          color: "rgba(255, 255, 255, 0.6)",
          fontSize: "10px",
          fontWeight: 500,
        }}
      >
        {coords}
      </span>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
        {lastUpdated && (
          <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "9px" }}>{lastUpdated}</span>
        )}
        <button
          type="button"
          onClick={onReset}
          className="interactive hover-lift"
          style={{
            borderRadius: radius.sm,
            border: "1px solid rgba(0, 206, 209, 0.3)",
            background: "linear-gradient(135deg, rgba(0, 206, 209, 0.15) 0%, rgba(0, 206, 209, 0.05) 100%)",
            padding: `${spacing.xs}px ${spacing.sm}px`,
            fontWeight: 600,
            color: "#00CED1",
            fontSize: "10px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            display: "flex",
            alignItems: "center",
            gap: spacing.xs,
          }}
        >
          🎯 {tAny.resetView ?? "Reset"}
        </button>
        {auth?.isAuthenticated && auth.user ? (
          <SignedInMenu user={auth.user} lang={lang} />
        ) : (
          <SignInButton lang={lang} compact />
        )}
      </div>
    </div>
  );
}
