"use client";

import dynamic from "next/dynamic";
import type { MapLayersState, UserLocation } from "./MapContainer";
import type { Lang } from "@/lib/weather";

const MapContainer = dynamic(() => import("./MapContainer").then((m) => m.MapContainer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-bg-dark text-text-muted">
      Loading map…
    </div>
  ),
});

interface MapViewProps {
  lang: Lang;
  layers: MapLayersState;
  onLayersChange?: (layers: MapLayersState) => void;
  userLocation?: UserLocation | null;
  onUserLocationChange?: (loc: UserLocation | null) => void;
  onMapReady?: (api: { resetView: () => void; locateUser: () => void }) => void;
}

export function MapView({
  lang,
  layers,
  onLayersChange,
  userLocation,
  onUserLocationChange,
  onMapReady,
}: MapViewProps) {
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer
        lang={lang}
        layers={layers}
        onLayersChange={onLayersChange}
        userLocation={userLocation}
        onUserLocationChange={onUserLocationChange}
        onMapReady={onMapReady}
      />
    </div>
  );
}
