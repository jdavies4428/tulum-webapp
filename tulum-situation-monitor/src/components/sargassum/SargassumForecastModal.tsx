"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const FORECAST_BASE =
  "https://sargassummonitoring.com/wp-content/uploads";
const FALLBACK_FORECAST = `${FORECAST_BASE}/2026/01/mexico-sargazo-monitoreo-sargassum-monitoring-pronosticos-29-01-2026.gif`;

interface SargassumForecastModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

function getForecastUrlForDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${FORECAST_BASE}/${yyyy}/${mm}/mexico-sargazo-monitoreo-sargassum-monitoring-pronosticos-${dd}-${mm}-${yyyy}.gif`;
}

export function SargassumForecastModal({ lang, isOpen, onClose }: SargassumForecastModalProps) {
  const t = translations[lang] as Record<string, string>;
  const title = t.sargassumForecast ?? "Sargassum 7-Day Forecast";
  const [imgSrc, setImgSrc] = useState(FALLBACK_FORECAST);

  useEffect(() => {
    if (!isOpen) return;
    const today = new Date();
    const urls: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      urls.push(getForecastUrlForDate(d));
    }
    let loaded = false;
    function tryLoad(index: number) {
      if (index >= urls.length || loaded) return;
      const img = new Image();
      img.onload = () => {
        if (!loaded) {
          loaded = true;
          setImgSrc(urls[index]);
        }
      };
      img.onerror = () => tryLoad(index + 1);
      img.src = urls[index];
    }
    tryLoad(0);
    const timeoutId = setTimeout(() => {
      if (!loaded) setImgSrc(FALLBACK_FORECAST);
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg border border-border bg-bg-panel shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-semibold">🌿 {title}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-text-muted hover:text-white"
          >
            ×
          </button>
        </div>
        <p className="px-4 py-2 text-[11px] text-text-muted">
          {t.forecastDesc ??
            "Predicted sargassum movement over 7 days based on ocean currents (HYCOM) and wind forecasts (NCEP). Red dots indicate satellite-detected sargassum patches."}
        </p>
        <div className="flex gap-3 px-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent-red" />
            <span className="text-[10px]">{t.sargassumPatch ?? "Sargassum Patch"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent-cyan" />
            <span className="text-[10px]">{t.trajectory ?? "Predicted Path"}</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-white p-3">
          <img
            src={imgSrc}
            alt="Sargassum Forecast"
            className="mx-auto max-h-[400px] w-full object-contain"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-[10px] text-text-muted">
          <span>{t.dataFrom ?? "Data: Mexican Government / SEMA Q. Roo"}</span>
          <a
            href="https://sargassummonitoring.com/en/forecast-sargassum-mexico-riviera-maya/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline"
          >
            {t.viewFullForecast ?? "Full Forecast →"}
          </a>
        </div>
      </div>
    </div>
  );
}
