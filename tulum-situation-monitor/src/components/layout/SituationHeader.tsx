"use client";

import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

export interface SharePayload {
  temp: string;
  condition: string;
}

interface SituationHeaderProps {
  lang: Lang;
  onShare?: (payload: SharePayload) => void;
  sharePayload?: SharePayload | null;
  onOpenPlaces?: () => void;
  onTogglePanels?: () => void;
  panelsVisible?: boolean;
}

export function SituationHeader({
  lang,
  onShare,
  sharePayload,
  onOpenPlaces,
  onTogglePanels,
  panelsVisible = true,
}: SituationHeaderProps) {
  const t = translations[lang];

  const handleShare = () => {
    if (!onShare && !sharePayload) return;
    const temp = sharePayload?.temp ?? "";
    const condition = sharePayload?.condition ?? "";
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
  };

  return (
    <header className="absolute left-2.5 top-2.5 z-[1000] flex max-w-[calc(100%-310px)] items-center gap-4 rounded-lg border border-border bg-bg-panel px-4 py-3 shadow-lg backdrop-blur-md">
      <div>
        <h1 className="mb-0.5 flex items-center gap-2 text-base font-semibold text-accent-cyan">
          🌴 {t.title}
        </h1>
        <p className="text-[10px] uppercase tracking-wider text-text-muted">{t.subtitle}</p>
      </div>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-md border border-border bg-bg-panel px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          📤 Share
        </button>
        <button
          type="button"
          onClick={onOpenPlaces}
          className="flex items-center gap-1.5 rounded-md border border-border bg-bg-panel px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          📍 {t.places}
        </button>
        {onTogglePanels && (
          <button
            type="button"
            onClick={onTogglePanels}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-[11px] font-semibold transition-colors ${
              panelsVisible
                ? "border border-accent-red bg-accent-red/15 text-white hover:bg-accent-red/25"
                : "border border-accent-cyan bg-accent-cyan text-black hover:opacity-90"
            }`}
          >
            {panelsVisible ? "✕ Hide" : "🌴 Info"}
          </button>
        )}
      </div>
    </header>
  );
}
