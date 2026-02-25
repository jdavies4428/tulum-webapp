"use client";

import { TULUM_LAT, TULUM_LNG } from "@/data/constants";
import { translations } from "@/lib/i18n";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import type { Lang } from "@/lib/weather";
import { spacing, radius } from "@/lib/design-tokens";

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
        borderTop: "1px solid #EEEEEE",
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        padding: `${spacing.sm}px ${spacing.md}px`,
        fontSize: "10px",
        boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* Left: Status Indicators */}
      <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
        {/* Online Status */}
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          <div
            className="quick-action-sos-pulse"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#10B981",
              boxShadow: "0 0 6px rgba(16, 185, 129, 0.5)",
            }}
          />
          <span
            style={{
              textTransform: "uppercase",
              color: "#717171",
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
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: userLocation ? "#00CED1" : "#DDDDDD",
              boxShadow: userLocation ? "0 0 8px rgba(0, 206, 209, 0.5)" : "none",
            }}
          />
          <span
            style={{
              textTransform: "uppercase",
              color: userLocation ? "#00CED1" : "#AAAAAA",
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
          color: "#717171",
          fontSize: "10px",
          fontWeight: 500,
        }}
      >
        {coords}
      </span>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
        {lastUpdated && (
          <span style={{ color: "#AAAAAA", fontSize: "9px" }}>{lastUpdated}</span>
        )}
        <button
          type="button"
          onClick={onReset}
          style={{
            borderRadius: radius.sm,
            border: "1px solid #EEEEEE",
            background: "#F7F7F7",
            padding: `${spacing.xs}px ${spacing.sm}px`,
            fontWeight: 600,
            color: "#00CED1",
            fontSize: "10px",
            cursor: "pointer",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: spacing.xs,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0, 206, 209, 0.08)";
            e.currentTarget.style.borderColor = "rgba(0, 206, 209, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#F7F7F7";
            e.currentTarget.style.borderColor = "#EEEEEE";
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
