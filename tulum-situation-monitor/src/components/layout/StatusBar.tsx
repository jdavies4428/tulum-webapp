"use client";

import { TULUM_LAT, TULUM_LNG } from "@/data/constants";
import { translations } from "@/lib/i18n";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import type { Lang } from "@/lib/weather";

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
    <div className="absolute bottom-0 left-0 right-0 z-[1000] flex items-center justify-between gap-2 border-t border-border bg-bg-panel px-3 py-2 text-[10px] backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-accent-green shadow-[0_0_4px_var(--accent-green)]" />
          <span className="uppercase text-text-muted">{(t as Record<string, string>).online}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`h-2 w-2 rounded-full ${userLocation ? "bg-accent-cyan shadow-[0_0_6px_var(--accent-cyan)]" : "bg-text-muted"}`}
          />
          <span className="uppercase text-text-muted">{userLocation ? "GPS" : "—"}</span>
        </div>
      </div>
      <span className="font-mono text-text-muted">{coords}</span>
      <div className="flex items-center gap-2">
        {lastUpdated && (
          <span className="text-text-muted">{lastUpdated}</span>
        )}
        <button
          type="button"
          onClick={onReset}
          className="rounded border border-border bg-bg-panel px-2 py-1 font-semibold text-white hover:bg-white/10"
        >
          🎯 {(t as Record<string, string>).resetView ?? "Reset"}
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
