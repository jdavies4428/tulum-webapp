"use client";

import { useEffect, useRef } from "react";
import { TULUM_LAT, TULUM_LNG, DEFAULT_ZOOM } from "@/data/constants";
import type { PhotoCluster } from "@/lib/photo-map-utils";

interface IllustratedPhotoMapProps {
  clusters: PhotoCluster[];
  onClusterSelect: (cluster: PhotoCluster) => void;
}

export function IllustratedPhotoMap({ clusters, onClusterSelect }: IllustratedPhotoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof import("leaflet").map> | null>(null);
  const markersRef = useRef<ReturnType<typeof import("leaflet").marker>[]>([]);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const L = require("leaflet") as typeof import("leaflet");

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([TULUM_LAT, TULUM_LNG], DEFAULT_ZOOM);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "© OSM", maxZoom: 19 }
    );
    osm.addTo(map);

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const L = require("leaflet") as typeof import("leaflet");

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const cluster of clusters) {
      const html = `
        <div class="photo-cluster-marker" style="width:56px;height:56px;cursor:pointer;position:relative;transition:transform 0.2s;user-select:none">
          <div style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center">
            <svg width="56" height="56" viewBox="0 0 56 56" style="filter:drop-shadow(0 4px 12px rgba(0,0,0,0.25))">
              <path d="M28 4 C 16 4, 8 12, 8 24 C 8 38, 28 52, 28 52 C 28 52, 48 38, 48 24 C 48 12, 40 4, 28 4 Z" fill="#00CED1" stroke="#FFF" stroke-width="2.5"/>
            </svg>
            <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);background:#FFF;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#00CED1;border:2px solid #00CED1">📸${cluster.photos.length}</div>
          </div>
        </div>
      `;

      const marker = L.marker([cluster.latitude, cluster.longitude], {
        icon: L.divIcon({
          html,
          className: "",
          iconSize: [56, 56],
          iconAnchor: [28, 52],
        }),
      })
        .on("click", () => onClusterSelect(cluster))
        .addTo(map);

      const iconEl = (marker as unknown as { _icon?: HTMLElement })._icon;
      if (iconEl) {
        iconEl.addEventListener("mouseenter", () => {
          iconEl.style.transform = "scale(1.15) translateY(-4px)";
        });
        iconEl.addEventListener("mouseleave", () => {
          iconEl.style.transform = "scale(1) translateY(0)";
        });
      }

      markersRef.current.push(marker);
    }
  }, [clusters, onClusterSelect]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        background: "#E0F7FA",
      }}
    />
  );
}
