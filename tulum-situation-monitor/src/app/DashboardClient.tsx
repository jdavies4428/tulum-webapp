"use client";

import { useState, useMemo, useEffect } from "react";
import type { MapLayersState } from "@/components/map/MapContainer";
import { MapView } from "@/components/map/MapView";
import { EnhancedSidebar } from "@/components/layout/EnhancedSidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { LayerControls } from "@/components/layout/LayerControls";
import { MapLegend } from "@/components/layout/MapLegend";
import { PlacesModal } from "@/components/places/PlacesModal";
import { PlacePopup } from "@/components/places/PlacePopup";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";
import { useWeather } from "@/hooks/useWeather";
import { useTides } from "@/hooks/useTides";
import type { Lang } from "@/lib/weather";
import { formatTempFull, getWeatherDescription } from "@/lib/weather";

const MOBILE_BREAKPOINT = 768;

function getDefaultLayers(): MapLayersState {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour < 19; // 6am–7pm: satellite; otherwise dark (match original)
  return {
    carto: !isDaytime,
    satellite: isDaytime,
    radar: true,
    clubs: false,
    restaurants: true,
    cafes: false,
    cultural: false,
  };
}

export interface MapApi {
  resetView: () => void;
  locateUser: () => void;
}

export function DashboardClient() {
  const [lang, setLang] = useState<Lang>("en");
  const [layers, setLayers] = useState<MapLayersState>(getDefaultLayers);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<(BeachClub | Restaurant | CulturalPlace | CafePlace) | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [mapApi, setMapApi] = useState<MapApi | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { data: weatherData, waterTemp, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useWeather();
  const tide = useTides();

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

  // Fix white background and body styles
  useEffect(() => {
    document.body.style.backgroundColor = "#000000";
    document.documentElement.style.backgroundColor = "#000000";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
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
        onLocateUser={() => mapApi?.locateUser()}
        sharePayload={sharePayload}
        weatherData={weatherData}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        waterTemp={waterTemp}
        tide={tide}
        onWeatherRefresh={refetchWeather}
      />
      <div
        className="map-container transition-all duration-300 ease-out overflow-hidden"
        style={
          isMobile
            ? {
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                background: "#000000",
                zIndex: 0,
              }
            : sidebarOpen
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
      <PlacesModal lang={lang} isOpen={placesOpen} onClose={() => setPlacesOpen(false)} />
      {selectedPlace && (
        <PlacePopup place={selectedPlace} lang={lang} onClose={() => setSelectedPlace(null)} />
      )}
    </div>
  );
}
