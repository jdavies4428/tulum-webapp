"use client";

import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface MapControlsProps {
  lang: Lang;
  onRecenter: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

function MapControlButton({ icon, onClick, tooltip }: { icon: string; onClick: () => void; tooltip: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        border: "none",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        cursor: "pointer",
        fontSize: 20,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      }}
    >
      {icon}
    </button>
  );
}

export function MapControls({ lang, onRecenter, onZoomIn, onZoomOut }: MapControlsProps) {
  const t = translations[lang] as Record<string, string>;
  const resetLabel = t.resetView ?? "Recenter";

  return (
    <div
      style={{
        position: "absolute",
        right: 16,
        top: 160,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 1000,
      }}
    >
      <MapControlButton icon="🎯" onClick={onRecenter} tooltip={resetLabel} />
      <MapControlButton icon="+" onClick={onZoomIn} tooltip="Zoom In" />
      <MapControlButton icon="−" onClick={onZoomOut} tooltip="Zoom Out" />
    </div>
  );
}
