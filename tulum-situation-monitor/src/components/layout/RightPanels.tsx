"use client";

import { useState } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { WeatherPanel } from "@/components/weather/WeatherPanel";
import { AlertsPanel } from "@/components/weather/AlertsPanel";
import { SargassumPanel } from "@/components/sargassum/SargassumPanel";
import { SargassumCurrentModal } from "@/components/sargassum/SargassumCurrentModal";
import { SargassumForecastModal } from "@/components/sargassum/SargassumForecastModal";
import { WebcamModal } from "@/components/webcam/WebcamModal";
import { generateAlerts } from "@/lib/alerts";
import type { OpenMeteoResponse } from "@/types/weather";
import type { TideState } from "@/hooks/useTides";

interface RightPanelsProps {
  lang: Lang;
  onLanguageChange?: (lang: Lang) => void;
  panelsVisible?: boolean;
  onTogglePanels?: () => void;
  onOpenPlaces?: () => void;
  weatherData: OpenMeteoResponse | null;
  weatherLoading: boolean;
  weatherError?: string | null;
  waterTemp: number | null;
  tide: TideState;
  onWeatherRefresh: () => void;
}

export function RightPanels({
  lang,
  onLanguageChange,
  panelsVisible = true,
  onTogglePanels,
  onOpenPlaces,
  weatherData,
  weatherLoading,
  weatherError,
  waterTemp,
  tide,
  onWeatherRefresh,
}: RightPanelsProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [sargassumCurrentOpen, setSargassumCurrentOpen] = useState(false);
  const [sargassumForecastOpen, setSargassumForecastOpen] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const t = translations[lang];
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

  const tAny = t as Record<string, string>;
  const currentSatelliteLabel = tAny.currentSatellite ?? "Current Satellite";
  const forecast7Label = tAny.sargassum7Day ?? "7-Day Forecast";
  const beachCamsLabel = tAny.beachCams ?? "Beach Cams";

  return (
    <aside className="absolute right-2.5 top-2.5 z-[1000] flex w-[280px] max-h-[calc(100vh-70px)] flex-col gap-2.5 overflow-y-auto pb-20">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-bg-panel px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted shadow-lg backdrop-blur-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span>🌴 Info</span>
          <span className={`ml-auto transition-transform ${collapsed ? "-rotate-90" : ""}`}>
            ▼
          </span>
        </button>
        {onTogglePanels && (
          <button
            type="button"
            onClick={onTogglePanels}
            className="rounded-md border border-accent-red bg-accent-red/15 px-3 py-2 text-[11px] font-semibold text-white hover:bg-accent-red/25"
          >
            ✕ Hide
          </button>
        )}
      </div>
      {!collapsed && (
        <>
          <div className="quick-actions rounded-lg border border-border bg-bg-panel p-2.5 shadow-lg backdrop-blur-md">
            <div className="mb-2 flex gap-2">
              <button
                type="button"
                onClick={() => onLanguageChange?.("en")}
                className={`flex-1 rounded-md border py-2 text-xs transition-colors ${
                  lang === "en" ? "border-accent-cyan bg-accent-cyan/20 text-white shadow-[0_0_8px_rgba(0,212,255,0.3)]" : "border-border bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                🇺🇸
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange?.("es")}
                className={`flex-1 rounded-md border py-2 text-xs transition-colors ${
                  lang === "es" ? "border-accent-cyan bg-accent-cyan/20 text-white shadow-[0_0_8px_rgba(0,212,255,0.3)]" : "border-border bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                🇲🇽
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange?.("fr")}
                className={`flex-1 rounded-md border py-2 text-xs transition-colors ${
                  lang === "fr" ? "border-accent-cyan bg-accent-cyan/20 text-white shadow-[0_0_8px_rgba(0,212,255,0.3)]" : "border-border bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                🇫🇷
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSargassumCurrentOpen(true)}
                className="sargassum-btn flex min-h-[44px] items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-center text-[11px] font-medium"
              >
                🛰️ {currentSatelliteLabel}
              </button>
              <button
                type="button"
                onClick={() => setSargassumForecastOpen(true)}
                className="sargassum-btn flex min-h-[44px] items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-center text-[11px] font-medium"
              >
                🗺️ {forecast7Label}
              </button>
              <button
                type="button"
                onClick={() => setWebcamOpen(true)}
                className="webcam-btn flex min-h-[44px] items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-center text-[11px] font-medium"
              >
                <span className="live-dot h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent-red" />
                📹 {beachCamsLabel}
              </button>
              <button
                type="button"
                onClick={onOpenPlaces}
                className="places-btn flex min-h-[44px] items-center justify-center gap-1.5 rounded-md px-2 py-2.5 text-center text-[11px] font-semibold"
              >
                🌴 {t.places}
              </button>
            </div>
          </div>
          <AlertsPanel lang={lang} alerts={alerts} />
          <WeatherPanel
            lang={lang}
            data={weatherData}
            loading={weatherLoading}
            error={weatherError}
            tide={tide}
            waterTemp={waterTemp}
            onRefresh={onWeatherRefresh}
          />
          <SargassumPanel lang={lang} />
        </>
      )}
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
    </aside>
  );
}
