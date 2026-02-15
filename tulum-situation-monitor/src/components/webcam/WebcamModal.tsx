"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { spacing, radius } from "@/lib/design-tokens";
import { Modal } from "@/components/ui/Modal";

const WEBCAMS = [
  {
    id: "tulum",
    name: "Tulum Beach",
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
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
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

  if (!isOpen) return null;

  return (
    <Modal isOpen onClose={onClose} size="lg" heavyBackdrop showCloseButton={false}>
      <div
        className="spring-slide-up"
        style={{
          padding: 0,
          background: "linear-gradient(135deg, #1a1410 0%, #0a0604 100%)",
        }}
      >
        {/* Header */}
        <div
          className="glass-heavy"
          style={{
            padding: spacing.lg,
            borderBottom: "2px solid rgba(0, 206, 209, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
            <div
              className="glass shadow-glow"
              style={{
                width: 48,
                height: 48,
                borderRadius: radius.md,
                background: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                border: "2px solid rgba(0, 206, 209, 0.3)",
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
                  marginBottom: spacing.xs,
                }}
              >
                {t.liveWebcams ?? "Live Beach Webcams"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                <div
                  style={{
                    padding: `${spacing.xs}px ${spacing.sm}px`,
                    background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
                    borderRadius: radius.sm,
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "#FFF",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.xs,
                    boxShadow: "0 4px 16px rgba(255, 0, 0, 0.4)",
                  }}
                >
                  <div
                    className="quick-action-sos-pulse"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#FFF",
                    }}
                  />
                  LIVE
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.6)",
                    fontFamily: "monospace",
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
              background: "rgba(255, 255, 255, 0.1)",
              border: "2px solid rgba(255, 255, 255, 0.15)",
              color: "#FFF",
              fontSize: "20px",
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
            padding: spacing.lg,
            display: "flex",
            flexDirection: "column",
            gap: spacing.lg,
            maxHeight: "70vh",
            overflowY: "auto",
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
                  border: "2px solid rgba(0, 206, 209, 0.2)",
                  background: "rgba(255, 255, 255, 0.03)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  animation: `spring-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s both`,
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {/* Webcam Header */}
                <div
                  className="glass-heavy"
                  style={{
                    padding: spacing.md,
                    background: "rgba(0, 206, 209, 0.1)",
                    borderBottom: "1px solid rgba(0, 206, 209, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.sm,
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{cam.icon}</span>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#FFF", marginBottom: 2 }}>
                      {cam.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", fontWeight: 500 }}>
                      {location}
                    </div>
                  </div>
                </div>

                {/* Webcam Player */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "56.25%", // 16:9 aspect ratio
                    background: "#000",
                  }}
                >
                  <iframe
                    src={cam.url}
                    title={location}
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

                  {/* Beach Cam Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: spacing.sm,
                      right: spacing.sm,
                      padding: `${spacing.xs}px ${spacing.sm}px`,
                      background: "rgba(0, 0, 0, 0.8)",
                      borderRadius: radius.sm,
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "rgba(255, 255, 255, 0.7)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      pointerEvents: "none",
                    }}
                  >
                    BEACH CAM
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div
          className="glass-heavy"
          style={{
            padding: spacing.md,
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
              fontWeight: 500,
            }}
          >
            {t.webcamDisclaimer ?? "Live feeds may experience delays. Check conditions before visiting."}
          </p>
        </div>
      </div>
    </Modal>
  );
}
