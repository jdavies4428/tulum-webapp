"use client";

import { useState, useEffect } from "react";
import { useVenues } from "@/hooks/useVenues";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { useDebounce } from "@/hooks/useDebounce";

interface SharePlaceModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
  onSelectPlace: (place: {
    place_id: string;
    place_name: string;
    category?: string;
    image_url?: string;
    rating?: number;
  }) => void;
}

export function SharePlaceModal({
  lang,
  isOpen,
  onClose,
  onSelectPlace,
}: SharePlaceModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const { clubs, restaurants, cafes, cultural, isLoading } = useVenues();
  const t = translations[lang] as Record<string, string>;

  // Debounce search query to reduce filtering operations (200ms delay)
  const debouncedQuery = useDebounce(inputValue, 200);

  // Update query when debounced value changes
  useEffect(() => {
    setQuery(debouncedQuery);
  }, [debouncedQuery]);

  const allPlaces = [
    ...clubs.map((p) => ({ ...p, category: "Beach Club" })),
    ...restaurants.map((p) => ({ ...p, category: "Restaurant" })),
    ...cafes.map((p) => ({ ...p, category: "Coffee" })),
    ...cultural.map((p) => ({ ...p, category: "Cultural" })),
  ];

  const filtered = query.trim().length >= 2
    ? allPlaces.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : allPlaces.slice(0, 20);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 9998,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "70vh",
          background: "#0A0F14",
          borderRadius: "24px 24px 0 0",
          zIndex: 9999,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: 20,
            borderBottom: "2px solid rgba(0, 206, 209, 0.2)",
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 700 }}>
            {t.sharePlace ?? "Share a place"}
          </h3>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t.searchPlaces ?? "Search places…"}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "2px solid rgba(0, 206, 209, 0.3)",
              fontSize: 15,
              outline: "none",
            }}
          />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {isLoading ? (
            <div style={{ padding: 24, textAlign: "center", color: "rgba(232, 236, 239, 0.6)" }}>
              {t.loading ?? "Loading…"}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "rgba(232, 236, 239, 0.6)" }}>
              {t.noPlacesFound ?? "No places found"}
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.place_id ?? p.id}
                type="button"
                onClick={() => {
                  onSelectPlace({
                    place_id: (p.place_id ?? p.id) || p.name,
                    place_name: p.name,
                    category: (p as { category?: string }).category,
                    rating: p.rating ?? undefined,
                  });
                  onClose();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  marginBottom: 8,
                  background: "rgba(20, 30, 45, 0.85)",
                  border: "2px solid rgba(0, 206, 209, 0.2)",
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 24 }}>📍</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#E8ECEF" }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(232, 236, 239, 0.6)" }}>
                    {(p as { category?: string }).category}
                    {p.rating != null && ` • ⭐ ${p.rating}`}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
