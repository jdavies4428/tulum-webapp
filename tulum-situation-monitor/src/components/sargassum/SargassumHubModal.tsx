"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import { getUsf7DayUrl } from "@/lib/sargassum-usf";
import type { Lang } from "@/lib/weather";

// ── Satellite URL helpers ──
const SATELLITE_BASE = "https://sargassummonitoring.com/wp-content/uploads";
const FALLBACK_CURRENT = "/data/sargassum/latest_1day.png";
const FALLBACK_7DAY = "/data/sargassum/latest_7day.png";
const FALLBACK_FORECAST =
  "https://sargassummonitoring.com/wp-content/uploads/2026/02/mexico-sargazo-monitoreo-sargassum-monitoring-pronosticos-10-02-2026.gif";

function getCmemsUrlForDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${SATELLITE_BASE}/${yyyy}/${mm}/mexico-sargazo-monitoreo-sargassum-monitoring-satelite-${dd}-${mm}-${yyyy}.png`;
}

function getForecastUrlForDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${SATELLITE_BASE}/${yyyy}/${mm}/mexico-sargazo-monitoreo-sargassum-monitoring-pronosticos-${dd}-${mm}-${yyyy}.gif`;
}

// ── Webcam data ──
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

function formatTimestamp() {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Hook: resolve best image URL ──
function useImageResolver(isOpen: boolean, urlFn: () => string[], fallback: string): string {
  const [src, setSrc] = useState(fallback);
  useEffect(() => {
    if (!isOpen) return;
    const urls = urlFn();
    let loaded = false;
    function tryLoad(index: number) {
      if (index >= urls.length || loaded) return;
      const img = new Image();
      img.onload = () => {
        if (!loaded) { loaded = true; setSrc(urls[index]); }
      };
      img.onerror = () => tryLoad(index + 1);
      img.src = urls[index];
    }
    tryLoad(0);
    const t = setTimeout(() => { if (!loaded) setSrc(fallback); }, 5000);
    return () => clearTimeout(t);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  return src;
}

// ── Main component ──
interface SargassumHubModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

export function SargassumHubModal({ lang, isOpen, onClose }: SargassumHubModalProps) {
  const t = translations[lang] as Record<string, string>;
  const [isMobile, setIsMobile] = useState(false);
  const [activeCam, setActiveCam] = useState(0);
  const [camLoaded, setCamLoaded] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [timestamp, setTimestamp] = useState(formatTimestamp);

  // Forecast: try API first, then client-side
  const [forecastSrc, setForecastSrc] = useState(FALLBACK_FORECAST);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setTimestamp(formatTimestamp()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Resolve satellite images
  const currentSrc = useImageResolver(isOpen, () => {
    const urls: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      urls.push(getCmemsUrlForDate(d));
    }
    return urls;
  }, FALLBACK_CURRENT);

  const historicalSrc = useImageResolver(isOpen, () => {
    const urls: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      urls.push(getUsf7DayUrl(d));
    }
    return urls;
  }, FALLBACK_7DAY);

  // Forecast: API then client-side fallback
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/sargassum-forecast");
        const data = await res.json();
        if (res.ok && data.url && !cancelled) { setForecastSrc(data.url); return; }
      } catch { /* fall through */ }
      // Client-side fallback
      const today = new Date();
      const urls: string[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        urls.push(getForecastUrlForDate(d));
      }
      let loaded = false;
      function tryLoad(index: number) {
        if (index >= urls.length || loaded || cancelled) return;
        const img = new Image();
        img.onload = () => { if (!loaded && !cancelled) { loaded = true; setForecastSrc(urls[index]); } };
        img.onerror = () => tryLoad(index + 1);
        img.src = urls[index];
      }
      tryLoad(0);
    })();
    return () => { cancelled = true; };
  }, [isOpen]);

  if (!isOpen) return null;

  const cam = WEBCAMS[activeCam];
  const camLocation = lang === "es" ? cam.locationEs : lang === "fr" ? cam.locationFr : cam.locationEn;

  const sectionCardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #EEEEEE",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    flexShrink: 0,
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: "14px 16px",
    borderBottom: "1px solid #F0F0F0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#222222",
    margin: 0,
  };

  const sectionSubStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#717171",
    margin: 0,
    lineHeight: 1.4,
  };

  const footerStyle: React.CSSProperties = {
    padding: "10px 16px",
    borderTop: "1px solid #F0F0F0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "11px",
    color: "#999999",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 9998,
          animation: "fadeIn 0.25s ease-out",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          ...(isMobile
            ? { inset: 0, borderRadius: "20px 20px 0 0" }
            : {
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%", maxWidth: "640px", height: "90vh",
                borderRadius: "16px",
              }),
          background: "#F7F7F7",
          border: isMobile ? "none" : "1px solid #EEEEEE",
          boxShadow: isMobile ? "0 -4px 24px rgba(0,0,0,0.1)" : "0 24px 64px rgba(0,0,0,0.15)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: isMobile
            ? "slideUpMobile 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards"
            : "slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        {isMobile && (
          <div style={{ padding: "12px 0 4px", display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(0,0,0,0.15)" }} />
          </div>
        )}

        {/* Header */}
        <div style={{
          padding: isMobile ? "8px 16px 14px" : "20px 24px",
          background: "#FFFFFF",
          borderBottom: "1px solid #EEEEEE",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              fontSize: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#222222",
              flexShrink: 0,
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            ←
          </button>
          <div>
            <h2 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: 700, color: "#222222", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🌿</span> {t.sargassum ?? "Sargassum"}
            </h2>
            <p style={{ fontSize: "13px", color: "#717171", margin: "4px 0 0" }}>
              {t.sargassumHubDesc ?? "Live cams, satellite imagery & forecasts"}
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px", paddingBottom: isMobile ? "100px" : "24px" }}>

          {/* ── 1. Live Beach Cams ── */}
          <div style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={{ fontSize: "20px" }}>📹</span>
              <div style={{ flex: 1 }}>
                <h3 style={sectionTitleStyle}>{t.liveCams ?? "Live Beach Cams"}</h3>
              </div>
              <div style={{
                padding: "2px 8px",
                background: "rgba(255, 80, 80, 0.08)",
                border: "1px solid rgba(255, 80, 80, 0.3)",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#FF6B6B",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}>
                <div className="quick-action-sos-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF6B6B" }} />
                LIVE
              </div>
              <span style={{ fontSize: "12px", color: "#999999" }}>{timestamp}</span>
            </div>
            {/* Cam tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #F0F0F0" }}>
              {WEBCAMS.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCam(i)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    fontSize: "13px",
                    fontWeight: activeCam === i ? 700 : 500,
                    color: activeCam === i ? "#00CED1" : "#717171",
                    background: activeCam === i ? "rgba(0, 206, 209, 0.06)" : "transparent",
                    border: "none",
                    borderBottom: activeCam === i ? "2px solid #00CED1" : "2px solid transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{c.icon}</span> {c.name}
                </button>
              ))}
            </div>
            {/* Video */}
            <div style={{ position: "relative", width: "100%", height: isMobile ? "280px" : "360px", background: "#000" }}>
              {!camLoaded[cam.id] && (
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "8px", color: "rgba(255,255,255,0.4)", fontSize: "13px", background: "#000", zIndex: 1,
                }}>
                  <span style={{ fontSize: "28px" }}>📡</span>
                  {t.connectingToFeed ?? "Connecting to live feed..."}
                </div>
              )}
              <iframe
                key={cam.id}
                src={cam.url}
                title={`${cam.name} - ${camLocation}`}
                allow="autoplay; fullscreen"
                allowFullScreen
                onLoad={() => setCamLoaded((prev) => ({ ...prev, [cam.id]: true }))}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0, zIndex: 2 }}
              />
            </div>
            <div style={{ padding: "8px 16px", fontSize: "12px", color: "#717171" }}>
              📍 {camLocation}
            </div>
          </div>

          {/* ── 2. Current Satellite ── */}
          <div style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={{ fontSize: "20px" }}>🛰️</span>
              <div>
                <h3 style={sectionTitleStyle}>{t.currentSatellite ?? "Current Satellite"}</h3>
                <p style={sectionSubStyle}>
                  {t.currentSatelliteDesc ?? "Latest CMEMS image showing sargassum concentration around Tulum/Yucatan. Updated daily."}
                </p>
              </div>
            </div>
            <div style={{ background: "#111", height: isMobile ? "240px" : "300px", overflow: "hidden" }}>
              {imageErrors.current ? (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🛰️</div>
                  <div style={{ fontSize: "13px" }}>Image unavailable</div>
                </div>
              ) : (
                <img
                  src={currentSrc}
                  alt="Current satellite imagery of sargassum coverage near Tulum"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={() => setImageErrors(prev => ({ ...prev, current: true }))}
                />
              )}
            </div>
            <div style={footerStyle}>
              <span>🛰️ CMEMS Copernicus Sentinel-3 OLCI</span>
              <a href="https://sargassummonitoring.com/en/satellite-sargassum-mexico/" target="_blank" rel="noopener noreferrer" style={{ color: "#00CED1", fontWeight: 600 }}>
                {t.viewFullData ?? "View Full Data"} →
              </a>
            </div>
          </div>

          {/* ── 3. 7-Day Forecast ── */}
          <div style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={{ fontSize: "20px" }}>🌿</span>
              <div>
                <h3 style={sectionTitleStyle}>{t.sargassumForecast ?? "7-Day Forecast"}</h3>
                <p style={sectionSubStyle}>
                  {t.forecastDesc ?? "Predicted sargassum movement based on ocean currents and wind forecasts."}
                </p>
              </div>
            </div>
            <div style={{ padding: "8px 16px", display: "flex", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444" }} />
                <span style={{ fontSize: "11px", color: "#717171" }}>{t.sargassumPatch ?? "Sargassum Patch"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#00CED1" }} />
                <span style={{ fontSize: "11px", color: "#717171" }}>{t.trajectory ?? "Predicted Path"}</span>
              </div>
            </div>
            <div style={{ background: "#111", height: isMobile ? "240px" : "300px", overflow: "hidden" }}>
              {imageErrors.forecast ? (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🌿</div>
                  <div style={{ fontSize: "13px" }}>Forecast image unavailable</div>
                </div>
              ) : (
                <img
                  src={forecastSrc}
                  alt="Sargassum density forecast map for the Caribbean region"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={() => setImageErrors(prev => ({ ...prev, forecast: true }))}
                />
              )}
            </div>
            <div style={footerStyle}>
              <span>{t.dataFrom ?? "Data: Mexican Government / SEMA Q. Roo"}</span>
              <a href="https://sargassummonitoring.com/en/forecast-sargassum-mexico-riviera-maya/" target="_blank" rel="noopener noreferrer" style={{ color: "#00CED1", fontWeight: 600 }}>
                {t.viewFullForecast ?? "Full Forecast"} →
              </a>
            </div>
          </div>

          {/* ── 4. 7-Day Historical ── */}
          <div style={sectionCardStyle}>
            <div style={sectionHeaderStyle}>
              <span style={{ fontSize: "20px" }}>📊</span>
              <div>
                <h3 style={sectionTitleStyle}>{t.sargassum7DayHistorical ?? "7-Day Historical"}</h3>
                <p style={sectionSubStyle}>
                  {t.historicalDesc ?? "7-day rolling composite showing smoother sargassum trends. Updated daily at 6 AM."}
                </p>
              </div>
            </div>
            <div style={{ background: "#111", height: isMobile ? "240px" : "300px", overflow: "hidden" }}>
              {imageErrors.historical ? (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>📊</div>
                  <div style={{ fontSize: "13px" }}>Image unavailable</div>
                </div>
              ) : (
                <img
                  src={historicalSrc}
                  alt="7-day historical sargassum satellite composite near Tulum"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={() => setImageErrors(prev => ({ ...prev, historical: true }))}
                />
              )}
            </div>
            <div style={footerStyle}>
              <span>🛰️ NASA/USF MODIS - 7-day composite</span>
              <a href="https://optics.marine.usf.edu/cgi-bin/optics_data?roi=YUCATAN&comp=1" target="_blank" rel="noopener noreferrer" style={{ color: "#00CED1", fontWeight: 600 }}>
                {t.viewFullData ?? "View Full Data"} →
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
