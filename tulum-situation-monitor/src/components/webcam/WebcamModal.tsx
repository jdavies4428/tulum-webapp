"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { spacing, radius } from "@/lib/design-tokens";

const WEBCAMS = [
  {
    id: "tulum",
    name: "Casa Malca",
    icon: "🏖️",
    url: "https://g3.ipcamlive.com/player/player.php?alias=08a1898ad840&autoplay=1",
    locationEn: "Tulum Hotel Zone",
    locationEs: "Zona Hotelera Tulum",
    locationFr: "Zone Hôtelière de Tulum",
  },
  {
    id: "akumal",
    name: "Akumal Bay",
    icon: "🐢",
    url: "https://g1.ipcamlive.com/player/player.php?alias=akumalsouth&autoplay=1",
    locationEn: "Akumal Bay",
    locationEs: "Bahía de Akumal",
    locationFr: "Baie d'Akumal",
  },
] as const;

interface WebcamModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

// Fix 3: Remove year + weekday from timestamp
function formatTimestamp() {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function WebcamModal({ lang, isOpen, onClose }: WebcamModalProps) {
  const [timestamp, setTimestamp] = useState(formatTimestamp);
  // Fix 6: Tab-based camera switching
  const [activeCam, setActiveCam] = useState(0);
  // Fix 9: Loading placeholder state
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setTimestamp(formatTimestamp()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cam = WEBCAMS[activeCam];
  const location = lang === "es" ? cam.locationEs : lang === "fr" ? cam.locationFr : cam.locationEn;

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 9998,
          animation: "fadeIn 0.3s ease-out",
        }}
      />

      {/* Modal — Fix 1: teal theme replacing red/maroon */}
      <div
        className="spring-slide-up scrollbar-hide"
        style={{
          position: "fixed",
          top: "5vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "95%",
          maxWidth: "900px",
          maxHeight: "90vh",
          background: "linear-gradient(135deg, #071a1a 0%, #0d2626 100%)",
          borderRadius: radius.lg,
          border: "1px solid rgba(0, 206, 209, 0.25)",
          boxShadow: "0 0 40px rgba(0, 206, 209, 0.12)",
          zIndex: 9999,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          animation: "spring-slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — Fix 4: smaller icon */}
        <div
          className="glass-heavy"
          style={{
            padding: `${spacing.md}px ${spacing.xl}px`,
            background: "rgba(0, 0, 0, 0.4)",
            borderBottom: "1px solid rgba(0, 206, 209, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
            {/* Fix 4: 40×40 icon (down from 56×56) */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.md,
                background: "rgba(0, 206, 209, 0.12)",
                border: "1px solid rgba(0, 206, 209, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}
            >
              📹
            </div>
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#FFF",
                  margin: 0,
                  marginBottom: 4,
                  letterSpacing: "0.3px",
                }}
              >
                Live Beach Cams
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                {/* Fix 2: Subtle LIVE badge (no red gradient, no glow) */}
                <div
                  style={{
                    padding: `2px ${spacing.sm}px`,
                    background: "rgba(0, 0, 0, 0.5)",
                    border: "1px solid rgba(255, 80, 80, 0.5)",
                    borderRadius: radius.sm,
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#FF6B6B",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <div
                    className="quick-action-sos-pulse"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#FF6B6B",
                    }}
                  />
                  LIVE
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {timestamp}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="interactive hover-scale"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "rgba(255,255,255,0.7)",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Fix 6: Tab-based camera switching */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(0, 206, 209, 0.15)",
            flexShrink: 0,
          }}
        >
          {WEBCAMS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCam(i)}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "14px",
                fontWeight: activeCam === i ? 700 : 500,
                color: activeCam === i ? "#00CED1" : "rgba(255,255,255,0.45)",
                background: activeCam === i ? "rgba(0, 206, 209, 0.08)" : "transparent",
                border: "none",
                borderBottom: activeCam === i ? "2px solid #00CED1" : "2px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: "16px" }}>{c.icon}</span>
              {c.name}
            </button>
          ))}
        </div>

        {/* Fix 10: Tightened padding; Fix 8: no staggered animation; Fix 7: no hover-lift */}
        <div
          style={{
            padding: spacing.md,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Fix 1 + 7 + 8: teal card, no hover-lift, no staggered animation */}
          <div
            className="glass"
            style={{
              borderRadius: radius.md,
              overflow: "hidden",
              border: "1px solid rgba(0, 206, 209, 0.2)",
              background: "rgba(0, 0, 0, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Fix 5: Slim card header — inline name + location, smaller type */}
            <div
              style={{
                padding: "10px 16px",
                background: "rgba(0, 206, 209, 0.06)",
                borderBottom: "1px solid rgba(0, 206, 209, 0.12)",
                display: "flex",
                alignItems: "center",
                gap: spacing.sm,
              }}
            >
              <span style={{ fontSize: "20px" }}>{cam.icon}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#FFF",
                  }}
                >
                  {cam.name}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>·</span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.5)",
                    fontWeight: 500,
                  }}
                >
                  {location}
                </span>
              </div>
            </div>

            {/* Video Player with Fix 9: loading placeholder */}
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "56.25%",
                background: "#000",
              }}
            >
              {/* Fix 9: loading overlay (shown until iframe fires onLoad) */}
              {!loaded[cam.id] && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    color: "rgba(255, 255, 255, 0.35)",
                    fontSize: "13px",
                    background: "#000",
                    zIndex: 1,
                  }}
                >
                  <span style={{ fontSize: "28px" }}>📡</span>
                  Connecting to live feed...
                </div>
              )}
              <iframe
                key={cam.id}
                src={cam.url}
                title={`${cam.name} - ${location}`}
                allow="autoplay; fullscreen"
                allowFullScreen
                onLoad={() => setLoaded((prev) => ({ ...prev, [cam.id]: true }))}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                  zIndex: 2,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
