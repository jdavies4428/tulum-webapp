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

  const typeClass = tab === "clubs" ? "club" : tab === "restaurants" ? "restaurant" : "cultural";

  // Keep in DOM for open/close animation; hide overlay when closed
  return (
    <>
      <div
        className="fixed inset-0 z-[1999] bg-[rgba(15,13,11,0.7)] transition-all duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
        role="presentation"
      />
      <div
        className={`listings-panel fixed left-0 right-0 bottom-0 z-[2000] flex max-h-[85vh] flex-col rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.6)] ${isOpen ? "listings-panel-open" : ""}`}
        style={{
          background: "linear-gradient(180deg, #1a1512 0%, #0f0d0b 100%)",
          borderTop: "2px solid #5c4033",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle - visible on mobile, hidden on desktop */}
        <div
          className="mx-auto mb-2.5 mt-3.5 h-1.5 w-12 shrink-0 cursor-grab rounded-sm md:hidden"
          style={{ background: "linear-gradient(90deg, #8b6914, #c96442, #8b6914)" }}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b px-5 pb-4 pt-2" style={{ borderColor: "rgba(139, 105, 20, 0.3)" }}>
            <div className="mb-4 flex items-center justify-between">
              <h2
                className="flex items-center gap-2.5 text-xl font-bold"
                style={{ color: "#e8d5b7", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
              >
                📍 {t.places ?? "Places"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1 text-[28px] leading-none transition-colors hover:text-[#e8d5b7]"
                style={{ color: "#8b7355", background: "none", border: "none", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setTab("clubs")}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border-2 px-3.5 py-2.5 text-xs font-semibold transition-all"
                style={
                  tab === "clubs"
                    ? { background: "linear-gradient(135deg, #5c4033, #8b6914)", borderColor: "#c96442", color: "#fff", boxShadow: "0 4px 15px rgba(201, 100, 66, 0.3)" }
                    : { background: "rgba(92, 64, 51, 0.2)", borderColor: "#5c4033", color: "#a89078" }
                }
              >
                🏖️ {t.beachClubs ?? "Beach Clubs"}
                <span className="rounded-xl px-2.5 py-0.5 text-[11px]" style={{ background: "rgba(255,255,255,0.15)" }}>
                  {beachClubs.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTab("restaurants")}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border-2 px-3.5 py-2.5 text-xs font-semibold transition-all"
                style={
                  tab === "restaurants"
                    ? { background: "linear-gradient(135deg, #6b4423, #a87832)", borderColor: "#d4a574", color: "#fff", boxShadow: "0 4px 15px rgba(201, 100, 66, 0.3)" }
                    : { background: "rgba(92, 64, 51, 0.2)", borderColor: "#5c4033", color: "#a89078" }
                }
              >
                🍽️ {t.restaurants ?? "Restaurants"}
                <span className="rounded-xl px-2.5 py-0.5 text-[11px]" style={{ background: "rgba(255,255,255,0.15)" }}>
                  {restaurants.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTab("cultural")}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border-2 px-3.5 py-2.5 text-xs font-semibold transition-all"
                style={
                  tab === "cultural"
                    ? { background: "linear-gradient(135deg, #5c4033, #8b6914)", borderColor: "#c96442", color: "#fff", boxShadow: "0 4px 15px rgba(201, 100, 66, 0.3)" }
                    : { background: "rgba(92, 64, 51, 0.2)", borderColor: "#5c4033", color: "#a89078" }
                }
              >
                🎭 {t.cultural ?? "Cultural"}
                <span className="rounded-xl px-2.5 py-0.5 text-[11px]" style={{ background: "rgba(255,255,255,0.15)" }}>
                  {culturalPlaces.length}
                </span>
              </button>
            </div>
          </div>
          <div className="min-h-[300px] flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.name}
                  className="mb-3 rounded-[14px] border p-4 transition-all last:mb-0 hover:border-[#c96442] md:p-5"
                  style={{
                    background: "linear-gradient(135deg, rgba(92, 64, 51, 0.15), rgba(30, 25, 20, 0.8))",
                    borderColor: "rgba(139, 105, 20, 0.25)",
                  }}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className="flex items-center gap-2 text-base font-semibold md:text-[17px]" style={{ color: "#e8d5b7" }}>
                      {item.name}
                      {"hasWebcam" in item && item.hasWebcam ? (
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ background: "#c96442" }}>
                          📹 LIVE
                        </span>
                      ) : null}
                    </span>
                    <span
                      className="rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={
                        typeClass === "club"
                          ? { background: "rgba(135, 168, 120, 0.25)", color: "#a8c898" }
                          : typeClass === "restaurant"
                            ? { background: "rgba(212, 165, 116, 0.25)", color: "#d4a574" }
                            : { background: "rgba(160, 160, 160, 0.25)", color: "#a0a0a0" }
                      }
                    >
                      {typeLabel}
                    </span>
                  </div>
                  <p className="mb-3 text-[13px] leading-snug" style={{ color: "#a89078" }}>
                    {desc(item)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${item.whatsapp.replace(/\D/g, "")}`}
                      className="flex min-w-[80px] flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 py-2.5 text-[11px] font-semibold text-white transition-all hover:-translate-y-px hover:bg-[#3395ff]"
                      style={{ background: "#007aff" }}
                    >
                      📞 Call
                    </a>
                    <a
                      href={`https://wa.me/${item.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-[80px] flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 py-2.5 text-[11px] font-semibold text-white transition-all hover:-translate-y-px hover:bg-[#2ee673]"
                      style={{ background: "#25d366" }}
                    >
                      💬 Chat
                    </a>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-[80px] flex-1 items-center justify-center gap-1.5 rounded-[10px] px-3 py-2.5 text-[11px] font-semibold text-white transition-all hover:bg-[#7d868f]"
                      style={{ background: "#6c757d" }}
                    >
                      🌐 Web
                    </a>
                    <button
                      type="button"
                      onClick={() => openNavigation(item.lat, item.lng, item.name)}
                      className="flex min-w-[80px] flex-1 items-center justify-center gap-1.5 rounded-[10px] border-none px-3 py-2.5 text-[11px] font-semibold text-white transition-all hover:-translate-y-px"
                      style={{ background: "#ff9500" }}
                    >
                      🧭 {navigateLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
