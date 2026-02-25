"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { MapLayersState } from "@/components/map/MapContainer";
import { MapView } from "@/components/map/MapView";
import { MapSearchBar, type SearchablePlace } from "@/components/map/MapSearchBar";
import { EnhancedSidebar } from "@/components/layout/EnhancedSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatusBar } from "@/components/layout/StatusBar";
import { LayerControls } from "@/components/layout/LayerControls";
import { MapLegend } from "@/components/layout/MapLegend";
import { PlacePopup } from "@/components/places/PlacePopup";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";
import { useVenues } from "@/hooks/useVenues";
import { useWeather } from "@/hooks/useWeather";
import { markerConfig } from "@/lib/marker-config";
import { translations } from "@/lib/i18n";
import { useTides } from "@/hooks/useTides";
import type { Lang } from "@/lib/weather";
import { formatTempFull, getWeatherDescription } from "@/lib/weather";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { useThrottle } from "@/hooks/useThrottle";

// Code-split large modals for better initial bundle size (~50KB+ savings)
const PlacesModal = dynamic(
  () => import("@/components/places/PlacesModal").then((mod) => ({ default: mod.PlacesModal })),
  { ssr: false, loading: () => null }
);

const PlaceDetailsModal = dynamic(
  () => import("@/components/places/PlaceDetailsModal").then((mod) => ({ default: mod.PlaceDetailsModal })),
  { ssr: false, loading: () => null }
);

const MOBILE_BREAKPOINT = 768;

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

export interface MapApi {
  resetView: () => void;
  locateUser: () => void;
  invalidateSize: () => void;
  flyTo?: (lat: number, lng: number, zoom?: number) => void;
}

export function DashboardClient() {
  const router = useRouter();
  const [lang, setLang] = usePersistedLang(null);
  const [layers, setLayers] = useState<MapLayersState>(getDefaultLayers);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<(BeachClub | Restaurant | CulturalPlace | CafePlace) | null>(null);
  const [showDetailsForPlaceId, setShowDetailsForPlaceId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [mapApi, setMapApi] = useState<MapApi | null>(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  );

  // Mobile breakpoint check function
  const checkMobile = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);

  // Throttle resize handler to reduce unnecessary re-renders (250ms delay)
  const throttledCheck = useThrottle(checkMobile, 250);

  useEffect(() => {
    window.addEventListener("resize", throttledCheck);
    return () => window.removeEventListener("resize", throttledCheck);
  }, [throttledCheck]);

  // Ensure Favorites and Restaurants are visible on mobile (match default venue layers)
  useEffect(() => {
    if (isMobile) {
      setLayers((prev) => (prev.favorites && prev.restaurants ? prev : { ...prev, favorites: true, restaurants: true }));
    }
  }, [isMobile]);

  const { clubs, restaurants, cafes, cultural } = useVenues();
  const { data: weatherData, waterTemp, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useWeather();
  const tide = useTides();

  const t = translations[lang];
  const searchablePlaces: SearchablePlace[] = [
    ...clubs.map((p) => ({ ...p, category: "beachClubs" as const, searchText: [p.name, t.beachClubs, p.desc ?? ""].filter(Boolean).join(" "), icon: markerConfig.beachClub.icon })),
    ...restaurants.map((p) => ({ ...p, category: "restaurants" as const, searchText: [p.name, t.restaurants, p.desc ?? ""].filter(Boolean).join(" "), icon: markerConfig.restaurant.icon })),
    ...cafes.map((p) => ({ ...p, category: "coffeeShops" as const, searchText: [p.name, t.coffeeShops, p.desc ?? ""].filter(Boolean).join(" "), icon: markerConfig.cafe.icon })),
    ...cultural.map((p) => ({ ...p, category: "cultural" as const, searchText: [p.name, t.cultural, p.desc ?? ""].filter(Boolean).join(" "), icon: markerConfig.cultural.icon })),
  ];

  const sharePayload = useMemo(() => {
    if (!weatherData?.current) return null;
    const c = weatherData.current;
    const condition = getWeatherDescription(c.weather_code, lang).desc;
    const temp = formatTempFull(c.temperature_2m, lang);
    return { temp, condition };
  }, [weatherData, lang]);

  // Request GPS automatically when map is ready so user location shows without clicking Locate
  useEffect(() => {
    if (mapApi && typeof navigator !== "undefined" && navigator.geolocation) {
      mapApi.locateUser();
    }
  }, [mapApi]);

  // Body styles (margin, overflow)
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#000000",
        position: "relative",
      }}
    >
      <EnhancedSidebar
        isCollapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        lang={lang}
        onLanguageChange={setLang}
        onOpenPlaces={() => setPlacesOpen(true)}
        onOpenMap={() => router.push(`/map?lang=${lang}`)}
        onLocateUser={() => mapApi?.locateUser()}
        sharePayload={sharePayload}
        weatherData={weatherData}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        waterTemp={waterTemp}
        tide={tide}
        onWeatherRefresh={refetchWeather}
      />
      {isMobile && <BottomNav lang={lang} variant="light" fixed />}
      {/* On mobile, map is on /map page to avoid black box from sliding layout; desktop keeps map here */}
      {!isMobile && (
        <div
          className="map-container transition-all duration-300 ease-out overflow-hidden"
          style={
            sidebarOpen
              ? {
                  position: "absolute",
                  top: 0,
                  left: 400,
                  right: 0,
                  bottom: 0,
                  background: "#000000",
                  zIndex: 0,
                }
              : {
                  position: "fixed",
                  inset: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "#000000",
                  zIndex: 50,
                }
          }
        >
          <MapSearchBar
            places={searchablePlaces}
            lang={lang}
            onSelectPlace={setSelectedPlace}
            flyTo={mapApi?.flyTo}
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
      )}
      <PlacesModal
        lang={lang}
        isOpen={placesOpen}
        onClose={() => setPlacesOpen(false)}
        onPlaceSelect={(p) => {
          setSelectedPlace(p);
        }}
        dimmed={!!selectedPlace}
        userLocation={userLocation}
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
          onMoreInfo={selectedPlace.place_id ? () => setShowDetailsForPlaceId(selectedPlace.place_id!) : undefined}
        />
      ) : null}
    </div>
  );
}
