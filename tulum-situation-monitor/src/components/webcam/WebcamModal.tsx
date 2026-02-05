"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const WEBCAMS = {
  tulum: {
    url: "https://g3.ipcamlive.com/player/player.php?alias=08a1898ad840",
    locationEn: "Tulum Beach Hotel Zone",
    locationEs: "Zona Hotelera Tulum",
    locationFr: "Zone Hôtelière de Tulum",
  },
  "akumal-south": {
    url: "https://g1.ipcamlive.com/player/player.php?alias=akumalsouth",
    locationEn: "Akumal Bay",
    locationEs: "Bahía de Akumal",
    locationFr: "Baie d'Akumal",
  },
} as const;

type WebcamId = keyof typeof WEBCAMS;

interface WebcamModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

export function WebcamModal({ lang, isOpen, onClose }: WebcamModalProps) {
  const [activeCam, setActiveCam] = useState<WebcamId>("tulum");
  const t = translations[lang] as Record<string, string>;
  const beachCamsLabel = t.beachCams ?? "Beach Cams";

  const cam = WEBCAMS[activeCam];
  const location =
    lang === "es" ? cam.locationEs : lang === "fr" ? cam.locationFr : cam.locationEn;

  useEffect(() => {
    if (!isOpen) return;
    setActiveCam("tulum");
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 p-4"
        onClick={onClose}
        role="presentation"
      />
      <div
        className="fixed left-1/2 top-1/2 z-[2001] w-full max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-white/5 px-4 py-3">
          <span className="flex items-center gap-2 font-semibold">
            📹 {beachCamsLabel}
            <span className="rounded bg-accent-red px-2 py-0.5 text-[9px] font-bold text-white animate-pulse">
              LIVE
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-2xl leading-none text-text-muted hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="flex gap-2 border-b border-border bg-black/30 p-2">
          <button
            type="button"
            onClick={() => setActiveCam("tulum")}
            className={`flex-1 rounded-md border py-2 text-sm font-semibold transition-colors ${
              activeCam === "tulum"
                ? "border-accent-cyan bg-accent-cyan text-black"
                : "border-border bg-white/10 text-text-muted hover:bg-white/15"
            }`}
          >
            🏖️ Tulum
          </button>
          <button
            type="button"
            onClick={() => setActiveCam("akumal-south")}
            className={`flex-1 rounded-md border py-2 text-sm font-semibold transition-colors ${
              activeCam === "akumal-south"
                ? "border-accent-cyan bg-accent-cyan text-black"
                : "border-border bg-white/10 text-text-muted hover:bg-white/15"
            }`}
          >
            🐢 Akumal
          </button>
        </div>
        <div className="bg-black">
          <iframe
            src={cam.url}
            title={location}
            className="h-[500px] w-full border-0"
            allowFullScreen
          />
        </div>
        <div className="flex justify-between border-t border-border px-4 py-2 text-[11px] text-text-muted">
          <span>{location}</span>
        </div>
      </div>
    </>
  );
}
