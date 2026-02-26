"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import { translations } from "@/lib/i18n";
import { proxyImageUrl } from "@/lib/image-proxy";
import { WeatherSection } from "@/components/weather/WeatherSection";
// CurrenciesPanel and AlertsPanel accessible via Quick Actions menu
import { SargassumHubModal } from "@/components/sargassum/SargassumHubModal";
import { TranslationModal } from "@/components/translation/TranslationModal";
import { generateAlerts } from "@/lib/alerts";
import { spacing, radius } from "@/lib/design-tokens";
import type { Lang } from "@/lib/weather";
import { formatTempFull, formatTemp, getWeatherDescription } from "@/lib/weather";
import type { OpenMeteoResponse } from "@/types/weather";
import type { TideState } from "@/hooks/useTides";
import { useThrottle } from "@/hooks/useThrottle";
import { useLocalEvents } from "@/hooks/useLocalEvents";
import { formatChatTimestamp } from "@/lib/chat-helpers";
import { SAMPLE_EVENTS, formatEventDate } from "@/data/sample-events";
import { OPEN_QUICK_ACTIONS_EVENT } from "@/components/quick-actions/QuickActionsFAB";
import { getThemeThumbnail } from "@/components/events/ThemedEventCard";

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
  const [sargassumHubOpen, setSargassumHubOpen] = useState(false);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [weatherDetailOpen, setWeatherDetailOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { events: localEvents, loading: eventsLoading } = useLocalEvents();
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
        className={`sidebar`}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: sidebarWidth,
          maxWidth: isMobile ? "100vw" : "400px",
          height: "100vh",
          background: isCollapsed ? "transparent" : "#FFFFFF",
          borderRight: isCollapsed || isMobile ? "none" : "1px solid #EEEEEE",
          boxShadow: isCollapsed ? "none" : (isMobile ? "none" : "2px 0 16px rgba(0, 0, 0, 0.06)"),
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
        {/* ─── MOBILE LAYOUT (Airbnb-inspired light theme) ─── */}
        {isMobile && (() => {
          const weatherDesc = weatherData?.current ? getWeatherDescription(weatherData.current.weather_code, lang) : null;
          const uvIndex = weatherData?.daily?.uv_index_max?.[0];
          const allEvents = [...SAMPLE_EVENTS, ...localEvents];
          return (
            <div style={{ background: "#FFFFFF", paddingBottom: "100px" }}>
              {/* Header with beach photo */}
              <div style={{
                position: "relative",
                overflow: "hidden",
                borderBottom: "1px solid #F0F0F0",
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url(/images/tulum-header.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center 40%",
                  opacity: 0.65,
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.82) 100%)",
                  pointerEvents: "none",
                }} />
              <div style={{
                position: "relative",
                padding: "44px 20px 36px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <h1 style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#222222",
                  margin: 0,
                }}>{t.title}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {LANG_FLAGS.map(({ lang: l, flag }) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => onLanguageChange(l)}
                      style={{
                        background: lang === l ? "rgba(0, 206, 209, 0.12)" : "transparent",
                        border: lang === l ? "1px solid rgba(0, 206, 209, 0.3)" : "1px solid transparent",
                        fontSize: "16px",
                        cursor: "pointer",
                        padding: "4px 6px",
                        borderRadius: "8px",
                        opacity: lang === l ? 1 : 0.5,
                      }}
                    >{flag}</button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const temp = sharePayload?.temp ?? "";
                      const condition = sharePayload?.condition ?? "";
                      const url = typeof window !== "undefined" ? window.location.href : "";
                      const shareText = `🌴 Tulum right now: ${temp} ${condition}\n\nReal-time beach conditions, weather & local spots:`;
                      if (typeof navigator !== "undefined" && navigator.share) {
                        navigator.share({ title: "Discover Tulum", text: shareText, url }).catch(() => {});
                      } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                        navigator.clipboard.writeText(shareText + "\n" + url).then(() => alert("Link copied! 📋")).catch(() => {});
                      }
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      fontSize: "15px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                    aria-label="Share"
                  >📤</button>
                  <div style={{ marginLeft: "4px" }}>
                    {auth?.isAuthenticated && auth.user ? (
                      <SignedInMenu user={auth.user} lang={lang} />
                    ) : (
                      <SignInButton lang={lang} />
                    )}
                  </div>
                </div>
              </div>
              </div>

              {/* Search Pill — typeable input */}
              <div style={{ padding: "12px 20px 8px" }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector("input");
                    const q = input?.value?.trim() ?? "";
                    router.push(q ? `/concierge?lang=${lang}&q=${encodeURIComponent(q)}` : `/concierge?lang=${lang}`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 20px",
                    borderRadius: "9999px",
                    border: "1px solid #DDDDDD",
                    background: "#F7F7F7",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>🌴</span>
                  <input
                    type="text"
                    placeholder={tAny.conciergePlaceholder ?? "Ask your Tulum concierge"}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      color: "#222222",
                      fontSize: "15px",
                      fontWeight: 500,
                      padding: 0,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: "14px",
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

              {/* Top Nav Tabs: Places, Sargassum, Pulse */}
              <div style={{ padding: "4px 20px 16px", display: "flex", gap: "8px" }}>
                {[
                  { label: tAny.places ?? "Places", icon: "📍", action: onOpenPlaces },
                  { label: tAny.sargassum ?? "Sargassum", icon: "🌿", action: () => setSargassumHubOpen(true) },
                  { label: "Pulse", icon: "⚡", action: () => router.push(`/pulse?lang=${lang}`) },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={item.action}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 8px",
                      borderRadius: "12px",
                      border: "1px solid #E8E8E8",
                      background: "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#222222",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Weather Hero Card — tap to expand details */}
              {weatherData?.current && weatherDesc && (
                <div style={{ padding: "0 20px 20px" }}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setWeatherDetailOpen(true)}
                    onKeyDown={(e) => e.key === "Enter" && setWeatherDetailOpen(true)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 206, 209, 0.45)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 206, 209, 0.35)";
                    }}
                    onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                    onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    style={{
                      borderRadius: "20px",
                      padding: "20px 24px",
                      background: "linear-gradient(135deg, #00CED1 0%, #009FA1 100%)",
                      color: "#FFFFFF",
                      boxShadow: "0 4px 20px rgba(0, 206, 209, 0.35)",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: "48px", fontWeight: 300, lineHeight: 1, letterSpacing: "-2px" }}>
                          {formatTempFull(weatherData.current.temperature_2m, lang)}
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: 600, marginTop: "4px", opacity: 0.95 }}>
                          {weatherDesc.desc}
                        </div>
                      </div>
                      <div style={{ fontSize: "52px", lineHeight: 1 }}>{weatherDesc.icon}</div>
                    </div>
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginTop: "16px",
                      paddingTop: "14px",
                      borderTop: "1px solid rgba(255,255,255,0.25)",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}>
                      {waterTemp != null && <span>🌡️ {formatTemp(waterTemp, lang)}</span>}
                      {(tide as { label?: string })?.label && <span>🌊 {(tide as { label?: string }).label}</span>}
                      {uvIndex != null && <span>☀️ UV {Math.round(uvIndex)}</span>}
                      <span
                        onClick={(e) => { e.stopPropagation(); setSargassumHubOpen(true); }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setSargassumHubOpen(true); } }}
                        style={{ cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "3px" }}
                      >🟢 {tAny.sargassumCurrent ?? "Clear"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Happening Now — Events Carousel */}
              {allEvents.length > 0 && (
                <div style={{ padding: "0 20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#222222", margin: 0 }}>
                      {tAny.happeningNow ?? "Happening Now"}
                    </h2>
                    <button type="button" onClick={() => router.push("/discover/events")} style={{
                      fontSize: "14px", fontWeight: 600, color: "#00CED1",
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                    }}>
                      {tAny.exploreAll ?? "See All"} →
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {allEvents.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/discover/events?event=${event.id}`)}
                        onKeyDown={(e) => e.key === "Enter" && router.push(`/discover/events?event=${event.id}`)}
                        style={{
                          display: "flex",
                          gap: "12px",
                          borderRadius: "16px",
                          overflow: "hidden",
                          background: "#FFFFFF",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          border: "1px solid #EEEEEE",
                          cursor: "pointer",
                        }}
                      >
                        {event.metadata?.card_style ? (
                          (() => {
                            const { gradient, emoji } = getThemeThumbnail(event.metadata.card_style);
                            return (
                              <div style={{
                                width: "100px", height: "88px", flexShrink: 0,
                                background: gradient,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "28px",
                              }}>{emoji}</div>
                            );
                          })()
                        ) : event.image_url ? (
                          <div style={{ width: "100px", height: "88px", flexShrink: 0, overflow: "hidden" }}>
                            <img
                              src={proxyImageUrl(event.image_url, 200) ?? event.image_url}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                        ) : (
                          <div style={{
                            width: "100px", height: "88px", flexShrink: 0,
                            background: "linear-gradient(135deg, #E0F7F7 0%, #F0FAFA 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "28px",
                          }}>🌴</div>
                        )}
                        <div style={{ padding: "12px 12px 12px 0", display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "10px", fontWeight: 700, color: "#00CED1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                            {event.id.startsWith("sample-")
                              ? formatEventDate(event.created_at)
                              : formatChatTimestamp(new Date(event.created_at).getTime())}
                          </div>
                          <p style={{
                            margin: 0, fontSize: "14px", fontWeight: 600, color: "#222222", lineHeight: 1.3,
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}>{event.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}



            </div>
          );
        })()}

        {/* ─── DESKTOP LAYOUT (matches mobile light theme) ─── */}
        {!isMobile && (() => {
          const weatherDesc = weatherData?.current ? getWeatherDescription(weatherData.current.weather_code, lang) : null;
          const uvIndex = weatherData?.daily?.uv_index_max?.[0];
          const allEvents = [...SAMPLE_EVENTS, ...localEvents];
          return (
            <div style={{ background: "#FFFFFF", paddingBottom: "24px" }}>
              {/* Header with beach photo */}
              <div style={{
                position: "relative",
                overflow: "hidden",
                borderBottom: "1px solid #F0F0F0",
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url(/images/tulum-header.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center 40%",
                  opacity: 0.65,
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.82) 100%)",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "relative",
                  padding: "44px 20px 36px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <h1 style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#222222",
                    margin: 0,
                  }}>{t.title}</h1>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {LANG_FLAGS.map(({ lang: l, flag }) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => onLanguageChange(l)}
                        style={{
                          background: lang === l ? "rgba(0, 206, 209, 0.12)" : "transparent",
                          border: lang === l ? "1px solid rgba(0, 206, 209, 0.3)" : "1px solid transparent",
                          fontSize: "16px",
                          cursor: "pointer",
                          padding: "4px 6px",
                          borderRadius: "8px",
                          opacity: lang === l ? 1 : 0.5,
                        }}
                      >{flag}</button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const temp = sharePayload?.temp ?? "";
                        const condition = sharePayload?.condition ?? "";
                        const url = typeof window !== "undefined" ? window.location.href : "";
                        const shareText = `🌴 Tulum right now: ${temp} ${condition}\n\nReal-time beach conditions, weather & local spots:`;
                        if (typeof navigator !== "undefined" && navigator.share) {
                          navigator.share({ title: "Discover Tulum", text: shareText, url }).catch(() => {});
                        } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                          navigator.clipboard.writeText(shareText + "\n" + url).then(() => alert("Link copied! 📋")).catch(() => {});
                        }
                      }}
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        fontSize: "15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                      aria-label="Share"
                    >📤</button>
                    <div style={{ marginLeft: "4px" }}>
                      {auth?.isAuthenticated && auth.user ? (
                        <SignedInMenu user={auth.user} lang={lang} />
                      ) : (
                        <SignInButton lang={lang} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Pill */}
              <div style={{ padding: "12px 20px 8px" }}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector("input");
                    const q = input?.value?.trim() ?? "";
                    router.push(q ? `/concierge?lang=${lang}&q=${encodeURIComponent(q)}` : `/concierge?lang=${lang}`);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 20px",
                    borderRadius: "9999px",
                    border: "1px solid #DDDDDD",
                    background: "#F7F7F7",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>🌴</span>
                  <input
                    type="text"
                    placeholder={tAny.conciergePlaceholder ?? "Ask your Tulum concierge"}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      color: "#222222",
                      fontSize: "14px",
                      fontWeight: 500,
                      padding: 0,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
                      border: "none",
                      color: "#FFFFFF",
                      fontSize: "14px",
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

              {/* Top Nav Tabs */}
              <div style={{ padding: "4px 20px 16px", display: "flex", gap: "8px" }}>
                {[
                  { label: tAny.places ?? "Places", icon: "📍", action: onOpenPlaces },
                  { label: tAny.sargassum ?? "Sargassum", icon: "🌿", action: () => setSargassumHubOpen(true) },
                  { label: "Pulse", icon: "⚡", action: () => router.push(`/pulse?lang=${lang}`) },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={item.action}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 8px",
                      borderRadius: "12px",
                      border: "1px solid #E8E8E8",
                      background: "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#222222",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Weather Hero Card */}
              {weatherData?.current && weatherDesc && (
                <div style={{ padding: "0 20px 20px" }}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setWeatherDetailOpen(true)}
                    onKeyDown={(e) => e.key === "Enter" && setWeatherDetailOpen(true)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 206, 209, 0.45)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 206, 209, 0.35)";
                    }}
                    style={{
                      borderRadius: "20px",
                      padding: "20px 24px",
                      background: "linear-gradient(135deg, #00CED1 0%, #009FA1 100%)",
                      color: "#FFFFFF",
                      boxShadow: "0 4px 20px rgba(0, 206, 209, 0.35)",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: "44px", fontWeight: 300, lineHeight: 1, letterSpacing: "-2px" }}>
                          {formatTempFull(weatherData.current.temperature_2m, lang)}
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: 600, marginTop: "4px", opacity: 0.95 }}>
                          {weatherDesc.desc}
                        </div>
                      </div>
                      <div style={{ fontSize: "48px", lineHeight: 1 }}>{weatherDesc.icon}</div>
                    </div>
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginTop: "16px",
                      paddingTop: "14px",
                      borderTop: "1px solid rgba(255,255,255,0.25)",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}>
                      {waterTemp != null && <span>🌡️ {formatTemp(waterTemp, lang)}</span>}
                      {(tide as { label?: string })?.label && <span>🌊 {(tide as { label?: string }).label}</span>}
                      {uvIndex != null && <span>☀️ UV {Math.round(uvIndex)}</span>}
                      <span
                        onClick={(e) => { e.stopPropagation(); setSargassumHubOpen(true); }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setSargassumHubOpen(true); } }}
                        style={{ cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "3px" }}
                      >🟢 {tAny.sargassumCurrent ?? "Clear"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly Insider Picks — vertical list */}
              {allEvents.length > 0 && (
                <div style={{ padding: "0 20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#222222", margin: 0 }}>
                      {tAny.happeningNow ?? "Weekly Insider Picks"}
                    </h2>
                    <button type="button" onClick={() => router.push("/discover/events")} style={{
                      fontSize: "13px", fontWeight: 600, color: "#00CED1",
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                    }}>
                      {tAny.exploreAll ?? "See All"} →
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {allEvents.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => router.push(`/discover/events?event=${event.id}`)}
                        onKeyDown={(e) => e.key === "Enter" && router.push(`/discover/events?event=${event.id}`)}
                        style={{
                          display: "flex",
                          gap: "12px",
                          borderRadius: "14px",
                          overflow: "hidden",
                          background: "#FFFFFF",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          border: "1px solid #EEEEEE",
                          cursor: "pointer",
                        }}
                      >
                        {event.metadata?.card_style ? (
                          (() => {
                            const { gradient, emoji } = getThemeThumbnail(event.metadata.card_style);
                            return (
                              <div style={{
                                width: "90px", height: "88px", flexShrink: 0,
                                background: gradient,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "24px",
                              }}>{emoji}</div>
                            );
                          })()
                        ) : event.image_url ? (
                          <div style={{ width: "90px", height: "88px", flexShrink: 0, overflow: "hidden" }}>
                            <img
                              src={proxyImageUrl(event.image_url, 200) ?? event.image_url}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                        ) : (
                          <div style={{
                            width: "90px", height: "88px", flexShrink: 0,
                            background: "linear-gradient(135deg, #E0F7F7 0%, #F0FAFA 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "24px",
                          }}>🌴</div>
                        )}
                        <div style={{ padding: "10px 12px 10px 0", display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "10px", fontWeight: 700, color: "#00CED1", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                            {event.id.startsWith("sample-")
                              ? formatEventDate(event.created_at)
                              : formatChatTimestamp(new Date(event.created_at).getTime())}
                          </div>
                          <p style={{
                            margin: 0, fontSize: "13px", fontWeight: 600, color: "#222222", lineHeight: 1.3,
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}>{event.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
          </div>
        </div>
      </div>

      <SargassumHubModal
        lang={lang}
        isOpen={sargassumHubOpen}
        onClose={() => setSargassumHubOpen(false)}
      />
      <TranslationModal lang={lang} isOpen={translationOpen} onClose={() => setTranslationOpen(false)} />

      {/* Mobile Weather Detail — Full Screen */}
      {weatherDetailOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10002,
            background: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 16px 14px",
            paddingTop: "max(16px, env(safe-area-inset-top))",
            borderBottom: "1px solid #EEEEEE",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
          }}>
            <button
              type="button"
              onClick={() => setWeatherDetailOpen(false)}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#F7F7F7", border: "1px solid #EEEEEE",
                color: "#717171", fontSize: "16px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ←
            </button>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#222222", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                ⛅ Weather
              </h2>
              <p style={{ fontSize: "13px", color: "#717171", margin: "2px 0 0" }}>Tulum, Quintana Roo</p>
            </div>
          </div>
          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "100px" }}>
            <WeatherSection
              lang={lang}
              data={weatherData}
              loading={weatherLoading}
              error={weatherError}
              tide={tide}
              waterTemp={waterTemp}
              onRefresh={onWeatherRefresh}
            />
          </div>
        </div>
      )}
    </>
  );
}
