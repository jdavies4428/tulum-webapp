"use client";

import { useState, useMemo, useEffect } from "react";

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}
import type { MapLayersState } from "@/components/map/MapContainer";
import { MapView } from "@/components/map/MapView";
import { EnhancedSidebar } from "@/components/layout/EnhancedSidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { LayerControls } from "@/components/layout/LayerControls";
import { MapLegend } from "@/components/layout/MapLegend";
import { PlacesModal } from "@/components/places/PlacesModal";
import { useWeather } from "@/hooks/useWeather";
import { useTides } from "@/hooks/useTides";
import type { Lang } from "@/lib/weather";
import { formatTempFull, getWeatherDescription } from "@/lib/weather";

function getDefaultLayers(): MapLayersState {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour < 19; // 6am–7pm: satellite; otherwise dark (match original)
  return {
    carto: !isDaytime,
    satellite: isDaytime,
    radar: true,
    clubs: false,
    restaurants: true,
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [mapApi, setMapApi] = useState<MapApi | null>(null);

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

  // On mobile, start with sidebar collapsed so map gets full width and no white strip
  useEffect(() => {
    if (isMobileViewport()) setSidebarOpen(false);
  }, []);

  return (
    <main className="flex h-screen w-full min-w-0 max-w-full overflow-hidden">
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
        className="relative flex-1 min-w-0 transition-all duration-300 ease-out overflow-hidden"
        style={
          sidebarOpen
            ? {
                marginLeft: "400px",
                width: "calc(100% - 400px)",
              }
            : {
                position: "fixed",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                marginLeft: 0,
                width: "100%",
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
    </main>
  );
}
