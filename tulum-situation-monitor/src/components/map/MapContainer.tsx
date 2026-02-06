"use client";

import { useEffect, useRef, useCallback } from "react";
import { TULUM_LAT, TULUM_LNG, DEFAULT_ZOOM } from "@/data/constants";
import { useVenues } from "@/hooks/useVenues";
import type { Lang } from "@/lib/weather";
import { translations } from "@/lib/i18n";

export type MapLayerId = "carto" | "satellite" | "radar" | "clubs" | "restaurants" | "cultural";

export interface MapLayersState {
  carto: boolean;
  satellite: boolean;
  radar: boolean;
  clubs: boolean;
  restaurants: boolean;
  cultural: boolean;
}

const DEFAULT_LAYERS: MapLayersState = {
  carto: true,
  satellite: false,
  radar: true,
  clubs: false,
  restaurants: true,
  cultural: false,
};

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

interface MapContainerProps {
  lang: Lang;
  layers?: Partial<MapLayersState>;
  onLayersChange?: (layers: MapLayersState) => void;
  userLocation?: UserLocation | null;
  onUserLocationChange?: (loc: UserLocation | null) => void;
  onMapReady?: (api: { resetView: () => void; locateUser: () => void }) => void;
  className?: string;
}

export function MapContainer({
  lang,
  layers = DEFAULT_LAYERS,
  onLayersChange,
  userLocation = null,
  onUserLocationChange,
  onMapReady,
  className = "",
}: MapContainerProps) {
  const { clubs, restaurants, cultural } = useVenues();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const layersRef = useRef<Record<string, unknown>>({});
  const markersRef = useRef<unknown>(null);
  const userMarkerRef = useRef<unknown>(null);
  const accuracyCircleRef = useRef<unknown>(null);
  const tulumMarkersRef = useRef<unknown[]>([]);
  const watchIdRef = useRef<number | null>(null);

  const initMap = useCallback(() => {
    if (!containerRef.current || typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([TULUM_LAT, TULUM_LNG], DEFAULT_ZOOM);
    L.control.attribution({ position: "bottomright" }).addTo(map);
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    const carto = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { attribution: "© OpenStreetMap, © CARTO", subdomains: "abcd", maxZoom: 20 }
    );
    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "© Esri", maxZoom: 19 }
    );
    const radar = L.tileLayer(
      "https://tilecache.rainviewer.com/v2/radar/1704067200/256/{z}/{x}/{y}/6/1_1.png",
      { attribution: "© RainViewer", opacity: 0.6, maxZoom: 18 }
    );

    layersRef.current.carto = carto;
    layersRef.current.satellite = satellite;
    layersRef.current.radar = radar;
    markersRef.current = L.layerGroup().addTo(map) as unknown;
    mapRef.current = map as unknown;

    const tulumDot = L.circleMarker([TULUM_LAT, TULUM_LNG], {
      radius: 8,
      fillColor: "#ff3b30",
      fillOpacity: 1,
      color: "#fff",
      weight: 2,
    }).addTo(map);
    tulumDot.bindPopup("<b>Tulum Centro</b>");
    const tulumRing = L.circle([TULUM_LAT, TULUM_LNG], {
      radius: 5000,
      fillColor: "#ff3b30",
      fillOpacity: 0.1,
      color: "#ff3b30",
      weight: 2,
      dashArray: "5, 10",
    }).addTo(map);
    tulumMarkersRef.current = [tulumDot, tulumRing];

    carto.addTo(map);
    return () => {
      (tulumMarkersRef.current as { remove: () => void }[]).forEach((layer) => layer.remove());
      tulumMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
      layersRef.current = {};
    };
  }, []);

  useEffect(() => {
    initMap();
    return () => {
      if (watchIdRef.current != null && typeof navigator !== "undefined" && navigator.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      const map = mapRef.current as { remove: () => void } | null;
      if (map?.remove) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, [initMap]);

  // Expose resetView and locateUser to parent; request GPS automatically when map is ready
  useEffect(() => {
    const map = mapRef.current as { setView: (c: [number, number], z: number) => void } | null;
    if (!map?.setView || !onMapReady) return;
    const locateUser = () => {
      if (typeof navigator === "undefined" || !navigator.geolocation) return;
      const geoOptions = { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 };
      const onPos = (position: GeolocationPosition) => {
        onUserLocationChange?.({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      };
      const onErr = () => onUserLocationChange?.(null);
      navigator.geolocation.getCurrentPosition(onPos, onErr, geoOptions);
      watchIdRef.current = navigator.geolocation.watchPosition(onPos, onErr, geoOptions);
    };
    onMapReady({
      resetView: () => map.setView([TULUM_LAT, TULUM_LNG], DEFAULT_ZOOM),
      locateUser,
    });
    locateUser();
  }, [onMapReady, onUserLocationChange]);

  // Draw or update user location marker when userLocation changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");
    const removeUserLayers = () => {
      const marker = userMarkerRef.current as L.CircleMarker | undefined;
      const circle = accuracyCircleRef.current as L.Circle | undefined;
      if (marker?.remove) marker.remove();
      if (circle?.remove) circle.remove();
      userMarkerRef.current = null;
      accuracyCircleRef.current = null;
    };
    if (!userLocation) {
      removeUserLayers();
      return;
    }
    const m = map as L.Map;
    if (!userMarkerRef.current) {
      const marker = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 10,
        fillColor: "#00d4ff",
        fillOpacity: 1,
        color: "#ffffff",
        weight: 3,
      }).addTo(m);
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: userLocation.accuracy,
        fillColor: "#00d4ff",
        fillOpacity: 0.1,
        color: "#00d4ff",
        weight: 1,
      }).addTo(m);
      userMarkerRef.current = marker;
      accuracyCircleRef.current = circle;
      m.setView([userLocation.lat, userLocation.lng], 14);
    } else {
      (userMarkerRef.current as L.CircleMarker).setLatLng([userLocation.lat, userLocation.lng]);
      const acc = accuracyCircleRef.current as L.Circle | undefined;
      if (acc) {
        acc.setLatLng([userLocation.lat, userLocation.lng]);
        acc.setRadius(userLocation.accuracy);
      }
    }
    return removeUserLayers;
  }, [userLocation]);

  // Base layer toggles (only one of carto/satellite; radar is overlay)
  useEffect(() => {
    (layersRef.current as Record<string, unknown>).radarVisible = layers.radar;
    const map = mapRef.current;
    if (!map || !layersRef.current.carto) return;
    const carto = layersRef.current.carto as { addTo: (m: unknown) => unknown; remove: () => void };
    const satellite = layersRef.current.satellite as { addTo: (m: unknown) => unknown; remove: () => void };
    const radar = layersRef.current.radar as { addTo: (m: unknown) => unknown; remove: () => void };
    if (layers.carto) {
      carto.addTo(map as unknown);
      satellite.remove();
    } else {
      satellite.addTo(map as unknown);
      carto.remove();
    }
    if (layers.radar) radar.addTo(map as unknown);
    else radar.remove();
  }, [layers.carto, layers.satellite, layers.radar]);

  // Radar tile URL refresh every 10 min (match original updateRadarTiles)
  useEffect(() => {
    const L = require("leaflet") as typeof import("leaflet");
    const intervalId = setInterval(() => {
      const map = mapRef.current as L.Map | null;
      const currentRadar = layersRef.current.radar as L.TileLayer | undefined;
      if (!map || !currentRadar) return;
      const timestamp = Math.floor(Date.now() / 1000 / 600) * 600;
      const newUrl = `https://tilecache.rainviewer.com/v2/radar/${timestamp}/256/{z}/{x}/{y}/6/1_1.png`;
      const newRadar = L.tileLayer(newUrl, {
        attribution: "© RainViewer",
        opacity: 0.6,
        maxZoom: 18,
      });
      map.removeLayer(currentRadar);
      layersRef.current.radar = newRadar;
      const radarVisible = (layersRef.current as Record<string, unknown>).radarVisible;
      if (radarVisible) newRadar.addTo(map);
    }, 600000);
    return () => clearInterval(intervalId);
  }, []);

  // Marker layers
  useEffect(() => {
    const group = markersRef.current as { clearLayers: () => void; addTo: (l: unknown) => unknown } | null;
    const map = mapRef.current;
    if (!group?.clearLayers || !map) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");
    group.clearLayers();
    const t = translations[lang];

    const clubIcon = L.divIcon({
      className: "club-marker",
      html: '<div style="width:24px;height:24px;background:linear-gradient(135deg,#ffd600,#e6c200);border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(255,214,0,0.5);display:flex;align-items:center;justify-content:center;font-size:12px;">🏖️</div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
    const restaurantIcon = L.divIcon({
      className: "restaurant-marker",
      html: '<div style="width:24px;height:24px;background:linear-gradient(135deg,#9b59b6,#8e44ad);border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(155,89,182,0.5);display:flex;align-items:center;justify-content:center;font-size:12px;">🍽️</div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
    const culturalIcon = L.divIcon({
      className: "cultural-marker",
      html: '<div style="width:24px;height:24px;background:linear-gradient(135deg,#a0a0a0,#808080);border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(160,160,160,0.5);display:flex;align-items:center;justify-content:center;font-size:12px;">🎭</div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });

    const desc = (item: { desc?: string; descEs?: string; descFr?: string }) =>
      lang === "es"
        ? item.descEs ?? item.desc ?? ""
        : lang === "fr"
          ? ("descFr" in item ? (item as { descFr?: string }).descFr : item.desc) ?? ""
          : item.desc ?? "";
    const popup = (name: string, d: string, url: string, whatsapp: string, lat: number, lng: number) => {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const webLink = url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="club-link website">🌐 ${t.website}</a>` : "";
      const waLink = whatsapp
        ? `<a href="https://wa.me/${whatsapp.replace(/\D/g, "")}" target="_blank" rel="noopener noreferrer" class="club-link whatsapp">💬</a>`
        : "";
      return `
        <div class="club-popup">
          <h3>${name}</h3>
          <p class="club-desc">${d}</p>
          <div class="club-links">
            ${webLink}
            ${waLink}
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="club-link maps">↗️</a>
          </div>
        </div>
      `;
    };

    const addToGroup = (marker: ReturnType<typeof L.marker>) => {
      (marker as { addTo: (t: unknown) => unknown }).addTo(group);
    };
    if (layers.clubs) {
      clubs.forEach((club) => {
        const m = L.marker([club.lat, club.lng], { icon: clubIcon });
        m.bindPopup(popup(club.name, desc(club), club.url ?? "", club.whatsapp ?? "", club.lat, club.lng));
        addToGroup(m);
      });
    }
    if (layers.restaurants) {
      restaurants.forEach((r) => {
        const m = L.marker([r.lat, r.lng], { icon: restaurantIcon });
        m.bindPopup(popup(r.name, desc(r), r.url ?? "", r.whatsapp ?? "", r.lat, r.lng));
        addToGroup(m);
      });
    }
    if (layers.cultural) {
      cultural.forEach((c) => {
        const m = L.marker([c.lat, c.lng], { icon: culturalIcon });
        m.bindPopup(popup(c.name, desc(c), c.url ?? "", c.whatsapp ?? "", c.lat, c.lng));
        addToGroup(m);
      });
    }
  }, [lang, layers.clubs, layers.restaurants, layers.cultural, clubs, restaurants, cultural]);

  return <div ref={containerRef} className={`h-full w-full ${className}`} id="map" />;
}
