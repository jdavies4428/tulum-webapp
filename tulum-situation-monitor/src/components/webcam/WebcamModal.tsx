"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { spacing, radius, shadows } from "@/lib/design-tokens";

const WEBCAMS = [
  {
    id: "tulum",
    name: "Casa Malca",
    icon: "🏖️",
    url: "https://g3.ipcamlive.com/player/player.php?alias=08a1898ad840",
    locationEn: "Tulum Hotel Zone",
    locationEs: "Zona Hotelera Tulum",
    locationFr: "Zone Hôtelière de Tulum",
  },
  {
    id: "akumal",
    name: "Akumal Bay",
    icon: "🐢",
    url: "https://g1.ipcamlive.com/player/player.php?alias=akumalsouth",
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

function formatTimestamp() {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function WebcamModal({ lang, isOpen, onClose }: WebcamModalProps) {
  const [timestamp, setTimestamp] = useState(formatTimestamp);
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

      {/* Modal */}
      <div
        className="spring-slide-up scrollbar-hide"
        style={{
          position: "fixed",
          top: "5vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "95%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          background: "linear-gradient(135deg, #2d1a1a 0%, #3d2121 100%)",
          borderRadius: radius.xl,
          border: "2px solid rgba(255, 107, 107, 0.3)",
          boxShadow: "0 0 40px rgba(255, 107, 107, 0.2)",
          zIndex: 9999,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          animation: "spring-slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="glass-heavy"
          style={{
            padding: `${spacing.lg}px ${spacing.xl}px`,
            background: "rgba(0, 0, 0, 0.4)",
            borderBottom: "2px solid rgba(255, 107, 107, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
            <div
              className="shadow-glow"
              style={{
                width: 56,
                height: 56,
                borderRadius: radius.lg,
                background: "linear-gradient(135deg, rgba(255, 107, 107, 0.3) 0%, rgba(255, 142, 83, 0.2) 100%)",
                border: "2px solid rgba(255, 107, 107, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              📹
            </div>
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#FFF",
                  margin: 0,
                  marginBottom: spacing.xs,
                  letterSpacing: "0.5px",
                }}
              >
                Live Beach Cams
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                <div
                  style={{
                    padding: `${spacing.xs}px ${spacing.md}px`,
                    background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
                    borderRadius: radius.md,
                    fontSize: "12px",
                    fontWeight: 900,
                    color: "#FFF",
                    letterSpacing: "1.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.sm,
                    boxShadow: "0 4px 20px rgba(255, 0, 0, 0.5)",
                  }}
                >
                  <div
                    className="quick-action-sos-pulse"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#FFF",
                    }}
                  />
                  LIVE
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.7)",
                    letterSpacing: "0.3px",
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
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              color: "#FFF",
              fontSize: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Webcam Feeds */}
        <div
          style={{
            padding: spacing.xl,
            display: "flex",
            flexDirection: "column",
            gap: spacing.xl,
          }}
        >
          {WEBCAMS.map((cam, index) => {
            const location = lang === "es" ? cam.locationEs : lang === "fr" ? cam.locationFr : cam.locationEn;
            return (
              <div
                key={cam.id}
                className="glass hover-lift spring-slide-up"
                style={{
                  borderRadius: radius.lg,
                  overflow: "hidden",
                  border: "2px solid rgba(255, 107, 107, 0.25)",
                  background: "rgba(0, 0, 0, 0.3)",
                  boxShadow: "0 12px 40px rgba(255, 107, 107, 0.15)",
                  animation: `spring-slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s both`,
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {/* Camera Header */}
                <div
                  style={{
                    padding: `${spacing.md}px ${spacing.lg}px`,
                    background: "linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 142, 83, 0.05) 100%)",
                    borderBottom: "2px solid rgba(255, 107, 107, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.md,
                  }}
                >
                  <span style={{ fontSize: "32px" }}>{cam.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: "#FFF",
                        marginBottom: 4,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {cam.name}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "rgba(255, 255, 255, 0.6)",
                        fontWeight: 600,
                        letterSpacing: "0.3px",
                      }}
                    >
                      {location}
                    </div>
                  </div>
                </div>

                {/* Video Player */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "56.25%",
                    background: "#000",
                  }}
                >
                  <iframe
                    src={cam.url}
                    title={`${cam.name} - ${location}`}
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
