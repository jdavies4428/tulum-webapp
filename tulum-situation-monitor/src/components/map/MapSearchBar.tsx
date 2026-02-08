"use client";

import React, { useState, useEffect, useRef } from "react";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";
import type { Lang } from "@/lib/weather";
import { translations } from "@/lib/i18n";

type PlaceForSelect = BeachClub | Restaurant | CulturalPlace | CafePlace;

export type SearchablePlace = PlaceForSelect & {
  category: string;
  /** Combined searchable text: name, category label, description */
  searchText: string;
  icon: string;
};

export type MapSearchCategoryId = "beachClubs" | "restaurants" | "coffeeShops" | "cultural";

const CATEGORY_IDS: MapSearchCategoryId[] = ["beachClubs", "restaurants", "coffeeShops", "cultural"];

const CATEGORY_CONFIG: Record<MapSearchCategoryId, { icon: string; color: string }> = {
  beachClubs: { icon: "🏖️", color: "#FF9966" },
  restaurants: { icon: "🍽️", color: "#50C878" },
  coffeeShops: { icon: "☕", color: "#8B4513" },
  cultural: { icon: "🏛️", color: "#9370DB" },
};

const POPULAR_SEARCHES: { query: string; icon: string; category: MapSearchCategoryId }[] = [
  { query: "beach clubs", icon: "🏖️", category: "beachClubs" },
  { query: "cenotes", icon: "💧", category: "cultural" },
  { query: "vegan restaurants", icon: "🌱", category: "restaurants" },
  { query: "coffee shops", icon: "☕", category: "coffeeShops" },
  { query: "ruins", icon: "🏛️", category: "cultural" },
];

interface MapSearchBarProps {
  places: SearchablePlace[];
  lang: Lang;
  onSelectPlace: (place: PlaceForSelect) => void;
  onSearch?: (query: string) => void;
  flyTo?: (lat: number, lng: number, zoom?: number) => void;
  /** Top offset (e.g. 72 for below top bar). Default 16. */
  topOffset?: number;
  /** Full-width layout (left/right 16px). Default false (centered, max 500px). */
  fullWidth?: boolean;
}

function SuggestionItem({
  place,
  isSelected,
  onClick,
  categoryLabels,
}: {
  place: SearchablePlace;
  isSelected: boolean;
  onClick: () => void;
  categoryLabels: Record<string, string>;
}) {
  const color = CATEGORY_CONFIG[place.category as MapSearchCategoryId]?.color ?? "#00CED1";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 16px",
        background: isSelected ? "rgba(0, 206, 209, 0.08)" : "transparent",
        border: "none",
        borderLeft: isSelected ? "3px solid #00CED1" : "3px solid transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        transition: "all 0.2s",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "rgba(0, 206, 209, 0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {place.icon || "📍"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#333",
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {place.name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#666",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{categoryLabels[place.category] ?? place.category}</span>
          {place.rating != null && (
            <>
              <span>•</span>
              <span>⭐ {place.rating.toFixed(1)}</span>
            </>
          )}
        </div>
      </div>
      <div style={{ fontSize: 16, color: "#999" }}>→</div>
    </button>
  );
}

function PopularSearchItem({
  item,
  onClick,
}: {
  item: (typeof POPULAR_SEARCHES)[number];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 16px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "all 0.2s",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(0, 206, 209, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(0, 206, 209, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {item.icon}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>{item.query}</div>
    </button>
  );
}

export function MapSearchBar({ places, lang, onSelectPlace, onSearch, flyTo, topOffset = 16, fullWidth = false }: MapSearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchablePlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];
  const tAny = t as Record<string, string>;

  const categoryLabels: Record<string, string> = {
    beachClubs: t.beachClubs ?? "Beach Clubs",
    restaurants: t.restaurants ?? "Restaurants",
    coffeeShops: t.coffeeShops ?? "Coffee Shops",
    cultural: t.cultural ?? "Cultural",
  };

  // Search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = places.filter(
      (place) =>
        place.name.toLowerCase().includes(searchTerm) ||
        (place.searchText && place.searchText.toLowerCase().includes(searchTerm))
    );

    const sorted = filtered.sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
      const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return 0;
    });

    setSuggestions(sorted.slice(0, 8));
    setSelectedIndex(-1);
  }, [query, places]);

  const handleSearch = (searchQuery: string) => {
    onSearch?.(searchQuery);
    setShowSuggestions(false);
    setQuery(searchQuery);
  };

  const handleSelectPlace = (place: SearchablePlace) => {
    setQuery(place.name);
    setShowSuggestions(false);
    onSelectPlace(place);

    if (flyTo) {
      flyTo(place.lat, place.lng, 15);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectPlace(suggestions[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBlur = () => {
    setFocused(false);
  };

  return (
    <div
      ref={searchRef}
      style={{
        position: "absolute",
        top: topOffset,
        left: fullWidth ? 16 : "50%",
        right: fullWidth ? 16 : undefined,
        transform: fullWidth ? undefined : "translateX(-50%)",
        width: fullWidth ? undefined : "90%",
        maxWidth: fullWidth ? undefined : 500,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "relative",
          background: "rgba(255, 255, 255, 0.98)",
          borderRadius: 16,
          boxShadow: focused ? "0 8px 32px rgba(0, 206, 209, 0.3)" : "0 4px 16px rgba(0, 0, 0, 0.15)",
          border: focused ? "2px solid #00CED1" : "2px solid transparent",
          backdropFilter: "blur(20px)",
          transition: "all 0.3s",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 16px",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => { setShowSuggestions(true); setFocused(true); }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={t.mapSearchPlaceholder ?? "Search beaches, restaurants, cenotes…"}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 15,
              fontWeight: 500,
              background: "transparent",
              color: "#333",
            }}
            aria-label={t.mapSearchPlaceholder ?? "Search places"}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.1)",
                border: "none",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.1)";
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Quick Filters - wrap so labels are never cut off */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            padding: "0 16px 12px",
          }}
          className="map-search-categories"
        >
          {CATEGORY_IDS.map((catId) => {
            const cat = CATEGORY_CONFIG[catId];
            const label = categoryLabels[catId] ?? catId;
            return (
              <button
                key={catId}
                type="button"
                onClick={() => {
                  setQuery(label);
                  handleSearch(label);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "none",
                  background: `${cat.color}15`,
                  color: cat.color,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${cat.color}25`;
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${cat.color}15`;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span>{cat.icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length >= 2 || query.length === 0) && (
        <div
          style={{
            marginTop: 8,
            background: "rgba(255, 255, 255, 0.98)",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            border: "2px solid rgba(0, 206, 209, 0.2)",
            backdropFilter: "blur(20px)",
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {query.length >= 2 && suggestions.length > 0 ? (
            <div style={{ padding: "8px 0" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "8px 16px",
                }}
              >
                {t.places ?? "Places"} ({suggestions.length})
              </div>
              {suggestions.map((place, index) => (
                <SuggestionItem
                  key={place.id ?? place.place_id ?? `${place.lat}-${place.lng}`}
                  place={place}
                  isSelected={index === selectedIndex}
                  onClick={() => handleSelectPlace(place)}
                  categoryLabels={categoryLabels}
                />
              ))}
            </div>
          ) : query.length >= 2 && suggestions.length === 0 ? (
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                color: "#999",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t.noResultsFound ?? "No results found"}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{t.trySearchingHint ?? "Try searching for beaches, restaurants, or cenotes"}</div>
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "8px 16px",
                }}
              >
                {t.popularSearches ?? "Popular Searches"}
              </div>
              {POPULAR_SEARCHES.map((item, index) => (
                <PopularSearchItem
                  key={index}
                  item={item}
                  onClick={() => handleSearch(item.query)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
