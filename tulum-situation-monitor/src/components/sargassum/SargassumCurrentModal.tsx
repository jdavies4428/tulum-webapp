"use client";

import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface SargassumCurrentModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

export function SargassumCurrentModal({ lang, isOpen, onClose }: SargassumCurrentModalProps) {
  const t = translations[lang] as Record<string, string>;
  const title = t.currentSatellite ?? "Current Sargassum Satellite";
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
          Latest 1-day satellite image showing current sargassum concentration around Tulum/Yucatán.
          Updated daily at 6 AM.
        </p>
        <div className="flex-1 overflow-auto bg-[#111] p-3 text-center">
          <img
            src={`/data/sargassum/latest_1day.png?t=${Date.now()}`}
            alt="Current Sargassum Satellite"
            className="mx-auto max-h-[450px] w-full max-w-full rounded object-contain"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-[10px] text-text-muted">
          <span>🛰️ NASA/USF MODIS • 1km resolution</span>
          <a
            href="https://optics.marine.usf.edu/projects/SaWS.html"
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
