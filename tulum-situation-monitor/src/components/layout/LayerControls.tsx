"use client";

import { useState } from "react";
import type { MapLayersState } from "@/components/map/MapContainer";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface LayerControlsProps {
  lang: Lang;
  layers: MapLayersState;
  onLayersChange: (layers: MapLayersState) => void;
}

export function LayerControls({ lang, layers, onLayersChange }: LayerControlsProps) {
  const [collapsed, setCollapsed] = useState(true);
  const t = translations[lang];

  const toggle = (key: keyof MapLayersState, value?: boolean) => {
    const next = { ...layers };
    if (key === "carto" || key === "satellite") {
      next.carto = key === "carto";
      next.satellite = key === "satellite";
    } else {
      next[key] = value ?? !next[key];
    }
    onLayersChange(next);
  };

  return (
    <div
      className={`absolute left-2.5 top-20 z-[1000] min-w-[160px] rounded-lg border p-3 transition-all ${
        collapsed
          ? "border-transparent bg-transparent shadow-none backdrop-blur-none"
          : "border-border bg-bg-panel shadow-lg backdrop-blur-md"
      }`}
    >
      <button
        type="button"
        className={`flex w-full items-center justify-between pb-2.5 text-[10px] font-medium uppercase tracking-wider ${collapsed ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" : "text-text-muted"}`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span>{t.mapLayers}</span>
        <span className={`transition-transform ${collapsed ? "-rotate-90" : ""} ${collapsed ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" : ""}`}>▶</span>
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-2">
          <LayerRow
            id="carto"
            label={t.darkBaseMap}
            checked={layers.carto}
            onToggle={() => toggle("carto", true)}
          />
          <LayerRow
            id="satellite"
            label={t.satellite}
            checked={layers.satellite}
            onToggle={() => toggle("satellite", true)}
          />
          <LayerRow
            id="radar"
            label={t.liveRadar}
            checked={layers.radar}
            onToggle={() => toggle("radar")}
            dotClass="bg-accent-cyan"
          />
          <LayerRow
            id="clubs"
            label={t.beachClubs}
            checked={layers.clubs}
            onToggle={() => toggle("clubs")}
            dotClass="bg-accent-yellow"
          />
          <LayerRow
            id="restaurants"
            label={t.restaurants}
            checked={layers.restaurants}
            onToggle={() => toggle("restaurants")}
            dotClass="bg-accent-purple"
          />
          <LayerRow
            id="cultural"
            label={t.cultural}
            checked={layers.cultural}
            onToggle={() => toggle("cultural")}
            dotClass="bg-accent-grey"
          />
        </div>
      )}
    </div>
  );
}

function LayerRow({
  id,
  label,
  checked,
  onToggle,
  dotClass = "bg-accent-cyan",
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
  dotClass?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors hover:bg-white/5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-3.5 w-3.5 accent-accent-cyan"
      />
      <span className="flex-1 text-xs">{label}</span>
      <div
        className={`h-1.5 w-1.5 rounded-full ${checked ? dotClass : "bg-border"} ${checked ? "shadow-[0_0_6px_currentColor]" : ""}`}
        style={checked ? { color: "var(--accent-cyan)" } : undefined}
      />
    </label>
  );
}
