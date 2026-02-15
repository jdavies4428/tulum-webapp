"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import { getUsf7DayUrl } from "@/lib/sargassum-usf";
import type { Lang } from "@/lib/weather";

const FALLBACK_SRC = "/data/sargassum/latest_7day.png";

interface Sargassum7DayModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

export function Sargassum7DayModal({ lang, isOpen, onClose }: Sargassum7DayModalProps) {
  const t = translations[lang] as Record<string, string>;
  const title = t.sargassum7DayHistorical ?? "7-Day Historical Average";
  const [imgSrc, setImgSrc] = useState(FALLBACK_SRC);

  useEffect(() => {
    if (!isOpen) return;
    const today = new Date();
    const urls: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      urls.push(getUsf7DayUrl(d));
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
          <span className="font-semibold">📊 {title}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-text-muted hover:text-white"
          >
            ×
          </button>
        </div>
        <p className="px-4 py-2 text-[11px] text-text-muted">
          7-day rolling composite showing smoother sargassum trends around Tulum/Yucatán.
          Updated daily at 6 AM.
        </p>
        <div className="flex-1 overflow-auto bg-[#111] p-3 text-center scrollbar-hide">
          <img
            src={imgSrc}
            alt="7-Day Sargassum Historical"
            className="mx-auto max-h-[450px] w-full max-w-full rounded object-contain"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2 text-[10px] text-text-muted">
          <span>🛰️ NASA/USF MODIS • 7-day composite</span>
          <a
            href="https://optics.marine.usf.edu/cgi-bin/optics_data?roi=YUCATAN&comp=1"
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
