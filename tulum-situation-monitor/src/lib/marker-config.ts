export type MarkerType = "beachClub" | "restaurant" | "cafe" | "cultural" | "userLocation";

export interface MarkerConfigItem {
  color: string;
  icon: string;
  glowColor: string;
  size: number;
  pulse?: boolean;
}

export const markerConfig: Record<MarkerType, MarkerConfigItem> = {
  beachClub: {
    color: "#FF9500",
    icon: "🏖️",
    glowColor: "rgba(255, 149, 0, 0.5)",
    size: 22,
  },
  restaurant: {
    color: "#50C878",
    icon: "🍽️",
    glowColor: "rgba(80, 200, 120, 0.5)",
    size: 22,
  },
  cafe: {
    color: "#8B4513",
    icon: "☕",
    glowColor: "rgba(139, 69, 19, 0.5)",
    size: 22,
  },
  cultural: {
    color: "#9B59B6",
    icon: "🎭",
    glowColor: "rgba(155, 89, 182, 0.5)",
    size: 22,
  },
  userLocation: {
    color: "#00D4D4",
    icon: "📍",
    glowColor: "rgba(0, 212, 212, 0.6)",
    size: 48,
    pulse: true,
  },
};

export interface PlaceForMarker {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  rating?: number | null;
  distance?: string | number;
  isOpen?: boolean;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Build HTML for an enhanced venue marker (Leaflet divIcon).
 */
export function getEnhancedMarkerHtml(
  type: Exclude<MarkerType, "userLocation">,
  place: PlaceForMarker,
  options?: {
    userLat?: number;
    userLng?: number;
    openLabel?: string;
    closedLabel?: string;
  }
): string {
  const config = markerConfig[type];
  const glowSize = config.size * 1.5;

  let distanceStr = place.distance != null ? String(place.distance) : "—";
  if (
    options?.userLat != null &&
    options?.userLng != null &&
    (place.distance == null || place.distance === "—")
  ) {
    const km = haversineKm(options.userLat, options.userLng, place.lat, place.lng);
    distanceStr = km < 1 ? `${(km * 1000).toFixed(0)}m` : `${km.toFixed(1)}km`;
  }

  const ratingStr = place.rating != null ? place.rating.toFixed(1) : "—";
  const isOpen = place.isOpen;
  const statusColor = isOpen === true ? "#10B981" : isOpen === false ? "#EF4444" : "rgba(255,255,255,0.5)";
  const statusText =
    isOpen === true
      ? (options?.openLabel ?? "Open")
      : isOpen === false
        ? (options?.closedLabel ?? "Closed")
        : "—";

  const placeId = place.id ?? `marker-${place.lat}-${place.lng}`;

  const pulseHtml = config.pulse
    ? `
    <div class="pulse-ring enhanced-marker-pulse" style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      width: ${config.size}px;
      height: ${config.size}px;
      border: 2px solid ${config.color};
      border-radius: 50% 50% 50% 0;
      animation: enhanced-marker-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      pointer-events: none;
    "></div>
  `
    : "";

  return `
    <div class="enhanced-marker">
      <div class="marker-container" data-place-id="${String(placeId)}">
        <div class="marker-glow" style="
          background: radial-gradient(circle, ${config.glowColor} 0%, transparent 70%);
          width: ${glowSize}px;
          height: ${glowSize}px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        "></div>

        <div class="marker-pin" style="
          background: ${config.color};
          width: ${config.size}px;
          height: ${config.size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          z-index: 2;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          <span class="marker-icon" style="
            transform: rotate(45deg);
            font-size: ${Math.max(10, config.size * 0.45)}px;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
          ">${config.icon}</span>
        </div>

        ${pulseHtml}

        <div class="marker-tooltip" style="
          position: absolute;
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%) scale(0.8);
          background: rgba(10, 4, 4, 0.98);
          backdrop-filter: blur(20px);
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        ">
          <div style="
            font-size: 14px;
            font-weight: 600;
            color: #FFFFFF;
            margin-bottom: 4px;
          ">${escapeHtml(place.name)}</div>
          <div style="
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span>⭐ ${ratingStr}</span>
            <span>•</span>
            <span>${distanceStr}</span>
            <span>•</span>
            <span style="color: ${statusColor}">${statusText}</span>
          </div>
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 12px;
            height: 12px;
            background: rgba(10, 4, 4, 0.98);
            border-right: 1px solid rgba(255, 255, 255, 0.15);
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          "></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Build HTML for animated user location marker with accuracy circle.
 * @param accuracyPx - Visual size of the accuracy circle in pixels (default 50)
 */
export function getUserLocationMarkerHtml(accuracyPx = 50): string {
  const size = accuracyPx;
  const containerSize = Math.max(size, 100);
  return `
    <div class="user-location-marker user-location-marker-animated" style="
      position: relative;
      width: ${containerSize}px;
      height: ${containerSize}px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div class="user-location-accuracy-circle" style="
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(0, 212, 212, 0.15);
        border: 2px solid rgba(0, 212, 212, 0.3);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: breathe 3s ease-in-out infinite;
      "></div>

      <div class="user-location-dot" style="
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #00D4D4;
        border: 4px solid white;
        box-shadow: 0 0 0 3px rgba(0, 212, 212, 0.3),
                    0 4px 12px rgba(0, 0, 0, 0.5);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
      "></div>

      <div class="user-location-pulse" style="
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid #00D4D4;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: pulse-user 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      "></div>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
