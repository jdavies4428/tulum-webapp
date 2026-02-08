"use client";

import { useState } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface MapLegendProps {
  lang: Lang;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#333",
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: color,
          border: "2px solid #FFF",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      />
      <span>{label}</span>
    </div>
  );
}

export function MapLegend({ lang }: MapLegendProps) {
  const [visible, setVisible] = useState(false);
  const t = translations[lang] as Record<string, string>;
  const yourLocation = t.yourLocation ?? "Your Location";
  const targetArea = t.targetArea ?? "Tulum";
  const mapLegend = t.mapLegend ?? "Legend";

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        style={{
          position: "absolute",
          left: 16,
          bottom: 100,
          width: 48,
          height: 48,
          borderRadius: 12,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "none",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          zIndex: 1200,
          transition: "all 0.3s",
        }}
        aria-label={mapLegend}
        aria-expanded={visible}
      >
        {visible ? "✕" : "🗺️"}
      </button>

      {/* Legend panel */}
      {visible && (
        <div
          style={{
            position: "absolute",
            left: 16,
            bottom: 160,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            zIndex: 1199,
            minWidth: 160,
            animation: "slideInLeft 0.3s ease-out",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              marginBottom: 12,
              color: "#333",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {mapLegend}
          </div>
          <LegendItem color="#00CED1" label={yourLocation} />
          <LegendItem color="#FF6B6B" label={targetArea} />
          <LegendItem color="#FF9966" label={t.beachClubs ?? "Beach Clubs"} />
          <LegendItem color="#50C878" label={t.restaurants ?? "Restaurants"} />
          <LegendItem color="#8B4513" label={t.coffeeShops ?? "Coffee Shops"} />
          <LegendItem color="#9370DB" label={t.cultural ?? "Cultural"} />
          <LegendItem color="#FF1493" label={t.favorites ?? "Favorites"} />
        </div>
      )}
    </>
  );
}
