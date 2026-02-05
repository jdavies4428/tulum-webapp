"use client";

import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface MapLegendProps {
  lang: Lang;
}

export function MapLegend({ lang }: MapLegendProps) {
  const t = translations[lang] as Record<string, string>;
  const yourLocation = t.yourLocation ?? "Your Location";
  const targetArea = t.targetArea ?? "Tulum";
  const mapLegend = t.mapLegend ?? "Legend";

  return (
    <div
      className="legend"
      style={{
        position: "absolute",
        bottom: "52px",
        left: "10px",
        zIndex: 1200,
        visibility: "visible",
        opacity: 1,
        background: "var(--bg-panel)",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "10px 12px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <div className="legend-title">{mapLegend}</div>
      <div className="legend-item">
        <div className="legend-dot location" />
        <span>{yourLocation}</span>
      </div>
      <div className="legend-item">
        <div className="legend-dot target" />
        <span>{targetArea}</span>
      </div>
      <div className="legend-item">
        <div className="legend-dot clubs" />
        <span>{t.beachClubs ?? "Beach Clubs"}</span>
      </div>
      <div className="legend-item">
        <div className="legend-dot restaurants" />
        <span>{t.restaurants ?? "Restaurants"}</span>
      </div>
      <div className="legend-item">
        <div className="legend-dot cultural" />
        <span>{t.cultural ?? "Cultural"}</span>
      </div>
    </div>
  );
}
