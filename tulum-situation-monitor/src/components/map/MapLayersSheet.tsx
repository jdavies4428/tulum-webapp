"use client";

import type { MapLayersState } from "@/components/map/MapContainer";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface MapLayersSheetProps {
  lang: Lang;
  layers: MapLayersState;
  onLayersChange: (layers: MapLayersState) => void;
  isOpen: boolean;
  onClose: () => void;
}

function LayerRow({
  id,
  label,
  checked,
  onToggle,
  dotClass = "bg-accent-cyan",
  dotStyle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
  dotClass?: string;
  dotStyle?: React.CSSProperties;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors active:bg-white/10">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 accent-accent-cyan"
      />
      <span className="flex-1 text-sm text-white">{label}</span>
      <div
        className={`h-2 w-2 rounded-full ${checked && !dotStyle ? dotClass : ""}`}
        style={
          checked
            ? dotStyle ?? { background: "var(--accent-cyan)", boxShadow: "0 0 6px currentColor" }
            : { background: "var(--border-color)" }
        }
      />
    </label>
  );
}

export function MapLayersSheet({
  lang,
  layers,
  onLayersChange,
  isOpen,
  onClose,
}: MapLayersSheetProps) {
  const t = translations[lang];

  const toggle = (key: keyof MapLayersState, value?: boolean) => {
    const next = { ...layers };
    if (key === "osm" || key === "carto" || key === "satellite") {
      next.osm = key === "osm";
      next.carto = key === "carto";
      next.satellite = key === "satellite";
    } else {
      next[key] = value ?? !next[key];
    }
    onLayersChange(next);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 10002,
        }}
        aria-hidden
      />
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "70vh",
          background: "rgba(10, 4, 4, 0.98)",
          backdropFilter: "blur(20px)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: "2px solid rgba(0, 206, 209, 0.2)",
          paddingTop: 12,
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
          paddingLeft: 24,
          paddingRight: 24,
          zIndex: 10003,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.3)",
            margin: "0 auto 20px",
          }}
        />
        <div className="flex items-center justify-between mb-4">
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#FFF",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {t.mapLayers}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#FFF",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <LayerRow
            id="osm"
            label="OpenStreetMap"
            checked={layers.osm}
            onToggle={() => toggle("osm", true)}
          />
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
            dotStyle={{
              background: "var(--marker-beach-club)",
              boxShadow: "0 0 6px var(--marker-beach-club)",
            }}
          />
          <LayerRow
            id="restaurants"
            label={t.restaurants}
            checked={layers.restaurants}
            onToggle={() => toggle("restaurants")}
            dotStyle={{
              background: "var(--marker-restaurant)",
              boxShadow: "0 0 6px var(--marker-restaurant)",
            }}
          />
          <LayerRow
            id="cafes"
            label={t.coffeeShops}
            checked={layers.cafes}
            onToggle={() => toggle("cafes")}
            dotStyle={{
              background: "var(--marker-cafe)",
              boxShadow: "0 0 6px var(--marker-cafe)",
            }}
          />
          <LayerRow
            id="cultural"
            label={t.cultural}
            checked={layers.cultural}
            onToggle={() => toggle("cultural")}
            dotStyle={{
              background: "var(--marker-cultural)",
              boxShadow: "0 0 6px var(--marker-cultural)",
            }}
          />
          <LayerRow
            id="favorites"
            label={t.favorites}
            checked={layers.favorites}
            onToggle={() => toggle("favorites")}
            dotStyle={{
              background: "var(--marker-favorites)",
              boxShadow: "0 0 6px var(--marker-favorites)",
            }}
          />
        </div>
      </div>
    </>
  );
}
