"use client";

import type { TideState } from "@/hooks/useTides";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface TideSectionProps {
  lang: Lang;
  tide: TideState;
}

export function TideSection({ lang, tide }: TideSectionProps) {
  const t = translations[lang];
  const locale = lang === "es" ? "es-MX" : "en-US";
  const formatTime = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <div className="rounded-lg border border-border bg-bg-panel overflow-hidden shadow-lg backdrop-blur-md">
      <div className="grid grid-cols-2 gap-2 border-b border-border p-3">
        <div>
          <p className="text-[10px] text-text-muted">🌊 {t.highTide}</p>
          <p className="text-sm font-medium">{formatTime(tide.nextHighTime)}</p>
          <p className="text-[10px] text-text-muted">{tide.highHeight}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">🌊 {t.lowTide}</p>
          <p className="text-sm font-medium">{formatTime(tide.nextLowTime)}</p>
          <p className="text-[10px] text-text-muted">{tide.lowHeight}</p>
        </div>
      </div>
      <p className="px-3 py-2 text-[10px] text-text-muted">
        {tide.isRising ? (
          <span className="text-accent-green">↑ {t.tideRising}</span>
        ) : (
          <span className="text-accent-yellow">↓ {t.tideFalling}</span>
        )}{" "}
        • {tide.isRising ? t.nextHigh : t.nextLow}:{" "}
        {formatTime(tide.isRising ? tide.nextHighTime : tide.nextLowTime)}
      </p>
    </div>
  );
}
