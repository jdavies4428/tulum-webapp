"use client";

import { useState, useRef } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface Sargassum7DayImageProps {
  lang: Lang;
}

export function Sargassum7DayImage({ lang }: Sargassum7DayImageProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const t = translations[lang] as Record<string, string>;

  const handleImgError = () => {
    if (imgRef.current) imgRef.current.style.display = "none";
    if (fallbackRef.current) fallbackRef.current.style.display = "block";
  };

  return (
    <div
      style={{
        padding: "24px",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          marginBottom: isExpanded ? "16px" : "0",
          padding: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🌿</span>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "var(--text-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0,
            }}
          >
            {t.sargassumForecast ?? "Sargassum Satellite"}
          </h2>
        </div>
        <span
          style={{
            color: "var(--text-tertiary)",
            fontSize: "18px",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.3s",
          }}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--text-tertiary)",
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
                maxWidth: "320px",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
              }}
              onError={handleImgError}
            />
            <div
              ref={fallbackRef}
              style={{
                display: "none",
                padding: "24px",
                textAlign: "center",
                background: "var(--card-bg)",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
                fontSize: "13px",
                color: "var(--text-tertiary)",
              }}
            >
              Image unavailable
            </div>
            <p
              style={{
                marginTop: "8px",
                fontSize: "11px",
                color: "var(--text-tertiary)",
              }}
            >
              7-day rolling composite • Smoother trends
            </p>
          </div>
          <a
            href="https://optics.marine.usf.edu/projects/SaWS.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              marginTop: "12px",
              padding: "10px 14px",
              background: "var(--button-secondary)",
              borderRadius: "8px",
              textDecoration: "none",
              color: "var(--tulum-turquoise)",
              fontSize: "12px",
              fontWeight: "600",
              textAlign: "center",
              transition: "all 0.2s",
            }}
          >
            🔴 View Full USF Satellite Data →
          </a>
        </div>
      )}
    </div>
  );
}
