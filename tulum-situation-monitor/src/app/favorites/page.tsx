"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { useLists } from "@/hooks/useLists";
import { useVenues } from "@/hooks/useVenues";
import { useAuthOptional } from "@/contexts/AuthContext";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { translations } from "@/lib/i18n";
import { TULUM_LAT, TULUM_LNG } from "@/data/constants";
import { haversineKm } from "@/data/constants";
import { CreateListModal } from "@/components/favorites/CreateListModal";
import { AddToListModal } from "@/components/favorites/AddToListModal";
import { ListDetailModal } from "@/components/favorites/ListDetailModal";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";
import type { Lang } from "@/lib/weather";

function getPlaceById(
  placeId: string,
  clubs: BeachClub[],
  restaurants: Restaurant[],
  cafes: CafePlace[],
  cultural: CulturalPlace[]
): { id: string; name: string; lat: number; lng: number; categoryLabel: string } | null {
  const all = [
    ...clubs.map((p) => ({ p, categoryLabel: "Club" as const })),
    ...restaurants.map((p) => ({ p, categoryLabel: "Restaurant" as const })),
    ...cafes.map((p) => ({ p, categoryLabel: "Coffee" as const })),
    ...cultural.map((p) => ({ p, categoryLabel: "Cultural" as const })),
  ];
  for (const { p, categoryLabel } of all) {
    const id = p.id ?? p.place_id;
    if (id === placeId) {
      return {
        id: id!,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        categoryLabel,
      };
    }
  }
  return null;
}

function ListCard({
  list,
  getPlaceName,
  onSelect,
  onDelete,
}: {
  list: { id: string; name: string; icon: string; placeIds: string[] };
  getPlaceName: (placeId: string) => string;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const placeNames = list.placeIds
    .slice(0, 3)
    .map(getPlaceName)
    .filter(Boolean);
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      style={{
        position: "relative",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "20px",
        padding: "20px",
        border: "2px solid rgba(0, 206, 209, 0.2)",
        cursor: "pointer",
        transition: "all 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 206, 209, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "rgba(0, 0, 0, 0.05)",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ⋯
      </button>
      {showMenu && (
        <>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "48px",
              right: "12px",
              background: "#FFF",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: "transparent",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FF6B6B",
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: list.placeIds.length > 0 ? "12px" : 0,
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #FFE4CC 0%, #FFD4B8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
          }}
        >
          {list.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#333", marginBottom: "2px" }}>
            {list.name}
          </div>
          <div style={{ fontSize: "14px", color: "#666" }}>
            {list.placeIds.length} places
          </div>
        </div>
      </div>
      {placeNames.length > 0 && (
        <div
          style={{
            fontSize: "13px",
            color: "#999",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: "8px",
          }}
        >
          {placeNames.join(", ")}
          {list.placeIds.length > 3 && "..."}
        </div>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const auth = useAuthOptional();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { clubs, restaurants, cafes, cultural } = useVenues();
  const {
    lists,
    addList,
    deleteList,
    addPlaceToLists,
    removePlaceFromList,
  } = useLists();

  const [showCreateList, setShowCreateList] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [addToListPlace, setAddToListPlace] = useState<{
    placeId: string;
    placeName: string;
  } | null>(null);

  const t = translations[lang] as Record<string, string>;

  const favoritePlaces = useMemo(() => {
    const result: { id: string; name: string; lat: number; lng: number; categoryLabel: string }[] =
      [];
    favoriteIds.forEach((placeId) => {
      const p = getPlaceById(placeId, clubs, restaurants, cafes, cultural);
      if (p) result.push(p);
    });
    result.sort((a, b) => {
      const da = haversineKm(TULUM_LAT, TULUM_LNG, a.lat, a.lng);
      const db = haversineKm(TULUM_LAT, TULUM_LNG, b.lat, b.lng);
      return da - db;
    });
    return result;
  }, [favoriteIds, clubs, restaurants, cafes, cultural]);

  const getListsForPlace = (placeId: string) =>
    lists.filter((l) => l.placeIds.includes(placeId)).map((l) => l.name);

  const getPlaceName = (placeId: string) => {
    const p = getPlaceById(placeId, clubs, restaurants, cafes, cultural);
    return p?.name ?? "";
  };

  if (!auth?.isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "linear-gradient(180deg, #FFF8E7 0%, #FFFFFF 100%)",
        }}
      >
        <p style={{ fontSize: "18px", color: "#666", marginBottom: "24px" }}>
          {t.signInToViewFavorites ?? "Sign in to view your saved places and lists."}
        </p>
        <Link
          href={`/signin?lang=${lang}`}
          style={{
            padding: "14px 28px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            color: "#FFF",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {t.signIn ?? "Sign In"}
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        paddingTop: "max(24px, env(safe-area-inset-top))",
        background: "linear-gradient(180deg, #FFF8E7 0%, #FFFFFF 100%)",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href={`/?lang=${lang}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(0, 206, 209, 0.12)",
              border: "2px solid rgba(0, 206, 209, 0.2)",
              color: "var(--tulum-ocean)",
              fontSize: "20px",
              textDecoration: "none",
            }}
          >
            ←
          </Link>
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                margin: 0,
                background: "linear-gradient(135deg, #0099CC 0%, #00CED1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ⭐ {t.myFavorites ?? "My Favorites"}
            </h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateList(true)}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            border: "none",
            fontSize: "24px",
            color: "#FFF",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0, 206, 209, 0.3)",
          }}
        >
          +
        </button>
      </header>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#333" }}>
          📋 {t.myLists ?? "My Lists"} ({lists.length})
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              getPlaceName={getPlaceName}
              onSelect={() => setSelectedListId(list.id)}
              onDelete={() => deleteList(list.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "#333" }}>
          📍 {t.allSavedPlaces ?? "All Saved Places"} ({favoritePlaces.length})
        </h2>
        {favoritePlaces.length === 0 ? (
          <p style={{ color: "#999", fontSize: "14px" }}>
            {t.noFavoritesYet ?? "No saved places yet. Save places from the map or Places list."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {favoritePlaces.map((place) => {
              const dist = haversineKm(TULUM_LAT, TULUM_LNG, place.lat, place.lng);
              const listNames = getListsForPlace(place.id);
              return (
                <div
                  key={place.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px",
                    background: "rgba(255,255,255,0.9)",
                    borderRadius: "16px",
                    border: "2px solid rgba(0, 206, 209, 0.15)",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    {place.categoryLabel === "Club" ? "🏖️" : place.categoryLabel === "Restaurant" ? "🍽️" : place.categoryLabel === "Coffee" ? "☕" : "🏛️"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#333" }}>
                      {place.name}
                    </div>
                    <div style={{ fontSize: "13px", color: "#666" }}>
                      {place.categoryLabel} • {dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`}
                    </div>
                    {listNames.length > 0 && (
                      <div style={{ fontSize: "12px", color: "#00CED1", marginTop: "4px" }}>
                        Lists: {listNames.join(", ")}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddToListPlace({ placeId: place.id, placeName: place.name })}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "10px",
                      background: "rgba(0, 206, 209, 0.1)",
                      border: "2px solid rgba(0, 206, 209, 0.3)",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#00CED1",
                      cursor: "pointer",
                    }}
                  >
                    {t.addToList ?? "Add to List"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(place.id)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)",
                      border: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ❤️
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showCreateList && (
        <CreateListModal
          onClose={() => setShowCreateList(false)}
          onCreate={(name, icon) => {
            addList(name, icon);
            setShowCreateList(false);
          }}
          lang={lang}
        />
      )}

      {selectedListId && (
        <ListDetailModal
          list={lists.find((l) => l.id === selectedListId)!}
          clubs={clubs}
          restaurants={restaurants}
          cafes={cafes}
          cultural={cultural}
          onClose={() => setSelectedListId(null)}
          onRemovePlace={removePlaceFromList}
          lang={lang}
        />
      )}

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
    </div>
  );
}
