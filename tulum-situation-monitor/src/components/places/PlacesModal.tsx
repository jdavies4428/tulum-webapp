"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useVenues } from "@/hooks/useVenues";
import { useFavorites } from "@/hooks/useFavorites";
import { useInsiderPicks } from "@/hooks/useInsiderPicks";
import { useAuthOptional } from "@/contexts/AuthContext";
import { isAdmin as checkIsAdmin } from "@/lib/auth-helpers";
import { AuthPromptModal } from "@/components/auth/AuthPromptModal";
import { useLists } from "@/hooks/useLists";
import { AddToListModal } from "@/components/favorites/AddToListModal";
import { SkeletonList } from "@/components/ui/skeleton";
import { TULUM_LAT, TULUM_LNG } from "@/data/constants";
import { proxyImageUrl } from "@/lib/image-proxy";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";
import { useDebounce } from "@/hooks/useDebounce";
import { CuisineFilter, filterByCuisine, calculateCuisineCounts, type CuisineTag } from "@/components/filters/CuisineFilter";

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
        background: active ? gradient : "#F7F7F7",
        border: active ? "2px solid transparent" : "2px solid #E8E8E8",
        borderRadius: compact ? "12px" : "16px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        alignItems: "center",
        gap: compact ? "8px" : "10px",
        boxShadow: active ? "0 8px 24px rgba(0, 206, 209, 0.2)" : "0 1px 3px rgba(0,0,0,0.06)",
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
          color: active ? "#FFF" : "#717171",
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
  categoryLabel: string,
  userLat?: number,
  userLng?: number
): PlaceForCard {
  const desc = lang === "es" ? p.descEs ?? p.desc : "descFr" in p ? (p as { descFr?: string }).descFr ?? p.desc : p.desc;
  const dist = haversineKm(userLat ?? TULUM_LAT, userLng ?? TULUM_LNG, p.lat, p.lng);
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

const CATEGORY_PLACEHOLDER: Record<string, { bg: string; emoji: string }> = {
  Club: { bg: "rgba(0, 206, 209, 0.12)", emoji: "🏖️" },
  Restaurant: { bg: "rgba(80, 200, 120, 0.12)", emoji: "🍽️" },
  Coffee: { bg: "rgba(139, 69, 19, 0.1)", emoji: "☕" },
  Cultural: { bg: "rgba(155, 89, 182, 0.1)", emoji: "🎭" },
};

function PlaceCard({ place, navigateLabel, onSelect, isFavorite = false, onToggleFavorite, isLocked = false, onAddToList, addToListLabel = "Add to List" }: PlaceCardProps) {
  const photoSrc = proxyImageUrl(place.photo_url, 200) ?? (place.photo_reference ? `/api/places/photo?photo_reference=${encodeURIComponent(place.photo_reference)}&maxwidth=200` : null);
  const distanceStr =
    place.distance < 1
      ? `${(place.distance * 1000).toFixed(0)}m`
      : `${place.distance.toFixed(1)}km`;
  const placeholder = CATEGORY_PLACEHOLDER[place.categoryLabel] ?? { bg: "rgba(0, 206, 209, 0.08)", emoji: "📍" };

  const actionBtnStyle: React.CSSProperties = {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    border: "none",
    fontSize: "17px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
    textDecoration: "none",
  };

  return (
    <div
      className="place-card"
      role="button"
      tabIndex={0}
      onClick={() => place.sourcePlace && onSelect?.(place.sourcePlace)}
      onKeyDown={(e) => e.key === "Enter" && place.sourcePlace && onSelect?.(place.sourcePlace)}
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        padding: "14px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid #EEEEEE",
        cursor: "pointer",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "row",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      {/* Left: photo thumbnail or placeholder */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "12px",
          overflow: "hidden",
          flexShrink: 0,
          background: placeholder.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
        }}
      >
        {photoSrc ? (
          <img
            src={photoSrc}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          placeholder.emoji
        )}
      </div>

      {/* Right: content column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "3px" }}>
        {/* Name */}
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "700",
            margin: 0,
            color: "#222222",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {place.name}
          {place.hasWebcam ? " 📹" : ""}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "12px",
            color: "#717171",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {place.address}
        </p>

        {/* Info pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#D4AF37", background: "rgba(255,215,0,0.12)", padding: "2px 7px", borderRadius: "7px" }}>
            ⭐ {place.rating.toFixed(1)}
          </span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "#00AABB", background: "rgba(0,206,209,0.1)", padding: "2px 7px", borderRadius: "7px" }}>
            📍 {distanceStr}
          </span>
          {place.priceLevel && (
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#CC7744", background: "rgba(255,153,102,0.1)", padding: "2px 7px", borderRadius: "7px" }}>
              {place.priceLevel}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "6px", marginTop: "6px" }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onToggleFavorite}
            style={{ ...actionBtnStyle, background: isFavorite ? "#FF5252" : "#F7F7F7" }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
          {!isLocked && isFavorite && onAddToList && (place.id ?? place.sourcePlace?.id ?? place.sourcePlace?.place_id) && (
            <button
              type="button"
              onClick={() => {
                const id = place.id ?? place.sourcePlace?.id ?? place.sourcePlace?.place_id;
                if (id) onAddToList(id, place.name);
              }}
              style={{ ...actionBtnStyle, width: "auto", padding: "0 10px", background: "rgba(0,206,209,0.08)", color: "#00CED1", fontSize: "12px", fontWeight: "700", gap: "4px" }}
            >
              📋 {addToListLabel}
            </button>
          )}
          {place.phone ? (
            <a
              href={`tel:${place.phone.replace(/\D/g, "")}`}
              style={{ ...actionBtnStyle, background: "#0099FF" }}
            >
              📞
            </a>
          ) : null}
          {place.phone ? (
            <a
              href={`https://wa.me/${place.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...actionBtnStyle, background: "#25D366" }}
            >
              💬
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => openNavigation(place.lat, place.lng, place.name)}
            style={{ ...actionBtnStyle, background: "#FF9500" }}
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
  onPlaceSelect?: (place: BeachClub | Restaurant | CulturalPlace | CafePlace) => void;
  dimmed?: boolean;
  userLocation?: { lat: number; lng: number; accuracy: number } | null;
}

const TABS: { id: TabId; labelKey: keyof typeof import("@/lib/i18n").translations.en; icon: string }[] = [
  { id: "beachClubs", labelKey: "beachClubs", icon: "🏖️" },
  { id: "restaurants", labelKey: "restaurants", icon: "🍽️" },
  { id: "coffeeShops", labelKey: "coffeeShops", icon: "☕" },
  { id: "cultural", labelKey: "cultural", icon: "🎭" },
];

export function PlacesModal({ lang, isOpen, onClose, onPlaceSelect, dimmed = false, userLocation }: PlacesModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("popular");
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineTag>("all");
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

  const isAdmin = checkIsAdmin(auth?.user);

  const { isFavorite, toggleFavorite } = useFavorites(isAdmin);
  const { insiderPickIds } = useInsiderPicks();
  const { lists, addPlaceToLists, removePlaceFromList } = useLists();

  // Debounce search to reduce filtering operations (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update searchQuery when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch]);

  const handleTabChange = (newTab: TabId) => {
    setActiveTab(newTab);
    // Reset cuisine filter when switching away from restaurants
    if (newTab !== "restaurants") {
      setSelectedCuisine("all");
    }
  };

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
      toast.success(t.removedFromFavorites ?? 'Removed from favorites', {
        description: placeName || (t.placeRemovedFromFavorites ?? 'Place removed from your favorites'),
      });
    } else {
      toast.success(t.addedToFavorites ?? 'Added to favorites!', {
        description: placeName || (t.placeSavedToFavorites ?? 'Place saved to your favorites'),
        action: {
          label: t.view ?? 'View',
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
    const uLat = userLocation?.lat;
    const uLng = userLocation?.lng;
    const clubCards = clubs.map((p) => placeToCard(p, lang, "Club", uLat, uLng));
    const restCards = restaurants.map((p) => placeToCard(p, lang, "Restaurant", uLat, uLng));
    const cafeCards = cafes.map((p) => placeToCard(p, lang, "Coffee", uLat, uLng));
    const culturalCards = cultural.map((p) => placeToCard(p, lang, "Cultural", uLat, uLng));
    return [...clubCards, ...restCards, ...cafeCards, ...culturalCards];
  }, [clubs, restaurants, cafes, cultural, lang, userLocation]);

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

    // Apply cuisine filter for restaurants
    if (activeTab === "restaurants" && selectedCuisine !== "all") {
      list = list.filter((place) => {
        const cuisines = place.sourcePlace?.cuisines;
        if (!cuisines || cuisines.length === 0) return false;
        return cuisines.some((c) => c.includes(selectedCuisine));
      });
    }

    if (sortBy === "distance") {
      list.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [allItems, activeTab, searchQuery, sortBy, selectedCuisine, insiderPickIds]);

  // Calculate cuisine counts for restaurants
  const cuisineCounts = useMemo(
    () => calculateCuisineCounts(restaurants),
    [restaurants]
  );

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
            ? {
                bottom: 0,
                left: 0,
                right: 0,
                top: 0,
                borderRadius: "20px 20px 0 0",
              }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%",
                maxWidth: "800px",
                height: "92vh",
                borderRadius: "16px",
              }),
          background: "#FFFFFF",
          border: isMobile ? "none" : "1px solid #EEEEEE",
          boxShadow: isMobile
            ? "0 -4px 24px rgba(0, 0, 0, 0.1)"
            : "0 24px 64px rgba(0, 0, 0, 0.15)",
          zIndex: 9999,
          WebkitOverflowScrolling: "touch",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: isMobile
            ? "slideUpMobile 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards"
            : "slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards",
          outline: "none",
          opacity: dimmed ? 0.3 : 1,
          pointerEvents: dimmed ? "none" : "auto",
          transition: "opacity 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        {isMobile && (
          <div
            style={{
              padding: "12px 0 8px",
              display: "flex",
              justifyContent: "center",
              background: "#FFFFFF",
              borderRadius: "20px 20px 0 0",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "4px",
                borderRadius: "2px",
                background: "rgba(0, 0, 0, 0.15)",
              }}
            />
          </div>
        )}

        {/* Clean header */}
        <div
          style={{
            padding: isMobile ? "12px 16px 16px" : "20px 24px",
            borderBottom: "1px solid #EEEEEE",
            background: "#FFFFFF",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: "44px",
                height: "44px",
                minWidth: "44px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#222222",
                flexShrink: 0,
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
              }}
            >
              ←
            </button>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "700", margin: 0, color: "#222222", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📍</span>
                {t.places ?? "Explore Places"}
              </h2>
              <p style={{ fontSize: isMobile ? "13px" : "14px", color: "#717171", margin: "4px 0 0 0" }}>
                {t.discoverBeaches ?? "Find beaches, restaurants & more"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleTabChange(activeTab === "local" ? "all" : "local")}
              style={{
                padding: isMobile ? "10px 18px" : "9px 18px",
                minHeight: isMobile ? "44px" : "auto",
                background: activeTab === "local"
                  ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                  : "linear-gradient(135deg, #FFF8E1 0%, #FFF3CD 100%)",
                border: activeTab === "local" ? "none" : "1px solid #FFD700",
                borderRadius: "12px",
                fontSize: isMobile ? "14px" : "13px",
                fontWeight: "700",
                color: activeTab === "local" ? "#FFF" : "#B8860B",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: activeTab === "local"
                  ? "0 4px 12px rgba(0,206,209,0.3)"
                  : "0 2px 8px rgba(255,215,0,0.2)",
              }}
            >
              ⭐ {t.localPicks ?? "Insider Picks"}
            </button>
          </div>
        </div>

        {/* Prominent search bar */}
        <div style={{ padding: isMobile ? "12px 16px" : "16px 24px", borderBottom: "1px solid #EEEEEE" }}>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "18px",
              color: "#999999",
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
                background: "#F7F7F7",
                border: "1px solid #DDDDDD",
                borderRadius: "12px",
                fontSize: "15px",
                outline: "none",
                transition: "all 0.2s",
                color: "#222222",
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
                  background: "#EEEEEE",
                  border: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#717171",
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div style={{
          padding: isMobile ? "0 16px" : "0 24px",
          borderBottom: "1px solid #EEEEEE",
          overflowX: "auto",
          display: "flex",
          gap: "0",
          WebkitOverflowScrolling: "touch",
        }}>
          {([
            { id: "all" as TabId, icon: "🌎", label: t.all ?? "All", count: tabCounts.all },
            { id: "beachClubs" as TabId, icon: "🏖️", label: t.beachClubs ?? "Beach Clubs", count: tabCounts.beachClubs },
            { id: "restaurants" as TabId, icon: "🍽️", label: t.restaurants ?? "Restaurants", count: tabCounts.restaurants },
            { id: "coffeeShops" as TabId, icon: "☕", label: t.coffeeShops ?? "Coffee", count: tabCounts.coffeeShops },
            { id: "cultural" as TabId, icon: "🎭", label: t.cultural ?? "Cultural", count: tabCounts.cultural },
          ]).map(({ id, icon, label, count }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleTabChange(id)}
                style={{
                  padding: isMobile ? "12px 12px" : "10px 14px",
                  minHeight: isMobile ? "44px" : "auto",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid #00CED1" : "2px solid transparent",
                  fontSize: "13px",
                  fontWeight: isActive ? "600" : "500",
                  color: isActive ? "#00CED1" : "#717171",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {icon} {label}
                <span style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "1px 5px",
                  borderRadius: "8px",
                  background: isActive ? "rgba(0,206,209,0.12)" : "#F0F0F0",
                  color: isActive ? "#00CED1" : "#999999",
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cuisine Filter - only show for restaurants */}
        {activeTab === "restaurants" && (
          <div
            style={{
              borderBottom: "1px solid #EEEEEE",
              background: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <CuisineFilter
              selectedCuisine={selectedCuisine}
              onCuisineChange={setSelectedCuisine}
              counts={cuisineCounts}
            />
          </div>
        )}

        {/* Results count + sort */}
        <div style={{
          padding: isMobile ? "8px 16px" : "10px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#FFFFFF",
          flexShrink: 0,
          borderBottom: "1px solid #EEEEEE",
        }}>
          <div style={{ fontSize: "13px", color: "#999999", fontWeight: "500" }}>
            {items.length} {items.length === 1 ? (t.place ?? "place") : (t.placePlural ?? "places")}
            {userLocation ? ` · 📍 ${t.nearYou ?? "near you"}` : ""}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {(["popular", "distance", "rating"] as SortBy[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSortBy(s)}
                style={{
                  padding: "5px 11px",
                  background: sortBy === s ? "#00CED1" : "#F0F0F0",
                  color: sortBy === s ? "#FFF" : "#717171",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: sortBy === s ? "700" : "500",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {s === "popular" ? (t.popular ?? "Popular") : s === "distance" ? (t.distance ?? "Distance") : (t.rating ?? "Rating")}
              </button>
            ))}
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
              {t.noPlacesFound ?? "No places found."}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
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
