"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { MapLayersState } from "@/components/map/MapContainer";
import { MapView } from "@/components/map/MapView";
import { MapSearchBar, type SearchablePlace } from "@/components/map/MapSearchBar";
import { MapTopBar } from "@/components/map/MapTopBar";
import { MapControls } from "@/components/map/MapControls";
import { BottomNav } from "@/components/layout/BottomNav";
import { MapLayersSheet } from "@/components/map/MapLayersSheet";
import { LayerControls } from "@/components/layout/LayerControls";
import { OPEN_MAP_LAYERS_EVENT } from "@/components/quick-actions/QuickActionsFAB";
import { MapLegend } from "@/components/layout/MapLegend";
import { PlacePopup } from "@/components/places/PlacePopup";
import { PlaceDetailsModal } from "@/components/places/PlaceDetailsModal";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";
import { useVenues } from "@/hooks/useVenues";
import { markerConfig } from "@/lib/marker-config";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { useAuthOptional } from "@/contexts/AuthContext";

function getDefaultLayers(): MapLayersState {
  return {
    osm: true,
    carto: false,
    satellite: false,
    radar: true,
    clubs: false,
    restaurants: true,
    cafes: false,
    cultural: false,
    favorites: true,
  };
}

export default function MapPage() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const [lang] = usePersistedLang(langParam);
  const auth = useAuthOptional();
  const [layers, setLayers] = useState<MapLayersState>(getDefaultLayers);
  const [selectedPlace, setSelectedPlace] = useState<(BeachClub | Restaurant | CulturalPlace | CafePlace) | null>(null);
  const [showDetailsForPlaceId, setShowDetailsForPlaceId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [mapApi, setMapApi] = useState<{
    resetView: () => void;
    locateUser: () => void;
    invalidateSize: () => void;
    flyTo: (lat: number, lng: number, zoom?: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
  } | null>(null);

  const { clubs, restaurants, cafes, cultural } = useVenues();
  const t = translations[lang];
  const userAvatarUrl = auth?.user?.user_metadata?.avatar_url as string | undefined;
  const searchablePlaces: SearchablePlace[] = [
    ...clubs.map((p) => ({
      ...p,
      category: "beachClubs" as const,
      searchText: [p.name, t.beachClubs, p.desc ?? ""].filter(Boolean).join(" "),
      icon: markerConfig.beachClub.icon,
    })),
    ...restaurants.map((p) => ({
      ...p,
      category: "restaurants" as const,
      searchText: [p.name, t.restaurants, p.desc ?? ""].filter(Boolean).join(" "),
      icon: markerConfig.restaurant.icon,
    })),
    ...cafes.map((p) => ({
      ...p,
      category: "coffeeShops" as const,
      searchText: [p.name, t.coffeeShops, p.desc ?? ""].filter(Boolean).join(" "),
      icon: markerConfig.cafe.icon,
    })),
    ...cultural.map((p) => ({
      ...p,
      category: "cultural" as const,
      searchText: [p.name, t.cultural, p.desc ?? ""].filter(Boolean).join(" "),
      icon: markerConfig.cultural.icon,
    })),
  ];

  // Request GPS on map page load; 5s timeout fallback to Tulum (handled by MapContainer)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const opts = { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 };
    let resolved = false;
    const resolveOnce = (loc: { lat: number; lng: number; accuracy: number } | null) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      if (loc) setUserLocation(loc);
    };
    const timeoutId = setTimeout(() => resolveOnce(null), 5000);
    const onPos = (position: GeolocationPosition) =>
      resolveOnce({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    navigator.geolocation.getCurrentPosition(onPos, () => resolveOnce(null), opts);
  }, []);

  useEffect(() => {
    if (mapApi && typeof navigator !== "undefined" && navigator.geolocation) {
      mapApi.locateUser();
    }
  }, [mapApi]);

  const [showLayersSheet, setShowLayersSheet] = useState(false);
  useEffect(() => {
    const open = () => setShowLayersSheet(true);
    window.addEventListener(OPEN_MAP_LAYERS_EVENT, open);
    return () => window.removeEventListener(OPEN_MAP_LAYERS_EVENT, open);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "#000000",
        overflow: "hidden",
      }}
    >
      <MapTopBar lang={lang} />

      {/* Full-screen map */}
      <div
        className="map-container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          background: "#000000",
          zIndex: 0,
        }}
      >
        <MapSearchBar
          places={searchablePlaces}
          lang={lang}
          onSelectPlace={setSelectedPlace}
          flyTo={mapApi?.flyTo}
          topOffset={72}
          fullWidth
        />
        <MapView
          lang={lang}
          layers={layers}
          onLayersChange={setLayers}
          userLocation={userLocation}
          onUserLocationChange={setUserLocation}
          onMapReady={setMapApi}
          onPlaceSelect={setSelectedPlace}
          userAvatarUrl={userAvatarUrl}
        />
        <div className="hidden md:block">
          <MapLegend lang={lang} />
        </div>
        <div className="hidden md:block">
          <LayerControls lang={lang} layers={layers} onLayersChange={setLayers} />
        </div>
        <MapLayersSheet
          lang={lang}
          layers={layers}
          onLayersChange={setLayers}
          isOpen={showLayersSheet}
          onClose={() => setShowLayersSheet(false)}
        />
        <div className="hidden sm:flex">
          <MapControls
            lang={lang}
            onRecenter={() => mapApi?.resetView()}
            onZoomIn={() => mapApi?.zoomIn?.()}
            onZoomOut={() => mapApi?.zoomOut?.()}
          />
        </div>
        <BottomNav lang={lang} />
      </div>

      {showDetailsForPlaceId && selectedPlace && selectedPlace.place_id === showDetailsForPlaceId ? (
        <PlaceDetailsModal
          placeId={showDetailsForPlaceId}
          placeName={selectedPlace.name}
          lang={lang}
          onClose={() => setShowDetailsForPlaceId(null)}
        />
      ) : selectedPlace ? (
        <PlacePopup
          place={selectedPlace}
          lang={lang}
          onClose={() => {
            setSelectedPlace(null);
            setShowDetailsForPlaceId(null);
          }}
          onMoreInfo={selectedPlace.place_id ? () => setShowDetailsForPlaceId(selectedPlace!.place_id!) : undefined}
        />
      ) : null}
    </div>
  );
}
