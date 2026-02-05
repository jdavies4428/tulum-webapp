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
  const [infoCollapsed, setInfoCollapsed] = useState(false);
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
    <>
    <aside className="right-panels">
        <div
          className={`collapsible-header ${infoCollapsed ? "collapsed" : ""}`}
          onClick={() => setInfoCollapsed(!infoCollapsed)}
        >
          <h3 className="m-0 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            🌴 Info
          </h3>
          <span className="collapse-arrow ml-auto">▼</span>
        </div>
        <div
          className={`collapsible-content ${infoCollapsed ? "collapsed" : ""}`}
        >
          <div className="quick-actions">
            <div className="lang-buttons">
              <button
                type="button"
                className={`lang-btn ${lang === "en" ? "active" : ""}`}
                onClick={() => onLanguageChange?.("en")}
              >
                🇺🇸
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === "es" ? "active" : ""}`}
                onClick={() => onLanguageChange?.("es")}
              >
                🇲🇽
              </button>
              <button
                type="button"
                className={`lang-btn ${lang === "fr" ? "active" : ""}`}
                onClick={() => onLanguageChange?.("fr")}
              >
                🇫🇷
              </button>
            </div>
            <div className="action-row">
              <button
                type="button"
                className="sargassum-btn"
                onClick={() => setSargassumCurrentOpen(true)}
              >
                🛰️ <span>{currentSatelliteLabel}</span>
              </button>
              <button
                type="button"
                className="sargassum-btn"
                onClick={() => setSargassumForecastOpen(true)}
              >
                🗺️ <span>{forecast7Label}</span>
              </button>
            </div>
            <div className="action-row">
              <button
                type="button"
                className="webcam-btn"
                onClick={() => setWebcamOpen(true)}
              >
                <span className="live-dot" />
                📹 <span>{beachCamsLabel}</span>
              </button>
              <button
                type="button"
                className="places-btn"
                onClick={onOpenPlaces}
              >
                🌴 <span>{t.places}</span>
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
        </div>
      </aside>
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
