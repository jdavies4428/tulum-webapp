"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { MapLayersState } from "@/components/map/MapContainer";
import { MapView } from "@/components/map/MapView";
import { StatusBar } from "@/components/layout/StatusBar";
import { LayerControls } from "@/components/layout/LayerControls";
import { MapLegend } from "@/components/layout/MapLegend";
import { PlacesModal } from "@/components/places/PlacesModal";
import { PlacePopup } from "@/components/places/PlacePopup";
import { PlaceDetailsModal } from "@/components/places/PlaceDetailsModal";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";
import { useWeather } from "@/hooks/useWeather";
import type { Lang } from "@/lib/weather";
import { translations } from "@/lib/i18n";

function getDefaultLayers(): MapLayersState {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour < 19;
  return {
    carto: !isDaytime,
    satellite: isDaytime,
    radar: true,
    clubs: false,
    restaurants: true,
    cafes: false,
    cultural: false,
    favorites: true,
  };
}

const LANGS: Lang[] = ["en", "es", "fr"];

export default function MapPage() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const [lang, setLang] = useState<Lang>(
    LANGS.includes(langParam as Lang) ? (langParam as Lang) : "en"
  );
  const [layers, setLayers] = useState<MapLayersState>(getDefaultLayers);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<(BeachClub | Restaurant | CulturalPlace | CafePlace) | null>(null);
  const [showDetailsForPlaceId, setShowDetailsForPlaceId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [mapApi, setMapApi] = useState<{ resetView: () => void; locateUser: () => void; invalidateSize: () => void } | null>(null);

  const { data: weatherData } = useWeather();

  // Request GPS as soon as map page loads (mobile often needs this before map is ready)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const opts = { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 };
    const onPos = (position: GeolocationPosition) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    };
    navigator.geolocation.getCurrentPosition(onPos, () => {}, opts);
  }, []);

  useEffect(() => {
    if (mapApi && typeof navigator !== "undefined" && navigator.geolocation) {
      mapApi.locateUser();
    }
  }, [mapApi]);

  const t = translations[lang];

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
      {/* Back button - top left */}
      <Link
        href="/"
        style={{
          position: "fixed",
          left: 16,
          top: 16,
          zIndex: 10001,
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "rgba(10, 4, 4, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#fff",
          fontSize: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
        }}
        aria-label="Back to Discover Tulum"
      >
        ←
      </Link>

      {/* Places list button - top right */}
      <button
        type="button"
        onClick={() => setPlacesOpen(true)}
        style={{
          position: "fixed",
          right: 16,
          top: 16,
          zIndex: 10001,
          padding: "12px 20px",
          borderRadius: 12,
          background: "var(--button-secondary)",
          border: "1px solid var(--border-emphasis)",
          color: "var(--text-primary)",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
        }}
      >
        📍 {t.places ?? "Places"}
      </button>

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
        <MapView
          lang={lang}
          layers={layers}
          onLayersChange={setLayers}
          userLocation={userLocation}
          onUserLocationChange={setUserLocation}
          onMapReady={setMapApi}
          onPlaceSelect={setSelectedPlace}
        />
        <MapLegend lang={lang} />
        <LayerControls lang={lang} layers={layers} onLayersChange={setLayers} />
        <StatusBar
          lang={lang}
          userLocation={userLocation}
          onReset={() => mapApi?.resetView()}
          lastUpdated={
            weatherData?.current?.time
              ? `Updated ${new Date(weatherData.current.time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
              : undefined
          }
        />
      </div>

      <PlacesModal
        lang={lang}
        isOpen={placesOpen}
        onClose={() => setPlacesOpen(false)}
        onPlaceSelect={(p) => {
          setSelectedPlace(p);
          setPlacesOpen(false);
        }}
      />
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
