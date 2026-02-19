"use client";

import { useMemo } from "react";
import type { SavedList } from "@/hooks/useLists";
import { translations } from "@/lib/i18n";
import { TULUM_LAT, TULUM_LNG } from "@/data/constants";
import { haversineKm } from "@/data/constants";
import type { Lang } from "@/lib/weather";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";

function getPlaceById(
  placeId: string,
  clubs: BeachClub[],
  restaurants: Restaurant[],
  cafes: CafePlace[],
  cultural: CulturalPlace[]
): { name: string; lat: number; lng: number; categoryLabel: string } | null {
  const all = [
    ...clubs.map((p) => ({ ...p, categoryLabel: "Club" })),
    ...restaurants.map((p) => ({ ...p, categoryLabel: "Restaurant" })),
    ...cafes.map((p) => ({ ...p, categoryLabel: "Coffee" })),
    ...cultural.map((p) => ({ ...p, categoryLabel: "Cultural" })),
  ];
  const place = all.find(
    (p) => (p.id ?? p.place_id) === placeId || p.id === placeId || p.place_id === placeId
  );
  if (!place) return null;
  return {
    name: place.name,
    lat: place.lat,
    lng: place.lng,
    categoryLabel: place.categoryLabel,
  };
}

function exportToGoogleMaps(places: { lat: number; lng: number }[]) {
  if (places.length === 0) return;
  const waypoints = places.map((p) => `${p.lat},${p.lng}`).join("/");
  window.open(`https://www.google.com/maps/dir/${waypoints}`, "_blank");
}

async function shareList(
  list: { name: string; placeIds: string[] },
  placeNames: string[],
  t: Record<string, string>
) {
  const shareData = {
    title: `${list.name} - Tulum`,
    text: `Check out my ${list.name} list for Tulum: ${placeNames.join(", ")}`,
    url: typeof window !== "undefined" ? window.location.origin + "/favorites" : "",
  };
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(shareData);
    } catch {
      // User cancelled or error
    }
  } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareData.text + "\n\n" + shareData.url);
    alert(t.linkCopied ?? "Link copied to clipboard!");
  }
}

interface ListDetailModalProps {
  list: SavedList;
  clubs: BeachClub[];
  restaurants: Restaurant[];
  cafes: CafePlace[];
  cultural: CulturalPlace[];
  onClose: () => void;
  onRemovePlace: (listId: string, placeId: string) => void;
  onExport?: (places: { lat: number; lng: number }[]) => void;
  lang?: Lang;
}

export function ListDetailModal({
  list,
  clubs,
  restaurants,
  cafes,
  cultural,
  onClose,
  onRemovePlace,
  lang = "en",
}: ListDetailModalProps) {
  const t = translations[lang] as Record<string, string>;

  const placesWithDetails = useMemo(() => {
    return list.placeIds
      .map((placeId) => {
        const p = getPlaceById(placeId, clubs, restaurants, cafes, cultural);
        if (!p) return null;
        const dist = haversineKm(TULUM_LAT, TULUM_LNG, p.lat, p.lng);
        return { placeId, ...p, distance: dist };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.distance - b.distance);
  }, [list.placeIds, clubs, restaurants, cafes, cultural]);

  const handleExport = () => {
    const coords = placesWithDetails.map((p) => ({ lat: p.lat, lng: p.lng }));
    exportToGoogleMaps(coords);
  };

  const handleShare = () => {
    shareList(list, placesWithDetails.map((p) => p.name), t);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(20, 30, 45, 0.85)",
          borderRadius: "24px",
          padding: "24px",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "32px" }}>{list.icon}</span>
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  margin: 0,
                  color: "#E8ECEF",
                }}
              >
                {list.name}
              </h2>
              <p style={{ fontSize: "14px", color: "rgba(232, 236, 239, 0.6)", margin: "4px 0 0 0" }}>
                {list.placeIds.length} {t.places ?? "places"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.06)",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {placesWithDetails.length > 0 && (
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleExport}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: "#4285F4",
                border: "none",
                color: "#FFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>🗺️</span>
              <span>{t.openInGoogleMaps ?? "Open in Google Maps"}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: "rgba(0, 206, 209, 0.9)",
                border: "none",
                color: "#FFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>📤</span>
              <span>{t.shareList ?? "Share List"}</span>
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {placesWithDetails.length === 0 ? (
            <p style={{ color: "rgba(232, 236, 239, 0.6)", fontSize: "14px" }}>
              {t.noPlacesInList ?? "No places in this list yet."}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {placesWithDetails.map(({ placeId, name, categoryLabel, distance }) => (
                <div
                  key={placeId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 206, 209, 0.12)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#E8ECEF" }}>
                      {name}
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(232, 236, 239, 0.6)" }}>
                      {categoryLabel} • {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemovePlace(list.id, placeId)}
                    style={{
                      padding: "8px",
                      background: "rgba(255,107,107,0.1)",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    aria-label={t.remove ?? "Remove"}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
