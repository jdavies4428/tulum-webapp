"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { MapLayersState } from "@/components/map/MapContainer";
import { MapView } from "@/components/map/MapView";
import { SituationHeader } from "@/components/layout/SituationHeader";
import { LayerControls } from "@/components/layout/LayerControls";
import { RightPanels } from "@/components/layout/RightPanels";
import { StatusBar } from "@/components/layout/StatusBar";
import { MapLegend } from "@/components/layout/MapLegend";
import { ListingsPanel } from "@/components/places/ListingsPanel";
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
  const [panelsVisible, setPanelsVisible] = useState(true);
  const [placesOpen, setPlacesOpen] = useState(false);
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

  const handleTogglePanels = useCallback(() => {
    setPanelsVisible((v) => !v);
  }, []);

  // Request GPS automatically when map is ready so user location shows without clicking Locate
  useEffect(() => {
    if (mapApi && typeof navigator !== "undefined" && navigator.geolocation) {
      mapApi.locateUser();
    }
  }, [mapApi]);

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <MapView
        lang={lang}
        layers={layers}
        onLayersChange={setLayers}
        userLocation={userLocation}
        onUserLocationChange={setUserLocation}
        onMapReady={setMapApi}
      />
      <SituationHeader lang={lang} sharePayload={sharePayload} onOpenPlaces={() => setPlacesOpen(true)} />
      <MapLegend lang={lang} />
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
      <LayerControls lang={lang} layers={layers} onLayersChange={setLayers} />
      {!panelsVisible && (
        <button
          type="button"
          onClick={handleTogglePanels}
          className="absolute right-3 top-3 z-[1001] rounded-md border border-border bg-bg-panel px-3 py-2 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md hover:bg-white/10"
        >
          🌴 Info
        </button>
      )}
      <div
        className={`absolute right-0 top-0 z-[1000] transition-opacity ${
          panelsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <RightPanels
          lang={lang}
          onLanguageChange={setLang}
          panelsVisible={panelsVisible}
          onTogglePanels={handleTogglePanels}
          onOpenPlaces={() => setPlacesOpen(true)}
          weatherData={weatherData}
          weatherLoading={weatherLoading}
          weatherError={weatherError}
          waterTemp={waterTemp}
          tide={tide}
          onWeatherRefresh={refetchWeather}
        />
      </div>
      <ListingsPanel lang={lang} isOpen={placesOpen} onClose={() => setPlacesOpen(false)} />
    </main>
  );
}
