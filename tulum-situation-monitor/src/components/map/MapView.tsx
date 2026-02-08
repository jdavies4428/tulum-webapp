"use client";

import dynamic from "next/dynamic";
import type { MapLayersState, UserLocation } from "./MapContainer";
import type { Lang } from "@/lib/weather";
import type { BeachClub, Restaurant, CulturalPlace } from "@/types/place";

const MapContainer = dynamic(() => import("./MapContainer").then((m) => m.MapContainer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-bg-dark text-text-muted">
      Loading map…
    </div>
  ),
});

type PlaceForSelect = BeachClub | Restaurant | CulturalPlace;

interface MapViewProps {
  lang: Lang;
  layers: MapLayersState;
  onLayersChange?: (layers: MapLayersState) => void;
  userLocation?: UserLocation | null;
  onUserLocationChange?: (loc: UserLocation | null) => void;
  onMapReady?: (api: { resetView: () => void; locateUser: () => void; invalidateSize: () => void; flyTo: (lat: number, lng: number, zoom?: number) => void }) => void;
  onPlaceSelect?: (place: PlaceForSelect) => void;
}

export function MapView({
  lang,
  layers,
  onLayersChange,
  userLocation,
  onUserLocationChange,
  onMapReady,
  onPlaceSelect,
}: MapViewProps) {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        lang={lang}
        layers={layers}
        onLayersChange={onLayersChange}
        userLocation={userLocation}
        onUserLocationChange={onUserLocationChange}
        onMapReady={onMapReady}
        onPlaceSelect={onPlaceSelect}
      />
      <div className="map-overlay" aria-hidden />
    </div>
  );
}
