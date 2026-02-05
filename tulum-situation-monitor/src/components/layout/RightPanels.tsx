"use client";

import { useState } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { WeatherPanel } from "@/components/weather/WeatherPanel";
import { AlertsPanel } from "@/components/weather/AlertsPanel";
import { TideSection } from "@/components/weather/TideSection";
import { WaterTemp } from "@/components/weather/WaterTemp";
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
    <aside className="absolute right-2.5 top-2.5 z-[1000] flex w-[280px] max-h-[calc(100vh-70px)] flex-col gap-2.5 overflow-y-auto pb-14">
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
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => onLanguageChange?.("en")}
              className={`rounded-md border py-2 text-xs transition-colors ${
                lang === "en" ? "border-accent-cyan bg-accent-cyan/20 text-white shadow-[0_0_8px_rgba(0,212,255,0.3)]" : "border-border bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              🇺🇸
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange?.("es")}
              className={`rounded-md border py-2 text-xs transition-colors ${
                lang === "es" ? "border-accent-cyan bg-accent-cyan/20 text-white shadow-[0_0_8px_rgba(0,212,255,0.3)]" : "border-border bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              🇲🇽
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange?.("fr")}
              className={`rounded-md border py-2 text-xs transition-colors ${
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
              className="rounded-md border border-accent-green bg-accent-green/10 px-2 py-2.5 text-left text-[11px] font-medium text-accent-green hover:bg-accent-green/20"
            >
              🛰️ {currentSatelliteLabel}
            </button>
            <button
              type="button"
              onClick={() => setSargassumForecastOpen(true)}
              className="rounded-md border border-accent-green bg-accent-green/10 px-2 py-2.5 text-left text-[11px] font-medium text-accent-green hover:bg-accent-green/20"
            >
              🗺️ {forecast7Label}
            </button>
            <button
              type="button"
              onClick={() => setWebcamOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-accent-red/50 bg-accent-red/10 px-2 py-2.5 text-left text-[11px] font-medium text-accent-red hover:bg-accent-red/20"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-red" />
              {beachCamsLabel}
            </button>
            <button
              type="button"
              onClick={onOpenPlaces}
              className="flex items-center gap-1.5 rounded-md border border-border bg-bg-panel px-2 py-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              📍 {t.places}
            </button>
          </div>
          <AlertsPanel lang={lang} alerts={alerts} />
          <WeatherPanel
            lang={lang}
            data={weatherData}
            loading={weatherLoading}
            error={weatherError}
            onRefresh={onWeatherRefresh}
          />
          <TideSection lang={lang} tide={tide} />
          <WaterTemp lang={lang} tempC={waterTemp} />
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
