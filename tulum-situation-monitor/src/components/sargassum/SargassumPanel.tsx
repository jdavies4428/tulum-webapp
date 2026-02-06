"use client";

import { useState, useRef } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface SargassumPanelProps {
  lang: Lang;
}

export function SargassumPanel({ lang }: SargassumPanelProps) {
  const [contentVisible, setContentVisible] = useState(true);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const t = translations[lang] as Record<string, string>;
  const red = t.red ?? "RED";
  const yellow = t.yellow ?? "YELLOW";
  const green = t.green ?? "GREEN";
  const lowTitle = t.lowSargassum ?? "Low Sargassum";
  const lowDesc =
    t.lowSargassumDesc ??
    "Minimal sargassum. Check satellite images for current conditions. Verify with beach clubs before visiting.";

  const handleImgError = () => {
    if (imgRef.current) imgRef.current.style.display = "none";
    if (fallbackRef.current) fallbackRef.current.style.display = "block";
  };

  return (
    <div className="panel sargassum-panel">
      <div
        className="panel-header"
        style={{ cursor: "pointer" }}
        onClick={() => setContentVisible(!contentVisible)}
        onKeyDown={(e) => e.key === "Enter" && setContentVisible(!contentVisible)}
        role="button"
        tabIndex={0}
      >
        <span className="panel-icon">🌿</span>
        <span>{t.sargassumForecast ?? "Sargassum Satellite"}</span>
        <span style={{ marginLeft: "auto", fontSize: "12px" }}>
          {contentVisible ? "▼" : "▶"}
        </span>
      </div>

      {contentVisible && (
        <div id="sargassum-forecast-content">
          <div
            className="sargassum-status-section"
            style={{ padding: "12px", borderBottom: "1px solid var(--border-color)" }}
          >
            <div className="traffic-light" style={{ marginBottom: "10px" }}>
              <div className="light red">
                <div className="light-dot" />
                <span>{red}</span>
              </div>
              <div className="light yellow">
                <div className="light-dot" />
                <span>{yellow}</span>
              </div>
              <div className="light green active">
                <div className="light-dot" />
                <span>{green}</span>
              </div>
            </div>
            <div className="sargassum-details">
              <div className="sargassum-title" style={{ fontSize: "13px", fontWeight: 600 }}>
                {lowTitle}
              </div>
              <div className="sargassum-desc" style={{ fontSize: "11px", marginTop: "4px" }}>
                {lowDesc}
              </div>
            </div>
          </div>

          <div
            className="satellite-section"
            style={{ padding: "12px", borderBottom: "1px solid var(--border-color)" }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--accent-yellow)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              📊 7-Day Historical Average
            </div>
            <div style={{ textAlign: "center" }}>
              <img
                ref={imgRef}
                src="/data/sargassum/latest_7day.png?v=2"
                alt="7-Day Sargassum"
                style={{
                  width: "100%",
                  maxWidth: "260px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                }}
                onError={handleImgError}
              />
              <div
                ref={fallbackRef}
                style={{
                  display: "none",
                  padding: "15px",
                  textAlign: "center",
                  background: "rgba(255,214,0,0.1)",
                  borderRadius: "6px",
                }}
              >
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Image loading or unavailable
                </p>
              </div>
              <div style={{ marginTop: "6px", fontSize: "9px", color: "var(--text-muted)" }}>
                7-day rolling composite • Smoother trends
              </div>
            </div>
          </div>

          <div
            className="forecast-text-section"
            style={{ padding: "12px", borderBottom: "1px solid var(--border-color)" }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--accent-green)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              🔮 7-Day Outlook
            </div>
            <div id="sargassum-outlook" style={{ fontSize: "11px", lineHeight: 1.5, color: "var(--text-muted)" }}>
              <p>• Sargassum amounts typically increase Feb-Mar</p>
              <p>• Check daily satellite for current conditions</p>
              <p>• Beach clubs can provide real-time beach status</p>
            </div>
          </div>
        </div>
      )}

      <div
        className="sargassum-footer"
        style={{ justifyContent: "center", padding: "10px", borderTop: "1px solid var(--border-color)" }}
      >
        <a
          href="https://optics.marine.usf.edu/projects/SaWS.html"
          target="_blank"
          rel="noopener noreferrer"
          className="sargassum-btn"
          style={{ fontSize: "10px", padding: "6px 12px" }}
        >
          🔴 View Full USF Satellite Data →
        </a>
      </div>
    </div>
  );
}
