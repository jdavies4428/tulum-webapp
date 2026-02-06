"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { WeatherSection } from "@/components/weather/WeatherSection";
import { AlertsPanel } from "@/components/weather/AlertsPanel";
import { Sargassum7DayImage } from "@/components/sargassum/Sargassum7DayImage";
import { SargassumCurrentModal } from "@/components/sargassum/SargassumCurrentModal";
import { SargassumForecastModal } from "@/components/sargassum/SargassumForecastModal";
import { WebcamModal } from "@/components/webcam/WebcamModal";
import { generateAlerts } from "@/lib/alerts";
import type { Lang } from "@/lib/weather";
import type { OpenMeteoResponse } from "@/types/weather";
import type { TideState } from "@/hooks/useTides";

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
  const t = translations[lang];

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
  const alerts = weatherData
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
    : [];

  return (
    <>
      {/* Toggle Button - Always Visible */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? "Show sidebar" : "Hide sidebar"}
        style={{
          position: "fixed",
          ...(isMobile && !isCollapsed
            ? { right: "16px", left: "auto", top: "130px" }
            : { left: isCollapsed ? "16px" : "384px", top: "16px" }),
          zIndex: 10001,
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "rgba(10, 4, 4, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#FFFFFF",
          fontSize: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.background = "rgba(0, 212, 212, 0.15)";
          e.currentTarget.style.borderColor = "rgba(0, 212, 212, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.background = "rgba(10, 4, 4, 0.95)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
        }}
      >
        {isCollapsed ? "→" : "←"}
      </button>

      {/* Sidebar outer container – fully hidden when collapsed */}
      <div
        className="sidebar"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: sidebarWidth,
          height: "100vh",
          background: isCollapsed ? "transparent" : "rgba(10, 4, 4, 0.98)",
          backdropFilter: isCollapsed ? "none" : "blur(20px)",
          borderRight: isCollapsed ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
          transform: isCollapsed ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease",
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
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(10, 4, 4, 1)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: 0,
              }}
            >
              🌴 <span>{t.title}</span>
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--button-secondary)",
                borderRadius: "8px",
                padding: "4px",
              }}
            >
              {LANG_FLAGS.map(({ lang: l, flag }) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onLanguageChange(l)}
                  style={{
                    background: lang === l ? "var(--button-primary)" : "transparent",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    transition: "background 0.2s",
                  }}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            {t.subtitle}
          </p>
        </div>

        {/* Action buttons */}
        <div
          style={{
            padding: "16px 24px",
            display: "flex",
            gap: "12px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <Link
            href={`/discover?lang=${lang}`}
            style={{
              flex: 1,
              padding: "12px",
              background: "var(--button-secondary)",
              border: "1px solid var(--border-emphasis)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
              textDecoration: "none",
            }}
          >
            ✨ {tAny.discover ?? "Discover"}
          </Link>
          <button
            type="button"
            onClick={onOpenPlaces}
            style={{
              flex: 1,
              padding: "12px",
              background: "var(--button-secondary)",
              border: "1px solid var(--border-emphasis)",
              borderRadius: "12px",
              color: "var(--text-primary)",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            📍 {t.places}
          </button>
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
              style={{
                padding: "12px",
                background: "var(--button-secondary)",
                border: "none",
                borderRadius: "12px",
                color: "var(--text-primary)",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📤
            </button>
          )}
          <button
            type="button"
            title="Locate me – center map on your GPS location"
            onClick={onLocateUser}
            style={{
              padding: "12px",
              background: "var(--button-secondary)",
              border: "none",
              borderRadius: "12px",
              color: "var(--text-primary)",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🎯
          </button>
        </div>

        {/* Quick links: Satellite, Forecast, Beach Cams – single row */}
        <div
          className="sidebar-scrollable"
          style={{
            padding: "12px 24px",
            display: "flex",
            gap: "8px",
            flexWrap: "nowrap",
            overflowX: "auto",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <button
            type="button"
            onClick={() => setSargassumCurrentOpen(true)}
            style={{
              padding: "8px 10px",
              background: "var(--button-secondary)",
              border: "none",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            🛰️ {tAny.currentSatellite ?? "Satellite"}
          </button>
          <button
            type="button"
            onClick={() => setSargassumForecastOpen(true)}
            style={{
              padding: "8px 10px",
              background: "var(--button-secondary)",
              border: "none",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            🗺️ {tAny.sargassum7Day ?? "7-Day Forecast"}
          </button>
          <button
            type="button"
            onClick={() => setWebcamOpen(true)}
            style={{
              padding: "8px 10px",
              background: "var(--button-secondary)",
              border: "none",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            📹 {tAny.beachCams ?? "Beach Cams"}
          </button>
        </div>

        {/* Content sections */}
        <div style={{ flex: 1, padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
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
