"use client";

import { useState } from "react";
import type { BeachClub, Restaurant, CulturalPlace, CafePlace } from "@/types/place";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

type PlaceForPopup = BeachClub | Restaurant | CulturalPlace | CafePlace;

interface PlacePopupProps {
  place: PlaceForPopup;
  lang: Lang;
  onClose: () => void;
  onMoreInfo?: () => void;
}

function ActionButton({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: string;
  label: string;
  color: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "12px",
        borderRadius: "10px",
        background: color,
        border: "none",
        color: "white",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        textDecoration: "none",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        transition: "transform 0.2s",
      }}
    >
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span style={{ fontSize: "11px" }}>{label}</span>
    </a>
  );
}

export function PlacePopup({ place, lang, onClose, onMoreInfo }: PlacePopupProps) {
  const t = translations[lang] as Record<string, string>;
  const desc = lang === "es" ? place.descEs ?? place.desc : lang === "fr" ? place.descFr ?? place.desc : place.desc;
  const websiteLabel = t.website ?? "Website";
  const navigateLabel = t.navigate ?? "Go";
  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1));
  const mapsUrl = isIOS
    ? `https://maps.apple.com/?daddr=${place.lat},${place.lng}&q=${encodeURIComponent(place.name)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 9998,
          animation: "placePopupFadeIn 0.2s ease-out",
        }}
        aria-hidden
      />

      {/* Popup */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(10, 4, 4, 0.98)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          padding: "20px",
          minWidth: "320px",
          maxWidth: "400px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
          zIndex: 9999,
          animation: "placePopupSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            color: "#FFF",
            fontSize: "18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Title */}
        <h3
          style={{
            color: "#FFD700",
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "8px",
            marginTop: 0,
            paddingRight: "32px",
          }}
        >
          {place.name}
        </h3>

        {/* Description */}
        <p
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "14px",
            lineHeight: 1.5,
            marginBottom: "16px",
          }}
        >
          {desc}
        </p>

        {/* Action buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
            gap: "8px",
          }}
        >
          {place.url && (
            <ActionButton href={place.url} icon="🌐" label={websiteLabel} color="#00D4D4" />
          )}
          {place.whatsapp && (
            <ActionButton
              href={`tel:${place.whatsapp.replace(/\D/g, "")}`}
              icon="📞"
              label="Call"
              color="#4A90E2"
            />
          )}
          {place.whatsapp && (
            <ActionButton
              href={`https://wa.me/${place.whatsapp.replace(/\D/g, "")}`}
              icon="💬"
              label="Chat"
              color="#25D366"
            />
          )}
          <ActionButton href={mapsUrl} icon="🗺️" label={navigateLabel} color="#FF9500" />
          {place.place_id && onMoreInfo && (
            <button
              type="button"
              onClick={onMoreInfo}
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "var(--button-primary)",
                border: "none",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                gridColumn: "1 / -1",
              }}
            >
              More Info
            </button>
          )}
        </div>
      </div>
    </>
  );
}
