"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import { translations } from "@/lib/i18n";
import { WeatherSection } from "@/components/weather/WeatherSection";
import { CurrenciesPanel } from "@/components/currencies/CurrenciesPanel";
import { AlertsPanel } from "@/components/weather/AlertsPanel";
import { Sargassum7DayImage } from "@/components/sargassum/Sargassum7DayImage";
import { SargassumCurrentModal } from "@/components/sargassum/SargassumCurrentModal";
import { SargassumForecastModal } from "@/components/sargassum/SargassumForecastModal";
import { WebcamModal } from "@/components/webcam/WebcamModal";
import { generateAlerts } from "@/lib/alerts";
import { spacing, radius } from "@/lib/design-tokens";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import type { Lang } from "@/lib/weather";
import type { OpenMeteoResponse } from "@/types/weather";
import type { TideState } from "@/hooks/useTides";
import { useThrottle } from "@/hooks/useThrottle";

export interface SharePayload {
  temp: string;
  condition: string;
}

interface EnhancedSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  lang: Lang;
  onLanguageChange: (lang: Lang) => void;
  onOpenPlaces: () => void;
  onOpenMap?: () => void;
  onLocateUser: () => void;
  sharePayload?: SharePayload | null;
  weatherData: OpenMeteoResponse | null;
  weatherLoading: boolean;
  weatherError?: string | null;
  waterTemp: number | null;
  tide: TideState;
  onWeatherRefresh: () => void;
}

const LANG_FLAGS: { lang: Lang; flag: string }[] = [
  { lang: "en", flag: "🇺🇸" },
  { lang: "es", flag: "🇲🇽" },
  { lang: "fr", flag: "🇫🇷" },
];

export function EnhancedSidebar({
  isCollapsed,
  onToggle,
  lang,
  onLanguageChange,
  onOpenPlaces,
  onOpenMap,
  onLocateUser,
  sharePayload,
  weatherData,
  weatherLoading,
  weatherError,
  waterTemp,
  tide,
  onWeatherRefresh,
}: EnhancedSidebarProps) {
  const [sargassumCurrentOpen, setSargassumCurrentOpen] = useState(false);
  const [sargassumForecastOpen, setSargassumForecastOpen] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const auth = useAuthOptional();
  const t = translations[lang];

  // Mobile breakpoint check function
  const checkMobile = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);

  // Throttle resize handler to reduce unnecessary re-renders (250ms delay)
  const throttledCheck = useThrottle(checkMobile, 250);

  useEffect(() => {
    checkMobile(); // Check once on mount
    window.addEventListener("resize", throttledCheck);
    return () => window.removeEventListener("resize", throttledCheck);
  }, [throttledCheck]);

  const sidebarWidth = isMobile && !isCollapsed ? "100vw" : isCollapsed ? 0 : "400px";

  // Hide sidebar scrollbar
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .sidebar-scrollable::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
      }
      .sidebar-scrollable {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const tAny = t as Record<string, string>;

  // Memoize alerts to prevent expensive recalculation on every render
  const alerts = useMemo(
    () =>
      weatherData
        ? generateAlerts(weatherData, lang, {
            highWindWarning: t.highWindWarning,
            windAdvisory: t.windAdvisory,
            thunderstormWarning: t.thunderstormWarning,
            rainLikely: t.rainLikely,
            highUV: t.highUV,
            basedOnCurrent: t.basedOnCurrent,
            basedOnForecast: t.basedOnForecast,
            dailyForecast: t.dailyForecast,
          })
        : [],
    [weatherData, lang, t]
  );

  return (
    <>
      {/* Toggle Button - hidden on mobile (map is on separate page) */}
      {!isMobile && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={isCollapsed ? "Show sidebar" : "Hide sidebar"}
          className="glass hover-scale interactive"
          style={{
            position: "fixed",
            left: isCollapsed ? `${spacing.md}px` : "384px",
            top: `${spacing.md}px`,
            zIndex: 10001,
            width: "44px",
            height: "44px",
            borderRadius: radius.md,
            border: "2px solid rgba(0, 206, 209, 0.3)",
            color: "var(--tulum-ocean)",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0, 206, 209, 0.2)",
          }}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      )}

      {/* Sidebar outer container – fully hidden when collapsed */}
      <div
        className={`sidebar ${!isCollapsed ? "glass-medium" : ""}`}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: sidebarWidth,
          height: "100vh",
          background: isCollapsed ? "transparent" : "rgba(255, 255, 255, 0.85)",
          backdropFilter: isCollapsed ? "none" : "blur(24px)",
          WebkitBackdropFilter: isCollapsed ? "none" : "blur(24px)",
          borderRight: isCollapsed ? "none" : "1px solid rgba(0, 206, 209, 0.15)",
          boxShadow: isCollapsed ? "none" : "4px 0 32px rgba(0, 206, 209, 0.15)",
          transform: isCollapsed ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease",
          zIndex: 100,
          overflow: "hidden",
          pointerEvents: isCollapsed ? "none" : "auto",
        }}
      >
        {/* Scrollable inner container – overflow-y: scroll + scrollbar hiding CSS */}
        <div
          className="sidebar-scrollable"
          style={{
            width: "100%",
            height: "100%",
            overflowY: "scroll",
            overflowX: "hidden",
          }}
        >
          {/* Content wrapper – box-sizing + proper padding */}
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0",
              display: "flex",
              flexDirection: "column",
            }}
          >
        {/* Header - Modern glass card (compact) */}
        <Card
          variant="glass"
          hover={false}
          padding="md"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
            border: "none",
            borderBottom: "1px solid rgba(0, 206, 209, 0.15)",
          }}
        >
          <CardContent>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "800",
                display: "flex",
                alignItems: "center",
                gap: `${spacing.sm}px`,
                margin: `0 0 ${spacing.xs}px 0`,
                color: "var(--tulum-ocean)",
              }}
            >
              🌴 <span>{t.title}</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0, fontWeight: "500" }}>
              {t.subtitle}
            </p>

          {/* Language, Share, User circle row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: `${spacing.sm}px`,
              marginTop: `${spacing.md}px`,
            }}
          >
            <div
              className="glass-heavy hover-lift"
              style={{
                display: "flex",
                alignItems: "center",
                gap: `${spacing.xs}px`,
                borderRadius: radius.md,
                padding: `${spacing.xs}px`,
                border: "2px solid rgba(0, 206, 209, 0.3)",
              }}
            >
              {LANG_FLAGS.map(({ lang: l, flag }) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onLanguageChange(l)}
                  className={lang === l ? "interactive" : "hover-scale interactive"}
                  style={{
                    background: lang === l ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)" : "transparent",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    padding: `${spacing.xs}px ${spacing.sm}px`,
                    borderRadius: radius.sm,
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: lang === l ? "0 2px 8px rgba(0, 206, 209, 0.3)" : "none",
                  }}
                >
                  {flag}
                </button>
              ))}
            </div>
            {sharePayload && (
              <button
                type="button"
                title="Share current weather & conditions"
                onClick={() => {
                  const temp = sharePayload.temp ?? "";
                  const condition = sharePayload.condition ?? "";
                  const url = typeof window !== "undefined" ? window.location.href : "";
                  const shareText = `🌴 Tulum right now: ${temp} ${condition}\n\nReal-time beach conditions, weather & local spots:`;
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: "Discover Tulum", text: shareText, url }).catch(() => {});
                  } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                    const full = shareText + "\n" + url;
                    navigator.clipboard.writeText(full).then(() => alert("Link copied to clipboard! 📋")).catch(() => prompt("Copy this link:", full));
                  } else {
                    prompt("Copy this link:", shareText + "\n" + url);
                  }
                }}
                className="glass-heavy hover-scale interactive"
                style={{
                  border: "2px solid rgba(0, 206, 209, 0.3)",
                  fontSize: "18px",
                  cursor: "pointer",
                  padding: `${spacing.xs}px ${spacing.sm}px`,
                  borderRadius: radius.md,
                }}
              >
                📤
              </button>
            )}
            <div>
              {auth?.isAuthenticated && auth.user ? (
                <SignedInMenu user={auth.user} lang={lang} />
              ) : (
                <SignInButton lang={lang} />
              )}
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Local Events – full-width button above Discover/Places/Map */}
        <div
          style={{
            padding: `${spacing.md}px ${spacing.lg}px 0`,
          }}
        >
          <Link
            href={`/discover/events?lang=${lang}`}
            className="btn btn-primary hover-lift"
            style={{
              width: "100%",
              padding: `${spacing.md}px ${spacing.md}px`,
              borderRadius: radius.xl,
              color: "#FFF",
              fontWeight: "700",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: `${spacing.sm}px`,
              marginBottom: `${spacing.md}px`,
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(0, 206, 209, 0.35)",
            }}
          >
            📅 {tAny.localEvents ?? "Local Events"}
          </Link>
        </div>

        {/* Action buttons - Beachy gradients (Discover, Places, Map) */}
        <div
          style={{
            padding: `${spacing.md}px ${spacing.lg}px`,
            display: "flex",
            gap: `${spacing.md}px`,
          }}
        >
          <Link
            href={`/discover?lang=${lang}`}
            className="hover-lift interactive"
            style={{
              flex: 1,
              padding: `${spacing.md}px ${spacing.md}px`,
              background: "linear-gradient(135deg, #FFE4CC 0%, #FFD4B8 100%)",
              border: "none",
              borderRadius: radius.xl,
              color: "#333",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: `${spacing.sm}px`,
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(255, 153, 102, 0.2)",
            }}
          >
            ✨ {tAny.discover ?? "Discover"}
          </Link>
          <button
            type="button"
            onClick={onOpenPlaces}
            className="hover-lift interactive"
            style={{
              flex: 1,
              padding: `${spacing.md}px ${spacing.md}px`,
              background: "linear-gradient(135deg, #FFB6C1 0%, #FF9AA2 100%)",
              border: "none",
              borderRadius: radius.xl,
              color: "#333",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: `${spacing.sm}px`,
              boxShadow: "0 6px 20px rgba(255, 107, 107, 0.2)",
            }}
          >
            📍 {t.places}
          </button>
          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              className="hover-lift interactive"
              style={{
                flex: 1,
                padding: `${spacing.md}px ${spacing.md}px`,
                background: "linear-gradient(135deg, #B8E6F0 0%, #A0D8E8 100%)",
                border: "none",
                borderRadius: radius.xl,
                color: "#333",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: `${spacing.sm}px`,
                boxShadow: "0 6px 20px rgba(77, 208, 225, 0.25)",
              }}
            >
              🗺️ {tAny.map ?? "Map"}
            </button>
          )}
        </div>

        {/* Sargassum Monitoring – label + quick links */}
        <div
          style={{
            padding: `${spacing.md}px ${spacing.lg}px`,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--text-secondary)",
              marginBottom: `${spacing.sm}px`,
              letterSpacing: "0.3px",
              textTransform: "uppercase",
            }}
          >
            {tAny.sargassumMonitoring ?? "Sargassum Monitoring"}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: `${spacing.sm}px`,
            }}
          >
          <button
            type="button"
            onClick={() => setSargassumCurrentOpen(true)}
            className="glass-heavy hover-lift interactive"
            style={{
              padding: `${spacing.sm}px ${spacing.sm}px`,
              border: "2px solid rgba(0, 206, 209, 0.3)",
              borderRadius: radius.md,
              color: "var(--tulum-ocean)",
              fontSize: "10px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: `${spacing.xs}px`,
              minWidth: 0,
              minHeight: "56px",
            }}
          >
            <span style={{ flexShrink: 0, fontSize: "16px" }}>🛰️</span>
            <span style={{ textAlign: "center", lineHeight: "1.2" }}>{tAny.currentSatellite ?? "Current Satellite"}</span>
          </button>
          <button
            type="button"
            onClick={() => setSargassumForecastOpen(true)}
            className="glass-heavy hover-lift interactive"
            style={{
              padding: `${spacing.sm}px ${spacing.sm}px`,
              border: "2px solid rgba(0, 206, 209, 0.3)",
              borderRadius: radius.md,
              color: "var(--tulum-ocean)",
              fontSize: "10px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: `${spacing.xs}px`,
              minWidth: 0,
              minHeight: "56px",
            }}
          >
            <span style={{ flexShrink: 0, fontSize: "16px" }}>🗺️</span>
            <span style={{ textAlign: "center", lineHeight: "1.2" }}>{tAny.sargassum7Day ?? "7-Day Forecast"}</span>
          </button>
          <button
            type="button"
            onClick={() => setWebcamOpen(true)}
            className="glass-heavy hover-lift interactive"
            style={{
              padding: `${spacing.sm}px ${spacing.sm}px`,
              border: "2px solid rgba(0, 206, 209, 0.3)",
              borderRadius: radius.md,
              color: "var(--tulum-ocean)",
              fontSize: "10px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: `${spacing.xs}px`,
              minWidth: 0,
              minHeight: "56px",
            }}
          >
            <span style={{ flexShrink: 0, fontSize: "16px" }}>📹</span>
            <span style={{ textAlign: "center", lineHeight: "1.2" }}>{tAny.beachCams ?? "Beach Cams"}</span>
          </button>
          </div>
        </div>

        {/* Content sections */}
        <div
          style={{
            flex: 1,
            padding: `${spacing.md}px ${spacing.lg}px ${spacing.xl}px`,
            display: "flex",
            flexDirection: "column",
            gap: `${spacing.md}px`,
          }}
        >
          <WeatherSection
            lang={lang}
            data={weatherData}
            loading={weatherLoading}
            error={weatherError}
            tide={tide}
            waterTemp={waterTemp}
            onRefresh={onWeatherRefresh}
          />
          <Sargassum7DayImage lang={lang} />
          <AlertsPanel lang={lang} alerts={alerts} />
          <CurrenciesPanel lang={lang} />
        </div>
          </div>
        </div>
      </div>

      <SargassumCurrentModal
        lang={lang}
        isOpen={sargassumCurrentOpen}
        onClose={() => setSargassumCurrentOpen(false)}
      />
      <SargassumForecastModal
        lang={lang}
        isOpen={sargassumForecastOpen}
        onClose={() => setSargassumForecastOpen(false)}
      />
      <WebcamModal lang={lang} isOpen={webcamOpen} onClose={() => setWebcamOpen(false)} />
    </>
  );
}
