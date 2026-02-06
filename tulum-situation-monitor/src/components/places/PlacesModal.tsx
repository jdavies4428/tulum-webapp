"use client";

import { useState, useMemo } from "react";
import { useVenues } from "@/hooks/useVenues";
import { TULUM_LAT, TULUM_LNG } from "@/data/constants";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { BeachClub, Restaurant, CulturalPlace } from "@/types/place";

type TabId = "beachClubs" | "restaurants" | "cultural";
type SortBy = "distance" | "rating" | "popular";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

interface PlaceForCard {
  id?: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  distance: number;
  isOpen: boolean;
  lat: number;
  lng: number;
  phone: string;
  url: string;
  tags: string[];
  priceLevel: string;
  categoryLabel: string;
  hasWebcam?: boolean;
}

function placeToCard(
  p: BeachClub | Restaurant | CulturalPlace,
  lang: Lang,
  categoryLabel: string
): PlaceForCard {
  const desc = lang === "es" ? p.descEs ?? p.desc : "descFr" in p ? (p as { descFr?: string }).descFr ?? p.desc : p.desc;
  const dist = haversineKm(TULUM_LAT, TULUM_LNG, p.lat, p.lng);
  const tags = categoryLabel === "Club" ? ["Beachfront", "Sunset Views"] : categoryLabel === "Restaurant" ? ["Dining"] : ["Cultural"];
  return {
    id: p.id,
    name: p.name,
    address: desc || "Tulum",
    rating: p.rating ?? 4.5,
    reviews: 0,
    distance: dist,
    isOpen: true,
    lat: p.lat,
    lng: p.lng,
    phone: p.whatsapp ?? "",
    url: p.url ?? "",
    tags,
    priceLevel: "$$",
    categoryLabel,
    hasWebcam: "hasWebcam" in p ? p.hasWebcam : undefined,
  };
}

interface PlaceCardProps {
  place: PlaceForCard;
  navigateLabel: string;
}

function PlaceCard({ place, navigateLabel }: PlaceCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div
      className="place-card"
      style={{
        background: "var(--card-bg)",
        borderRadius: "16px",
        border: "1px solid var(--border-subtle)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "180px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            padding: "6px 12px",
            borderRadius: "20px",
            background: place.isOpen ? "var(--status-open, #10B981)" : "var(--status-closed, #EF4444)",
            fontSize: "11px",
            fontWeight: "700",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            zIndex: 2,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "white",
              animation: place.isOpen ? "blink 2s infinite" : "none",
            }}
          />
          {place.isOpen ? "OPEN" : "CLOSED"}
        </div>

        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            padding: "6px 12px",
            borderRadius: "20px",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(10px)",
            fontSize: "11px",
            fontWeight: "700",
            color: "white",
            zIndex: 2,
          }}
        >
          {place.categoryLabel}
          {place.hasWebcam ? " 📹" : ""}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(10px)",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s",
            zIndex: 2,
          }}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      <div style={{ padding: "16px" }}>
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "var(--text-primary)",
            margin: "0 0 8px 0",
            lineHeight: 1.3,
          }}
        >
          {place.name}
        </h3>

        <p
          style={{
            fontSize: "13px",
            color: "var(--text-tertiary)",
            margin: "0 0 12px 0",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          } as React.CSSProperties}
        >
          {place.address}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span>⭐</span>
            <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{place.rating.toFixed(1)}</span>
            {place.reviews > 0 && (
              <span style={{ color: "var(--text-tertiary)" }}>({place.reviews})</span>
            )}
          </div>
          <span style={{ color: "var(--text-tertiary)" }}>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span>📍</span>
            <span style={{ fontWeight: "600", color: "var(--tulum-turquoise)" }}>
              {place.distance < 1
                ? `${(place.distance * 1000).toFixed(0)}m`
                : `${place.distance.toFixed(1)}km`}
            </span>
          </div>
          {place.priceLevel && (
            <>
              <span style={{ color: "var(--text-tertiary)" }}>•</span>
              <span>💰 {place.priceLevel}</span>
            </>
          )}
        </div>

        {place.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            {place.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "5px 10px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.06)",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  fontWeight: "600",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {place.phone ? (
            <a
              href={`tel:${place.phone.replace(/\D/g, "")}`}
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "#007aff",
                border: "none",
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                textDecoration: "none",
                transition: "transform 0.2s",
              }}
            >
              📞
            </a>
          ) : null}
          {place.phone ? (
            <a
              href={`https://wa.me/${place.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "#25d366",
                border: "none",
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                textDecoration: "none",
                transition: "transform 0.2s",
              }}
            >
              💬
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => openNavigation(place.lat, place.lng, place.name)}
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "#ff9500",
              border: "none",
              color: "white",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "transform 0.2s",
            }}
          >
            🗺️
          </button>
        </div>
      </div>
    </div>
  );
}

interface PlacesModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: "beachClubs" as TabId, label: "Beach Clubs", icon: "🏖️" },
  { id: "restaurants" as TabId, label: "Restaurants", icon: "🍽️" },
  { id: "cultural" as TabId, label: "Cultural", icon: "🎭" },
];

export function PlacesModal({ lang, isOpen, onClose }: PlacesModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("beachClubs");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("distance");
  const { clubs, restaurants, cultural, isLoading, error, source } = useVenues();
  const t = translations[lang] as Record<string, string>;
  const navigateLabel = t.navigate ?? "Go";

  const categoryLabel =
    activeTab === "beachClubs"
      ? t.beachClubs ?? "Beach Clubs"
      : activeTab === "restaurants"
        ? t.restaurants ?? "Restaurants"
        : t.cultural ?? "Cultural";

  const rawItems =
    activeTab === "beachClubs"
      ? clubs.map((p) => placeToCard(p, lang, "Club"))
      : activeTab === "restaurants"
        ? restaurants.map((p) => placeToCard(p, lang, "Restaurant"))
        : cultural.map((p) => placeToCard(p, lang, "Cultural"));

  const items = useMemo(() => {
    let list = [...rawItems];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }

    if (sortBy === "distance") {
      list.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [rawItems, searchQuery, sortBy]);

  const tabCounts = {
    beachClubs: clubs.length,
    restaurants: restaurants.length,
    cultural: cultural.length,
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 999,
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "800px",
          height: "85vh",
          background: "var(--sidebar-bg)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid var(--border-emphasis)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "var(--text-primary)",
                margin: "0 0 4px 0",
              }}
            >
              📍 {t.places ?? "Places"}
              {source === "supabase" && (
                <span
                  style={{
                    marginLeft: "8px",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: "#10B981",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "white",
                  }}
                  title="Loaded from Supabase"
                >
                  DB
                </span>
              )}
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              Discover the best spots in Tulum
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "var(--button-secondary)",
              border: "none",
              color: "var(--text-primary)",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 44px",
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  color: "var(--text-primary)",
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.2s",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px",
                }}
              >
                🔍
              </span>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              style={{
                padding: "14px 16px",
                background: "var(--card-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                color: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="distance">📍 Distance</option>
              <option value="rating">⭐ Rating</option>
              <option value="popular">🔥 Popular</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "0 24px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 20px",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab.id
                    ? "3px solid var(--tulum-turquoise)"
                    : "3px solid transparent",
                color:
                  activeTab === tab.id
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
                marginBottom: "-1px",
              }}
            >
              <span style={{ fontSize: "18px" }}>{tab.icon}</span>
              {tab.label}
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "10px",
                  background:
                    activeTab === tab.id
                      ? "rgba(0, 212, 212, 0.15)"
                      : "rgba(255, 255, 255, 0.08)",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
          }}
        >
          {error && (
            <p
              style={{
                padding: "12px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "12px",
                color: "#EF4444",
                marginBottom: "16px",
                fontSize: "14px",
              }}
              role="alert"
            >
              {error}
            </p>
          )}
          {isLoading ? (
            <div
              style={{
                display: "flex",
                minHeight: "200px",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                fontSize: "14px",
              }}
            >
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                display: "flex",
                minHeight: "200px",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                fontSize: "14px",
              }}
            >
              No places found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {items.map((place) => (
                <PlaceCard
                  key={place.id ?? place.name}
                  place={place}
                  navigateLabel={navigateLabel}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
