"use client";

import { formatTempFull } from "@/lib/weather";
import type { Lang } from "@/lib/weather";
import { translations } from "@/lib/i18n";

interface WaterTempProps {
  lang: Lang;
  tempC: number | null;
}

export function WaterTemp({ lang, tempC }: WaterTempProps) {
  const t = translations[lang];
  const display = tempC != null ? formatTempFull(tempC, lang) : "~27°C";

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-panel p-3 shadow-lg backdrop-blur-md">
      <span className="text-2xl">🏊</span>
      <div>
        <p className="text-lg font-semibold">{display}</p>
        <p className="text-[10px] uppercase text-text-muted">{t.waterTemp}</p>
      </div>
    </div>
  );
}
