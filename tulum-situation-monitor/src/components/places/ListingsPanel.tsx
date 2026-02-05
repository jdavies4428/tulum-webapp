"use client";

import { useState } from "react";
import { beachClubs, restaurants, culturalPlaces } from "@/data/places";
import type { BeachClub, Restaurant, CulturalPlace } from "@/types/place";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

// Match original: iOS → Apple Maps, else → Google Maps
function openNavigation(lat: number, lng: number, name: string) {
  if (typeof window === "undefined") return;
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const encodedName = encodeURIComponent(name);
  if (isIOS) {
    window.open(`https://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`, "_blank");
  } else {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  }
}

interface ListingsPanelProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "clubs" | "restaurants" | "cultural";

export function ListingsPanel({ lang, isOpen, onClose }: ListingsPanelProps) {
  const [tab, setTab] = useState<Tab>("clubs");
  const t = translations[lang] as Record<string, string>;
  const navigateLabel = t.navigate ?? "Go";

  if (!isOpen) return null;

  const items =
    tab === "clubs"
      ? beachClubs
      : tab === "restaurants"
        ? restaurants
        : culturalPlaces;
  const desc = (item: BeachClub | Restaurant | CulturalPlace) =>
    lang === "es" ? item.descEs ?? item.desc : lang === "fr" ? ("descFr" in item ? (item as { descFr?: string }).descFr : item.desc) : item.desc;
  const typeLabel =
    tab === "clubs"
      ? "Club"
      : tab === "restaurants"
        ? (lang === "es" ? "Restaurante" : lang === "fr" ? "Restaurant" : "Restaurant")
        : lang === "es" ? "Cultural" : lang === "fr" ? "Culturel" : "Cultural";

  return (
    <>
      <div
        className="fixed inset-0 z-[1900] bg-black/60"
        onClick={onClose}
        role="presentation"
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-[2000] flex max-h-[70vh] flex-col rounded-t-xl border-t border-border bg-bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-bold">📍 {t.places ?? "Places"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-text-muted hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="flex gap-2 border-b border-border px-4 pb-3">
          <button
            type="button"
            onClick={() => setTab("clubs")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              tab === "clubs"
                ? "bg-accent-yellow/20 text-accent-yellow border border-accent-yellow"
                : "border border-border bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            🏖️ {t.beachClubs ?? "Beach Clubs"} ({beachClubs.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("restaurants")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              tab === "restaurants"
                ? "bg-accent-purple/20 text-accent-purple border border-accent-purple"
                : "border border-border bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            🍽️ {t.restaurants ?? "Restaurants"} ({restaurants.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("cultural")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              tab === "cultural"
                ? "bg-accent-grey/20 text-accent-grey border border-accent-grey"
                : "border border-border bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            🎭 {t.cultural ?? "Cultural"} ({culturalPlaces.length})
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.name}
                className="rounded-lg border border-border bg-white/5 p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold text-white">
                    {item.name}
                    {"hasWebcam" in item && item.hasWebcam ? (
                      <span className="ml-2 rounded bg-accent-red/20 px-1.5 py-0.5 text-[10px] text-accent-red">
                        📹 LIVE
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[10px] text-text-muted">{typeLabel}</span>
                </div>
                <p className="mb-2 text-[11px] leading-snug text-text-muted">
                  {desc(item)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`tel:${item.whatsapp.replace(/\D/g, "")}`}
                    className="rounded border border-blue-500/50 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-400 hover:bg-blue-500/20"
                  >
                    📞 Call
                  </a>
                  <a
                    href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-green-500/50 bg-green-500/10 px-2 py-1 text-[10px] font-semibold text-green-400 hover:bg-green-500/20"
                  >
                    💬 Chat
                  </a>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-accent-cyan/50 bg-accent-cyan/10 px-2 py-1 text-[10px] font-semibold text-accent-cyan hover:bg-accent-cyan/20"
                  >
                    🌐 {t.website ?? "Web"}
                  </a>
                  <button
                    type="button"
                    onClick={() => openNavigation(item.lat, item.lng, item.name)}
                    className="rounded border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-400 hover:bg-amber-500/20"
                  >
                    🧭 {navigateLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
