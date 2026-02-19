"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import { translations } from "@/lib/i18n";
import { WeatherSection } from "@/components/weather/WeatherSection";
import { CurrenciesPanel } from "@/components/currencies/CurrenciesPanel";
import { AlertsPanel } from "@/components/weather/AlertsPanel";
import { SargassumCurrentModal } from "@/components/sargassum/SargassumCurrentModal";
import { SargassumForecastModal } from "@/components/sargassum/SargassumForecastModal";
import { Sargassum7DayModal } from "@/components/sargassum/Sargassum7DayModal";
import { WebcamModal } from "@/components/webcam/WebcamModal";
import { TranslationModal } from "@/components/translation/TranslationModal";
import { LocalEventsModal } from "@/components/events/LocalEventsModal";
import { generateAlerts } from "@/lib/alerts";
import { spacing, radius } from "@/lib/design-tokens";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import type { Lang } from "@/lib/weather";
import type { OpenMeteoResponse } from "@/types/weather";
import type { TideState } from "@/hooks/useTides";
import { useThrottle } from "@/hooks/useThrottle";
import { useLocalEvents } from "@/hooks/useLocalEvents";
import { formatChatTimestamp } from "@/lib/chat-helpers";

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
  const [sargassum7DayOpen, setSargassum7DayOpen] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [localEventsOpen, setLocalEventsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [conciergeQuery, setConciergeQuery] = useState("");
  const { events: localEvents, loading: eventsLoading } = useLocalEvents();
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
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

      {/* Mobile backdrop overlay */}
      {isMobile && !isCollapsed && (
        <div
          onClick={onToggle}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 99,
            cursor: "pointer",
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar outer container – fully hidden when collapsed */}
      <div
        className={`sidebar ${!isCollapsed ? "glass-medium" : ""}`}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: sidebarWidth,
          maxWidth: isMobile ? "100vw" : "400px",
          height: "100vh",
          background: isCollapsed ? "transparent" : "rgba(15, 20, 25, 0.95)",
          backdropFilter: isCollapsed ? "none" : "blur(24px)",
          WebkitBackdropFilter: isCollapsed ? "none" : "blur(24px)",
          borderRight: isCollapsed ? "none" : "1px solid rgba(0, 206, 209, 0.12)",
          boxShadow: isCollapsed ? "none" : "4px 0 32px rgba(0, 0, 0, 0.5)",
          transform: isCollapsed ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.3s ease",
          zIndex: 100,
          overflow: "hidden",
          pointerEvents: isCollapsed ? "none" : "auto",
          boxSizing: "border-box",
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
            boxSizing: "border-box",
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
        {/* Header - Modern glass card with beach photo strip */}
        <Card
          variant="glass"
          hover={false}
          padding="md"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            borderRadius: `0 0 ${radius.lg} ${radius.lg}`,
            border: "none",
            borderBottom: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
          }}
        >
          {/* Beach photo background strip */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url(/images/tulum-header.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              opacity: 0.35,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(15, 20, 25, 0.15) 0%, rgba(15, 20, 25, 0.7) 100%)",
              pointerEvents: "none",
            }}
          />
          <CardContent style={{ position: "relative" }}>
            <h1
              style={{
                fontSize: isMobile ? "20px" : "22px",
                fontWeight: "700",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                display: "flex",
                alignItems: "center",
                gap: `${spacing.sm}px`,
                margin: `0 0 ${spacing.xs}px 0`,
                color: "#00CED1",
              }}
            >
              <span>{t.title}</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0, fontWeight: "500" }}>
              {t.subtitle}
            </p>

          {/* Language, Share & User buttons row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: `${spacing.sm}px`,
              marginTop: `${spacing.md}px`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
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
                    opacity: lang === l ? 1 : 0.55,
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

            {/* Spacer to push user avatar to the right */}
            <div style={{ flex: 1 }} />

            {/* User Profile Button - inline with language/share buttons */}
            <div
              style={{
                transform: isMobile ? "scale(0.8)" : "scale(1)",
                transformOrigin: "center right",
              }}
            >
              {auth?.isAuthenticated && auth.user ? (
                <SignedInMenu user={auth.user} lang={lang} />
              ) : (
                <SignInButton lang={lang} />
              )}
            </div>
          </div>
          </CardContent>
        </Card>

        {/* AI Concierge Card */}
        <div style={{ padding: `6px ${spacing.lg}px 4px` }}>
          <div
            style={{
              background: "rgba(0, 206, 209, 0.08)",
              border: "1px solid rgba(0, 206, 209, 0.2)",
              borderRadius: "16px",
              padding: "12px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>🤖</span>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "16px",
                  color: "#00CED1",
                  fontWeight: "600",
                }}
              >
                {tAny.conciergeTitle ?? "AI Concierge"}
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = conciergeQuery.trim();
                if (!q) {
                  router.push(`/concierge?lang=${lang}`);
                } else {
                  router.push(`/concierge?lang=${lang}&q=${encodeURIComponent(q)}`);
                }
                setConciergeQuery("");
              }}
              style={{ display: "flex", gap: "8px", marginTop: "8px" }}
            >
              <input
                type="text"
                value={conciergeQuery}
                onChange={(e) => setConciergeQuery(e.target.value)}
                placeholder={tAny.conciergePlaceholder ?? "Ask your Tulum concierge"}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(0, 206, 209, 0.15)",
                  background: "rgba(15, 20, 25, 0.8)",
                  color: "#E8ECEF",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "9999px",
                  background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
                  border: "none",
                  color: "#FFF",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ➤
              </button>
            </form>
          </div>
        </div>

        {/* Local Events Section */}
        {localEvents.length > 0 && (
          <div style={{ padding: `4px ${spacing.lg}px 8px` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "16px",
                fontWeight: "700",
                color: "#E8ECEF",
                margin: 0,
              }}>
                {tAny.localEvents ?? "Local Events"}
              </h2>
              <button
                type="button"
                onClick={() => setLocalEventsOpen(true)}
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "1.5px",
                  color: "#00CED1",
                  textTransform: "uppercase",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {tAny.exploreAll ?? "EXPLORE ALL"}
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <div
                ref={eventsScrollRef}
                className="hide-scrollbar"
                style={{
                  display: "flex",
                  gap: "12px",
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  scrollBehavior: "smooth",
                  paddingBottom: "4px",
                }}
              >
                {localEvents.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setLocalEventsOpen(true)}
                    onKeyDown={(e) => e.key === "Enter" && setLocalEventsOpen(true)}
                    style={{
                      flex: "0 0 260px",
                      height: "160px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      position: "relative",
                      scrollSnapAlign: "start",
                      textDecoration: "none",
                      cursor: "pointer",
                      border: "1px solid rgba(0, 206, 209, 0.12)",
                      background: event.image_url
                        ? "transparent"
                        : "linear-gradient(135deg, rgba(0, 206, 209, 0.08) 0%, rgba(20, 30, 45, 0.9) 100%)",
                    }}
                  >
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt=""
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: event.image_url
                          ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)"
                          : "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "rgba(0, 206, 209, 0.9)",
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "#FFF",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {formatChatTimestamp(new Date(event.created_at).getTime())}
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "12px",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: "700",
                          lineHeight: 1.3,
                          color: "#FFFFFF",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {event.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {localEvents.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => eventsScrollRef.current?.scrollBy({ left: -272, behavior: "smooth" })}
                    style={{
                      position: "absolute",
                      left: "-6px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(15, 20, 25, 0.85)",
                      border: "1px solid rgba(0, 206, 209, 0.3)",
                      color: "#00CED1",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => eventsScrollRef.current?.scrollBy({ left: 272, behavior: "smooth" })}
                    style={{
                      position: "absolute",
                      right: "-6px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(15, 20, 25, 0.85)",
                      border: "1px solid rgba(0, 206, 209, 0.3)",
                      color: "#00CED1",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Two-column panels: EXPLORE | SARGASSUM MONITORING */}
        <div
          style={{
            padding: `0 ${spacing.lg}px 8px`,
            borderTop: "1px solid rgba(0, 206, 209, 0.1)",
            paddingTop: "10px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            alignItems: "stretch",
          }}
        >
          {/* EXPLORE panel */}
          <div style={{ background: "rgba(20, 30, 45, 0.6)", borderRadius: "16px", padding: "10px 12px", border: "1px solid rgba(0, 206, 209, 0.08)" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "0.8px", textTransform: "uppercase" }}>
              {tAny.explore ?? "Explore"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {[
                { el: "button" as const, action: onOpenPlaces, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, label: t.places },
                { el: "link" as const, href: `/discover?lang=${lang}`, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.09 6.26L20.18 10l-6.09 2.74L12 19l-2.09-6.26L3.82 10l6.09-2.74z" /></svg>, label: tAny.discover ?? "Discover" },
                { el: "button" as const, action: onOpenMap, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>, label: tAny.map ?? "Map" },
                { el: "button" as const, action: () => setTranslationOpen(true), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>, label: tAny.translation ?? "Translate" },
              ].map((item, i) => {
                const cellStyle: React.CSSProperties = { padding: "6px 4px", border: "2px solid rgba(0, 206, 209, 0.15)", borderRadius: radius.md, fontSize: "11px", fontWeight: "600", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", minWidth: 0, height: "64px", overflow: "hidden", color: "var(--tulum-ocean)", textDecoration: "none", background: "transparent" };
                const labelEl = <span style={{ textAlign: "center", lineHeight: "1.2", textTransform: "uppercase", fontSize: "9px", letterSpacing: "0.5px" }}>{item.label}</span>;
                if (item.el === "link") return <Link key={i} href={item.href!} className="glass-heavy hover-lift interactive" style={cellStyle}>{item.icon}{labelEl}</Link>;
                return <button key={i} type="button" onClick={item.action} className="glass-heavy hover-lift interactive" style={cellStyle}>{item.icon}{labelEl}</button>;
              })}
            </div>
          </div>

          {/* SARGASSUM panel */}
          <div style={{ background: "rgba(20, 30, 45, 0.6)", borderRadius: "16px", padding: "10px 12px", border: "1px solid rgba(0, 206, 209, 0.08)" }}>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "8px", letterSpacing: "0.8px", textTransform: "uppercase" }}>
              {tAny.sargassum ?? "Sargassum"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {[
                { action: () => setWebcamOpen(true), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>, label: tAny.tulumBeachLive ?? "Beach Cams" },
                { action: () => setSargassumCurrentOpen(true), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 6.5 6.5 2 12 2" /><path d="M5 12c0-3.87 3.13-7 7-7" /><path d="M8 12a4 4 0 0 1 4-4" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>, label: tAny.sargassumCurrent ?? "Current" },
                { action: () => setSargassumForecastOpen(true), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>, label: tAny.sargassum7Day ?? "Forecast" },
                { action: () => setSargassum7DayOpen(true), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>, label: tAny.sargassum7DayHistorical ?? "Historical" },
              ].map((item, i) => (
                <button key={i} type="button" onClick={item.action} className="glass-heavy hover-lift interactive" style={{ padding: "6px 4px", border: "2px solid rgba(0, 206, 209, 0.3)", borderRadius: radius.md, fontSize: "11px", fontWeight: "600", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", minWidth: 0, height: "64px", overflow: "hidden", color: "var(--tulum-ocean)", background: "transparent" }}>
                  {item.icon}
                  <span style={{ textAlign: "center", lineHeight: "1.2", textTransform: "uppercase", fontSize: "9px", letterSpacing: "0.5px" }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div
          style={{
            flex: 1,
            padding: `10px ${spacing.lg}px ${spacing.md}px`,
            display: "flex",
            flexDirection: "column",
            gap: `${spacing.md}px`,
            borderTop: "1px solid rgba(0, 206, 209, 0.1)",
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
      <Sargassum7DayModal
        lang={lang}
        isOpen={sargassum7DayOpen}
        onClose={() => setSargassum7DayOpen(false)}
      />
      <WebcamModal lang={lang} isOpen={webcamOpen} onClose={() => setWebcamOpen(false)} />
      <TranslationModal lang={lang} isOpen={translationOpen} onClose={() => setTranslationOpen(false)} />
      <LocalEventsModal lang={lang} isOpen={localEventsOpen} onClose={() => setLocalEventsOpen(false)} />
    </>
  );
}
