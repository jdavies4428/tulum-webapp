"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useVenues } from "@/hooks/useVenues";
import { useFavorites } from "@/hooks/useFavorites";
import { useInsiderPicks } from "@/hooks/useInsiderPicks";
import { useAuthOptional } from "@/contexts/AuthContext";
import { AuthPromptModal } from "@/components/auth/AuthPromptModal";
import { useLists } from "@/hooks/useLists";
import { AddToListModal } from "@/components/favorites/AddToListModal";
import { SkeletonList } from "@/components/ui/skeleton";
import { TULUM_LAT, TULUM_LNG } from "@/data/constants";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";
import { useDebounce } from "@/hooks/useDebounce";

type TabId = "all" | "local" | "beachClubs" | "restaurants" | "coffeeShops" | "cultural";
type SortBy = "distance" | "rating" | "popular";

function FilterButton({
  icon,
  label,
  active,
  onClick,
  gradient,
  wide,
  compact,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  gradient: string;
  wide?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        gridColumn: wide ? "1 / -1" : "auto",
        padding: compact ? "10px 12px" : "12px 16px",
        background: active ? gradient : "rgba(255, 255, 255, 0.8)",
        border: active ? "2px solid transparent" : "2px solid rgba(0, 206, 209, 0.2)",
        borderRadius: compact ? "12px" : "16px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        alignItems: "center",
        gap: compact ? "8px" : "10px",
        boxShadow: active ? "0 8px 24px rgba(0, 206, 209, 0.2)" : "0 2px 8px rgba(0, 0, 0, 0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {active && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }}
        />
      )}
      <span style={{ fontSize: compact ? "18px" : "20px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))", position: "relative", zIndex: 1 }}>
        {icon}
      </span>
      <span
        style={{
          fontSize: compact ? "13px" : "15px",
          fontWeight: "700",
          color: active ? "#333" : "#666",
          letterSpacing: "0.2px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {label}
      </span>
    </button>
  );
}

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
  photo_reference?: string | null;
  photo_url?: string | null;
  sourcePlace?: BeachClub | Restaurant | CulturalPlace | CafePlace;
}

function placeToCard(
  p: BeachClub | Restaurant | CulturalPlace | CafePlace,
  lang: Lang,
  categoryLabel: string
): PlaceForCard {
  const desc = lang === "es" ? p.descEs ?? p.desc : "descFr" in p ? (p as { descFr?: string }).descFr ?? p.desc : p.desc;
  const dist = haversineKm(TULUM_LAT, TULUM_LNG, p.lat, p.lng);
  const tags =
    categoryLabel === "Club"
      ? ["Beachfront", "Sunset Views"]
      : categoryLabel === "Restaurant"
        ? ["Dining"]
        : categoryLabel === "Coffee"
          ? ["Coffee", "Café"]
          : ["Cultural"];
  return {
    id: p.id,
    sourcePlace: p,
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
    photo_reference: p.photo_reference ?? undefined,
    photo_url: p.photo_url ?? undefined,
  };
}

interface PlaceCardProps {
  place: PlaceForCard;
  navigateLabel: string;
  onSelect?: (place: BeachClub | Restaurant | CulturalPlace | CafePlace) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  /** When true, show lock icon and require sign-in to save */
  isLocked?: boolean;
  /** When true and favorited, show Add to List button */
  onAddToList?: (placeId: string, placeName: string) => void;
  addToListLabel?: string;
}

function PlaceCard({ place, navigateLabel, onSelect, isFavorite = false, onToggleFavorite, isLocked = false, onAddToList, addToListLabel = "Add to List" }: PlaceCardProps) {
  const photoSrc = place.photo_url ?? (place.photo_reference ? `/api/places/photo?photo_reference=${encodeURIComponent(place.photo_reference)}&maxwidth=400` : null);
  const distanceStr =
    place.distance < 1
      ? `${(place.distance * 1000).toFixed(0)}m`
      : `${place.distance.toFixed(1)}km`;

  return (
    <div
      className="place-card"
      role="button"
      tabIndex={0}
      onClick={() => place.sourcePlace && onSelect?.(place.sourcePlace)}
      onKeyDown={(e) => e.key === "Enter" && place.sourcePlace && onSelect?.(place.sourcePlace)}
      style={{
        background: "var(--card-bg)",
        borderRadius: "24px",
        padding: "20px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        border: "2px solid rgba(0, 206, 209, 0.15)",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #00CED1 0%, #0099CC 100%)",
        }}
      />

      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            padding: "6px 12px",
            background: "#1A1A1A",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "700",
            color: "#FFF",
            letterSpacing: "0.5px",
          }}
        >
          {place.categoryLabel}
          {place.hasWebcam ? " 📹" : ""}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: isFavorite
                ? "#FF5252"
                : "rgba(255, 255, 255, 0.9)",
              border: isFavorite ? "none" : "2px solid rgba(0, 0, 0, 0.1)",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              transition: "all 0.3s",
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
          <div
            style={{
              padding: "8px 16px",
              background: place.isOpen
                ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                : "rgba(0, 0, 0, 0.2)",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "800",
              color: "#FFF",
              letterSpacing: "0.5px",
              boxShadow: place.isOpen ? "0 4px 12px rgba(0, 206, 209, 0.3)" : "none",
            }}
          >
            • {place.isOpen ? "OPEN" : "CLOSED"}
          </div>
        </div>
      </div>

      {/* Photo (optional) */}
      {photoSrc && (
        <div
          style={{
            margin: "0 -20px 16px",
            height: "140px",
            overflow: "hidden",
            borderRadius: "12px",
          }}
        >
          <img
            src={photoSrc}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      )}

      {/* Place name */}
      <h3
        style={{
          fontSize: "22px",
          fontWeight: "800",
          margin: "0 0 6px 0",
          color: "#1A1A1A",
          letterSpacing: "-0.5px",
        }}
      >
        {place.name}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: "15px",
          color: "#666",
          margin: "0 0 16px 0",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        } as React.CSSProperties}
      >
        {place.address}
      </p>

      {/* Info row pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            background: "rgba(255, 215, 0, 0.15)",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontSize: "16px" }}>⭐</span>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#D4AF37" }}>
            {place.rating.toFixed(1)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            background: "rgba(0, 206, 209, 0.1)",
            borderRadius: "10px",
          }}
        >
          <span style={{ fontSize: "16px" }}>📍</span>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#00CED1" }}>{distanceStr}</span>
        </div>
        {place.priceLevel && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "rgba(255, 153, 102, 0.1)",
              borderRadius: "10px",
            }}
          >
            <span style={{ fontSize: "16px" }}>💰</span>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#FF9966" }}>{place.priceLevel}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {place.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          {place.tags.map((tag) => (
            <div
              key={tag}
              style={{
                padding: "6px 14px",
                background: "rgba(0, 0, 0, 0.06)",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          style={{
            padding: "12px",
            background: isFavorite
              ? "#FF5252"
              : "rgba(0, 0, 0, 0.06)",
            border: "none",
            borderRadius: "12px",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
        {!isLocked && isFavorite && onAddToList && (place.id ?? place.sourcePlace?.id ?? place.sourcePlace?.place_id) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const id = place.id ?? place.sourcePlace?.id ?? place.sourcePlace?.place_id;
              if (id) onAddToList(id, place.name);
            }}
            style={{
              padding: "14px 20px",
              background: "rgba(0, 206, 209, 0.1)",
              border: "2px solid rgba(0, 206, 209, 0.3)",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: "700",
              color: "#00CED1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            📋 {addToListLabel}
          </button>
        )}
        {place.phone ? (
          <a
            href={`tel:${place.phone.replace(/\D/g, "")}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#0099FF",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0, 153, 255, 0.4)",
              transition: "all 0.2s",
              textDecoration: "none",
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
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "#25D366",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(37, 211, 102, 0.4)",
              transition: "all 0.2s",
              textDecoration: "none",
            }}
          >
            💬
          </a>
        ) : null}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openNavigation(place.lat, place.lng, place.name);
          }}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "#FF9500",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(255, 149, 0, 0.4)",
            transition: "all 0.2s",
          }}
        >
          🗺️
        </button>
      </div>
    </div>
  );
}

interface PlacesModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
  onPlaceSelect?: (place: BeachClub | Restaurant | CulturalPlace | CafePlace) => void;
}

const TABS: { id: TabId; labelKey: keyof typeof import("@/lib/i18n").translations.en; icon: string }[] = [
  { id: "beachClubs", labelKey: "beachClubs", icon: "🏖️" },
  { id: "restaurants", labelKey: "restaurants", icon: "🍽️" },
  { id: "coffeeShops", labelKey: "coffeeShops", icon: "☕" },
  { id: "cultural", labelKey: "cultural", icon: "🎭" },
];

export function PlacesModal({ lang, isOpen, onClose, onPlaceSelect }: PlacesModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("popular");
  const [isMobile, setIsMobile] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingPlaceId, setPendingPlaceId] = useState<string | undefined>(undefined);
  const [addToListPlace, setAddToListPlace] = useState<{ placeId: string; placeName: string } | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { clubs, restaurants, cafes, cultural, isLoading, error, source } = useVenues();
  const auth = useAuthOptional();
  const isAuthenticated = auth?.isAuthenticated ?? false;

  // Check if user is admin
  const isAdmin = auth?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
                  auth?.user?.user_metadata?.role === "admin";

  const { isFavorite, toggleFavorite } = useFavorites(isAdmin);
  const { insiderPickIds } = useInsiderPicks();
  const { lists, addPlaceToLists, removePlaceFromList } = useLists();

  // Debounce search to reduce filtering operations (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update searchQuery when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch]);

  const handleFavoriteClick = (placeId: string | undefined, placeName?: string) => {
    if (!placeId) return;
    if (!isAuthenticated) {
      setPendingPlaceId(placeId);
      setAuthModalOpen(true);
      return;
    }
    const wasFavorite = isFavorite(placeId);
    toggleFavorite(placeId);

    // Show toast notification
    if (wasFavorite) {
      toast.success('Removed from favorites', {
        description: placeName || 'Place removed from your favorites',
      });
    } else {
      toast.success('Added to favorites!', {
        description: placeName || 'Place saved to your favorites',
        action: {
          label: 'View',
          onClick: () => window.location.href = '/favorites'
        }
      });
    }
  };

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      panelRef.current?.focus();
    }, 150);
    return () => clearTimeout(t);
  }, [isOpen]);
  const t = translations[lang] as Record<string, string>;
  const navigateLabel = t.navigate ?? "Go";

  const allItems = useMemo(() => {
    const clubCards = clubs.map((p) => placeToCard(p, lang, "Club"));
    const restCards = restaurants.map((p) => placeToCard(p, lang, "Restaurant"));
    const cafeCards = cafes.map((p) => placeToCard(p, lang, "Coffee"));
    const culturalCards = cultural.map((p) => placeToCard(p, lang, "Cultural"));
    return [...clubCards, ...restCards, ...cafeCards, ...culturalCards];
  }, [clubs, restaurants, cafes, cultural, lang]);

  const items = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list: PlaceForCard[];

    if (q) {
      list = allItems.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q)
      );
    } else {
      if (activeTab === "beachClubs") list = allItems.filter((p) => p.categoryLabel === "Club");
      else if (activeTab === "restaurants") list = allItems.filter((p) => p.categoryLabel === "Restaurant");
      else if (activeTab === "coffeeShops") list = allItems.filter((p) => p.categoryLabel === "Coffee");
      else if (activeTab === "cultural") list = allItems.filter((p) => p.categoryLabel === "Cultural");
      else if (activeTab === "local")
        list = allItems.filter((p) => {
          const placeId = p.id ?? p.sourcePlace?.id ?? p.sourcePlace?.place_id;
          return placeId && insiderPickIds.has(placeId);
        });
      else list = [...allItems];
    }

    if (sortBy === "distance") {
      list.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [allItems, activeTab, searchQuery, sortBy, insiderPickIds]);

  const totalCount = clubs.length + restaurants.length + cafes.length + cultural.length;
  const tabCounts: Record<TabId, number> = {
    all: totalCount,
    local: clubs.length + restaurants.length,
    beachClubs: clubs.length,
    restaurants: restaurants.length,
    coffeeShops: cafes.length,
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
          zIndex: 9998,
          animation: "fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        }}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t.places ?? "Places"}
        style={{
          position: "fixed",
          ...(isMobile
            ? { inset: "12px 8px 8px" }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%",
                maxWidth: "800px",
                height: "92vh",
              }),
          background: "linear-gradient(180deg, #FFF8E7 0%, #FFFFFF 100%)",
          borderRadius: "24px",
          border: "1px solid var(--border-emphasis)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8)",
          zIndex: 9999,
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: isMobile
            ? "slideUpMobile 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards"
            : "slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards",
          outline: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean header */}
        <div
          style={{
            padding: isMobile ? "16px" : "20px 24px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            background: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "700", margin: 0, color: "#1A1A1A", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📍</span>
                {t.places ?? "Explore Places"}
              </h2>
              <p style={{ fontSize: isMobile ? "13px" : "14px", color: "#666", margin: "4px 0 0 0" }}>
                {t.discoverBeaches ?? "Find beaches, restaurants & more"}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("local")}
                style={{
                  padding: "8px 16px",
                  background: activeTab === "local" ? "#00CED1" : "transparent",
                  border: activeTab === "local" ? "none" : "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: activeTab === "local" ? "#FFF" : "#666",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                ⭐ {t.localPicks ?? "Insider Picks"}
              </button>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.05)",
                  border: "none",
                  fontSize: "18px",
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
          </div>
        </div>

        {/* Prominent search bar */}
        <div style={{ padding: isMobile ? "12px 16px" : "16px 24px", borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "18px",
              color: "#999",
            }}>
              🔍
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t.searchPlaces ?? "Search all places…"}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: "100%",
                padding: isMobile ? "10px 40px" : "12px 44px",
                background: "#F5F5F5",
                border: "2px solid transparent",
                borderRadius: "12px",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s",
                color: "#333",
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.1)",
                  border: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div style={{
          padding: isMobile ? "6px 16px" : "8px 24px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          overflowX: "auto",
          whiteSpace: "nowrap",
          display: "flex",
          gap: "8px",
        }}>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            style={{
              padding: isMobile ? "6px 12px" : "8px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "all" ? "2px solid #00CED1" : "2px solid transparent",
              fontSize: isMobile ? "13px" : "14px",
              fontWeight: activeTab === "all" ? "600" : "500",
              color: activeTab === "all" ? "#00CED1" : "#666",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            🌎 {t.all ?? "All"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("beachClubs")}
            style={{
              padding: isMobile ? "6px 12px" : "8px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "beachClubs" ? "2px solid #00CED1" : "2px solid transparent",
              fontSize: isMobile ? "13px" : "14px",
              fontWeight: activeTab === "beachClubs" ? "600" : "500",
              color: activeTab === "beachClubs" ? "#00CED1" : "#666",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            🏖️ {t.beachClubs ?? "Beach Clubs"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("restaurants")}
            style={{
              padding: isMobile ? "6px 12px" : "8px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "restaurants" ? "2px solid #00CED1" : "2px solid transparent",
              fontSize: isMobile ? "13px" : "14px",
              fontWeight: activeTab === "restaurants" ? "600" : "500",
              color: activeTab === "restaurants" ? "#00CED1" : "#666",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            🍽️ {t.restaurants ?? "Restaurants"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("coffeeShops")}
            style={{
              padding: isMobile ? "6px 12px" : "8px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "coffeeShops" ? "2px solid #00CED1" : "2px solid transparent",
              fontSize: isMobile ? "13px" : "14px",
              fontWeight: activeTab === "coffeeShops" ? "600" : "500",
              color: activeTab === "coffeeShops" ? "#00CED1" : "#666",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            ☕ {t.coffeeShops ?? "Coffee"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cultural")}
            style={{
              padding: isMobile ? "6px 12px" : "8px 16px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "cultural" ? "2px solid #00CED1" : "2px solid transparent",
              fontSize: isMobile ? "13px" : "14px",
              fontWeight: activeTab === "cultural" ? "600" : "500",
              color: activeTab === "cultural" ? "#00CED1" : "#666",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            🎭 {t.cultural ?? "Cultural"}
          </button>
        </div>

        {/* Results count + sort */}
        <div style={{
          padding: isMobile ? "10px 16px" : "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#FAFAFA",
        }}>
          <div style={{ fontSize: isMobile ? "13px" : "14px", color: "#666", fontWeight: "500" }}>
            {items.length} {items.length === 1 ? 'place' : 'places'}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#999" }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              style={{
                padding: "6px 12px",
                border: "1px solid rgba(0, 0, 0, 0.12)",
                borderRadius: "8px",
                fontSize: "13px",
                background: "#FFFFFF",
                cursor: "pointer",
                outline: "none",
                color: "#333",
              }}
            >
              <option value="popular">{t.popular ?? "Popular"}</option>
              <option value="distance">{t.distance ?? "Distance"}</option>
              <option value="rating">{t.rating ?? "Rating"}</option>
            </select>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? "10px 16px 16px" : "12px 20px 20px",
            WebkitOverflowScrolling: "touch",
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
            <div style={{ padding: "16px" }}>
              <SkeletonList count={5} />
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
              {items.map((place) => {
                const placeId = place.id ?? place.sourcePlace?.id ?? place.sourcePlace?.place_id;
                return (
                  <PlaceCard
                    key={place.id ?? place.name}
                    place={place}
                    navigateLabel={navigateLabel}
                    onSelect={onPlaceSelect}
                    isFavorite={isFavorite(placeId)}
                    onToggleFavorite={() => handleFavoriteClick(placeId, place.name)}
                    isLocked={!isAuthenticated}
                    onAddToList={isAuthenticated ? (id, name) => setAddToListPlace({ placeId: id, placeName: name }) : undefined}
                    addToListLabel={t.addToList ?? "Add to List"}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AuthPromptModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingPlaceId(undefined);
        }}
        reason="save"
        pendingPlaceId={pendingPlaceId}
        lang={lang}
      />

      {addToListPlace && (
        <AddToListModal
          placeId={addToListPlace.placeId}
          placeName={addToListPlace.placeName}
          lists={lists}
          onClose={() => setAddToListPlace(null)}
          onSave={() => setAddToListPlace(null)}
          addPlaceToLists={addPlaceToLists}
          removePlaceFromList={removePlaceFromList}
          lang={lang}
        />
      )}
    </>
  );
}
