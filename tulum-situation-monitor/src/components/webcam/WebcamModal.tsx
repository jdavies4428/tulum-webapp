"use client";

import { useState, useEffect, useRef } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const WEBCAMS = {
  tulum: {
    id: "tulum",
    name: "Tulum",
    icon: "🏖️",
    url: "https://g3.ipcamlive.com/player/player.php?alias=08a1898ad840",
    locationEn: "Tulum Beach Hotel Zone",
    locationEs: "Zona Hotelera Tulum",
    locationFr: "Zone Hôtelière de Tulum",
    thumbnail: "/data/webcam/latest.jpg",
  },
  "akumal-south": {
    id: "akumal-south",
    name: "Akumal",
    icon: "🐢",
    url: "https://g1.ipcamlive.com/player/player.php?alias=akumalsouth",
    locationEn: "Akumal Bay",
    locationEs: "Bahía de Akumal",
    locationFr: "Baie d'Akumal",
    thumbnail: "/api/placeholder/800/450",
  },
} as const;

type WebcamId = keyof typeof WEBCAMS;
const LOCATIONS = Object.values(WEBCAMS);

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
  const [activeCam, setActiveCam] = useState<WebcamId>("tulum");
  const [timestamp, setTimestamp] = useState(formatTimestamp);
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const t = translations[lang] as Record<string, string>;
  const cam = WEBCAMS[activeCam];
  const location =
    lang === "es" ? cam.locationEs : lang === "fr" ? cam.locationFr : cam.locationEn;

  useEffect(() => {
    if (!isOpen) return;
    setActiveCam("tulum");
  }, [isOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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

  const toggleFullscreen = () => {
    const el = iframeRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "16px" : "20px 24px",
          background: "rgba(0, 0, 0, 0.5)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "16px" }}>
          <div
            style={{
              width: isMobile ? "40px" : "44px",
              height: isMobile ? "40px" : "44px",
              borderRadius: isMobile ? "10px" : "12px",
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isMobile ? "20px" : "24px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            📹
          </div>
          <div
            style={{
              padding: isMobile ? "6px 12px" : "8px 16px",
              background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
              borderRadius: isMobile ? "6px" : "8px",
              fontSize: isMobile ? "11px" : "13px",
              fontWeight: "900",
              color: "#FFF",
              letterSpacing: "1px",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "6px" : "8px",
              boxShadow: "0 4px 16px rgba(255, 0, 0, 0.4)",
            }}
          >
            <div
              style={{
                width: isMobile ? "6px" : "8px",
                height: isMobile ? "6px" : "8px",
                borderRadius: "50%",
                background: "#FFF",
                animation: "webcam-pulse 2s infinite",
              }}
            />
            LIVE
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: isMobile ? "36px" : "40px",
            height: isMobile ? "36px" : "40px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            border: "2px solid rgba(255, 255, 255, 0.15)",
            color: "#FFF",
            fontSize: isMobile ? "18px" : "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s",
          }}
        >
          ✕
        </button>
      </div>

      {/* Location selector */}
      <div
        style={{
          padding: isMobile ? "12px 16px" : "16px 24px",
          background: "rgba(0, 0, 0, 0.3)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: isMobile ? "8px" : "12px",
          }}
        >
          {LOCATIONS.map((loc) => {
            const selected = activeCam === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setActiveCam(loc.id as WebcamId)}
                style={{
                  padding: isMobile ? "12px" : "16px 20px",
                  background: selected
                    ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                    : "rgba(255, 255, 255, 0.05)",
                  border: selected
                    ? "2px solid #00CED1"
                    : "2px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: isMobile ? "12px" : "16px",
                  color: "#FFF",
                  fontSize: isMobile ? "15px" : "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isMobile ? "8px" : "10px",
                  transition: "all 0.3s",
                  boxShadow: selected ? "0 8px 24px rgba(0, 206, 209, 0.3)" : "none",
                }}
              >
                <span style={{ fontSize: isMobile ? "20px" : "24px" }}>{loc.icon}</span>
                <span>{loc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Video player */}
      <div
        style={{
          position: "relative",
          ...(isMobile
            ? { flex: 1, minHeight: 0, background: "#000" }
            : { aspectRatio: "16/9", background: "#000" }),
          overflow: "hidden",
        }}
      >
        <iframe
          ref={iframeRef}
          src={cam.url}
          title={location}
          allowFullScreen
          style={{
            width: "100%",
            height: "100%",
            border: 0,
            display: "block",
          }}
        />

        {/* Timestamp overlay */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? "12px" : "16px",
            left: isMobile ? "12px" : "16px",
            padding: isMobile ? "6px 12px" : "8px 16px",
            background: "rgba(0, 0, 0, 0.8)",
            borderRadius: isMobile ? "6px" : "8px",
            fontSize: isMobile ? "11px" : "13px",
            fontWeight: "600",
            color: "#FFF",
            fontFamily: "monospace",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            pointerEvents: "none",
          }}
        >
          {timestamp}
        </div>

        {/* Beach cam label */}
        <div
          style={{
            position: "absolute",
            bottom: isMobile ? "12px" : "16px",
            right: isMobile ? "12px" : "16px",
            padding: isMobile ? "4px 10px" : "6px 12px",
            background: "rgba(0, 0, 0, 0.8)",
            borderRadius: isMobile ? "4px" : "6px",
            fontSize: isMobile ? "9px" : "11px",
            fontWeight: "700",
            color: "rgba(255, 255, 255, 0.7)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            pointerEvents: "none",
          }}
        >
          BEACH CAM
        </div>

        {/* Fullscreen button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          style={{
            position: "absolute",
            bottom: isMobile ? "12px" : "16px",
            left: isMobile ? "12px" : "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.25)",
            border: "none",
            color: "#FFF",
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⛶
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: isMobile ? "16px" : "20px 24px",
          background: "rgba(0, 0, 0, 0.3)",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div
          style={{
            fontSize: isMobile ? "14px" : "16px",
            fontWeight: "600",
            color: "rgba(255, 255, 255, 0.7)",
          }}
        >
          {location}
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div
          role="presentation"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            zIndex: 9998,
            animation: "fadeIn 0.3s ease-out",
          }}
        />
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "linear-gradient(135deg, #1a1410 0%, #0a0604 100%)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {modalContent}
        </div>
      </>
    );
  }

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.85)",
          zIndex: 9998,
          animation: "fadeIn 0.3s ease-out",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "900px",
          background: "linear-gradient(135deg, #1a1410 0%, #0a0604 100%)",
          borderRadius: "24px",
          border: "2px solid rgba(0, 206, 209, 0.3)",
          boxShadow: "0 24px 80px rgba(0, 206, 209, 0.2)",
          zIndex: 9999,
          overflow: "hidden",
          animation: "slideUpFade 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {modalContent}
      </div>
    </>
  );
}
