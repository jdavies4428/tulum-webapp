"use client";

import { useEffect, useRef, useCallback } from "react";
import { TULUM_LAT, TULUM_LNG, DEFAULT_ZOOM } from "@/data/constants";
import { useVenues } from "@/hooks/useVenues";
import { getEnhancedMarkerHtml } from "@/lib/marker-config";
import type { Lang } from "@/lib/weather";
import { translations } from "@/lib/i18n";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";

export type MapLayerId = "carto" | "satellite" | "radar" | "clubs" | "restaurants" | "cafes" | "cultural" | "favorites";

export interface MapLayersState {
  carto: boolean;
  satellite: boolean;
  radar: boolean;
  clubs: boolean;
  restaurants: boolean;
  cafes: boolean;
  cultural: boolean;
  favorites: boolean;
}

const DEFAULT_LAYERS: MapLayersState = {
  carto: true,
  satellite: false,
  radar: true,
  clubs: false,
  restaurants: true,
  cafes: true,
  cultural: true,
  favorites: false,
};

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

type PlaceForSelect = BeachClub | Restaurant | CulturalPlace | CafePlace;

interface MapContainerProps {
  lang: Lang;
  layers?: Partial<MapLayersState>;
  onLayersChange?: (layers: MapLayersState) => void;
  userLocation?: UserLocation | null;
  onUserLocationChange?: (loc: UserLocation | null) => void;
  onMapReady?: (api: { resetView: () => void; locateUser: () => void; invalidateSize: () => void }) => void;
  onPlaceSelect?: (place: PlaceForSelect) => void;
  className?: string;
}

export function MapContainer({
  lang,
  layers = DEFAULT_LAYERS,
  onLayersChange,
  userLocation = null,
  onUserLocationChange,
  onMapReady,
  onPlaceSelect,
  className = "",
}: MapContainerProps) {
  const { clubs, restaurants, cafes, cultural } = useVenues();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const layersRef = useRef<Record<string, unknown>>({});
  const markersRef = useRef<unknown>(null);
  const userMarkerRef = useRef<unknown>(null);
  const accuracyCircleRef = useRef<unknown>(null);
  const tulumMarkersRef = useRef<unknown[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const userLocationRef = useRef<UserLocation | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  userLocationRef.current = userLocation;

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

    // Remove any leftover tulumRingPane from previous versions (large red circle)
    const ringPane = map.getPane("tulumRingPane");
    if (ringPane?.parentNode) ringPane.parentNode.removeChild(ringPane);

    // Dot pane: above markers, interactive (clickable for popup)
    if (!map.getPane("tulumDotPane")) {
      map.createPane("tulumDotPane");
      map.getPane("tulumDotPane")!.style.zIndex = "700";
    }

    const tulumDot = L.circleMarker([TULUM_LAT, TULUM_LNG], {
      pane: "tulumDotPane",
      radius: 8,
      fillColor: "#ff3b30",
      fillOpacity: 1,
      color: "#fff",
      weight: 2,
    }).addTo(map);
    tulumDot.bindPopup("<b>Tulum Centro</b>");
    tulumMarkersRef.current = [tulumDot];

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
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let timeoutIds: ReturnType<typeof setTimeout>[] = [];
    const MAX_INIT_RETRIES = 25; // ~2.5s max wait for container size

    function runInit(retryCount: number) {
      if (cancelled) return;
      const container = containerRef.current;
      // Doc Solution 4: do not init until container has non-zero size (avoids black strip on mobile)
      if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          if (retryCount < MAX_INIT_RETRIES) {
            timeoutIds.push(window.setTimeout(() => runInit(retryCount + 1), 100));
            return;
          }
        }
      }
      initMap();
      const map = mapRef.current as { invalidateSize?: () => void; remove?: () => void } | null;
      if (!map?.invalidateSize) return;

      const invalidate = () => map.invalidateSize?.();

      // ResizeObserver: recalc map when container size changes (fixes mobile when layout settles)
      if (container && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => invalidate());
        resizeObserver.observe(container);
      }

      // Doc Solution 4 & 5: resize + orientationchange so map redraws (e.g. rotation, keyboard)
      const onResizeOrOrientation = () => invalidate();
      window.addEventListener("resize", onResizeOrOrientation);
      window.addEventListener("orientationchange", onResizeOrOrientation);
      resizeCleanupRef.current = () => {
        window.removeEventListener("resize", onResizeOrOrientation);
        window.removeEventListener("orientationchange", onResizeOrOrientation);
        resizeCleanupRef.current = null;
      };

      // Delayed invalidates so map corrects after mobile layout
      [100, 400, 800, 1500].forEach((ms) => {
        timeoutIds.push(window.setTimeout(invalidate, ms));
      });
    }

    // Doc Solution 4: wait for layout then init (only if container has size)
    const rafId1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) runInit(0);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId1);
      timeoutIds.forEach((id) => clearTimeout(id));
      timeoutIds = [];
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
      resizeObserver?.disconnect();
      resizeObserver = null;
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
    const mapWithInvalidate = map as { invalidateSize?: () => void };
    onMapReady({
      resetView: () => {
        const loc = userLocationRef.current;
        if (loc) {
          map.setView([loc.lat, loc.lng], 14);
        } else {
          map.setView([TULUM_LAT, TULUM_LNG], DEFAULT_ZOOM);
        }
      },
      locateUser,
      invalidateSize: () => mapWithInvalidate.invalidateSize?.(),
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
        fillColor: "#00D4D4",
        fillOpacity: 1,
        color: "#ffffff",
        weight: 2,
      }).addTo(m);
      const radiusM = Math.min(Math.max(userLocation.accuracy, 10), 500);
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: radiusM,
        fillColor: "#00D4D4",
        fillOpacity: 0.1,
        color: "#00D4D4",
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
        acc.setRadius(Math.min(Math.max(userLocation.accuracy, 10), 500));
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
    const userLat = userLocation?.lat;
    const userLng = userLocation?.lng;

    const desc = (item: { desc?: string; descEs?: string; descFr?: string }) =>
      lang === "es"
        ? item.descEs ?? item.desc ?? ""
        : lang === "fr"
          ? ("descFr" in item ? (item as { descFr?: string }).descFr : item.desc) ?? ""
          : item.desc ?? "";
    const escapeHtml = (s: string) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    const navigateLabel = t.navigate ?? "Go";
    const popup = (name: string, d: string, url: string, whatsapp: string, lat: number, lng: number) => {
      const displayName = (name ?? "").trim() || "Venue";
      const safeName = escapeHtml(displayName);
      const safeDesc = escapeHtml(d ?? "");
      const isIOS =
        typeof navigator !== "undefined" &&
        (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1));
      const encodedName = encodeURIComponent(displayName);
      const mapsUrl = isIOS
        ? `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      const webLink = url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="club-link website">🌐 ${escapeHtml(t.website ?? "Website")}</a>` : "";
      const callLink = whatsapp
        ? `<a href="tel:${whatsapp.replace(/\D/g, "")}" class="club-link call">📞</a>`
        : "";
      const waLink = whatsapp
        ? `<a href="https://wa.me/${whatsapp.replace(/\D/g, "")}" target="_blank" rel="noopener noreferrer" class="club-link whatsapp">💬</a>`
        : "";
      return `
        <div class="club-popup">
          <h3>${safeName}</h3>
          <p class="club-desc">${safeDesc}</p>
          <div class="club-links">
            ${webLink}
            ${callLink}
            ${waLink}
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="club-link maps">🧭 ${navigateLabel}</a>
          </div>
        </div>
      `;
    };

    const addToGroup = (marker: ReturnType<typeof L.marker>) => {
      (marker as { addTo: (t: unknown) => unknown }).addTo(group);
    };

    const createVenueIcon = (
      type: "beachClub" | "restaurant" | "cafe" | "cultural",
      place: { id?: string; name: string; lat: number; lng: number; rating?: number | null }
    ) =>
      L.divIcon({
        className: "enhanced-marker-wrapper",
        html: getEnhancedMarkerHtml(type, place, {
          userLat,
          userLng,
        }),
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -30],
      });

    if (layers.clubs) {
      clubs.forEach((club) => {
        const icon = createVenueIcon("beachClub", club);
        const m = L.marker([club.lat, club.lng], { icon });
        m.bindPopup(popup(club.name, desc(club), club.url ?? "", club.whatsapp ?? "", club.lat, club.lng), { maxWidth: 260 });
        m.on("click", () => onPlaceSelect?.(club));
        addToGroup(m);
      });
    }
    if (layers.restaurants) {
      restaurants.forEach((r) => {
        const icon = createVenueIcon("restaurant", r);
        const m = L.marker([r.lat, r.lng], { icon });
        m.bindPopup(popup(r.name, desc(r), r.url ?? "", r.whatsapp ?? "", r.lat, r.lng), { maxWidth: 260 });
        m.on("click", () => onPlaceSelect?.(r));
        addToGroup(m);
      });
    }
    if (layers.cafes) {
      cafes.forEach((c) => {
        const icon = createVenueIcon("cafe", c);
        const m = L.marker([c.lat, c.lng], { icon });
        m.bindPopup(popup(c.name, desc(c), c.url ?? "", c.whatsapp ?? "", c.lat, c.lng), { maxWidth: 260 });
        m.on("click", () => onPlaceSelect?.(c));
        addToGroup(m);
      });
    }
    if (layers.cultural) {
      cultural.forEach((c) => {
        const icon = createVenueIcon("cultural", c);
        const m = L.marker([c.lat, c.lng], { icon });
        m.bindPopup(popup(c.name, desc(c), c.url ?? "", c.whatsapp ?? "", c.lat, c.lng), { maxWidth: 260 });
        m.on("click", () => onPlaceSelect?.(c));
        addToGroup(m);
      });
    }

    // On mobile, map may have had 0 size when first painted; invalidate so markers position correctly
    const mapInstance = map as { invalidateSize?: () => void };
    if (typeof mapInstance.invalidateSize === "function") {
      requestAnimationFrame(() => mapInstance.invalidateSize?.());
      // Delayed second invalidate so layout has settled (helps mobile when container size was 0 at first paint)
      const t = window.setTimeout(() => mapInstance.invalidateSize?.(), 400);
      return () => window.clearTimeout(t);
    }
  }, [lang, layers.clubs, layers.restaurants, layers.cafes, layers.cultural, clubs, restaurants, cafes, cultural, userLocation, onPlaceSelect]);

  return <div ref={containerRef} className={`h-full w-full ${className}`} id="map" />;
}
