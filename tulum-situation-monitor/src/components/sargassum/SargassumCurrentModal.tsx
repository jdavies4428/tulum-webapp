"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const SATELLITE_BASE = "https://sargassummonitoring.com/wp-content/uploads";
const FALLBACK_SRC = "/data/sargassum/latest_1day.png";

function getCmemsUrlForDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${SATELLITE_BASE}/${yyyy}/${mm}/mexico-sargazo-monitoreo-sargassum-monitoring-satelite-${dd}-${mm}-${yyyy}.png`;
}

interface SargassumCurrentModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

export function SargassumCurrentModal({ lang, isOpen, onClose }: SargassumCurrentModalProps) {
  const t = translations[lang] as Record<string, string>;
  const title = t.currentSatellite ?? "Current Sargassum Satellite";
  const [imgSrc, setImgSrc] = useState(FALLBACK_SRC);

  useEffect(() => {
    if (!isOpen) return;
    const today = new Date();
    const urls: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      urls.push(getCmemsUrlForDate(d));
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
      if (!loaded) setImgSrc(FALLBACK_SRC);
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
          <span className="font-semibold">🛰️ {title}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-text-muted hover:text-white"
          >
            ×
          </button>
        </div>
        <p className="px-4 py-2 text-[11px] text-text-muted">
          Latest CMEMS satellite image showing current sargassum concentration around Tulum/Yucatán.
          Updated daily.
        </p>
        <div className="flex-1 overflow-auto bg-[#111] p-3 text-center">
          <img
            src={imgSrc}
            alt="Current satellite imagery of sargassum coverage near Tulum"
            className="mx-auto max-h-[450px] w-full max-w-full rounded object-contain"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-[10px] text-text-muted">
          <span>🛰️ CMEMS Copernicus Sentinel-3 OLCI</span>
          <a
            href="https://sargassummonitoring.com/en/satellite-sargassum-mexico/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-cyan hover:underline"
          >
            View Full Data →
          </a>
        </div>
      </div>
    </div>
  );
}
