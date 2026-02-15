"use client";

import { useState, useRef, useEffect } from "react";
import { translations } from "@/lib/i18n";
import { getUsf7DayUrl } from "@/lib/sargassum-usf";
import type { Lang } from "@/lib/weather";

const FALLBACK_SRC = "/data/sargassum/latest_7day.png";

interface Sargassum7DayImageProps {
  lang: Lang;
}

export function Sargassum7DayImage({ lang }: Sargassum7DayImageProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [imgSrc, setImgSrc] = useState(FALLBACK_SRC);
  const imgRef = useRef<HTMLImageElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    const today = new Date();
    const urls: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      urls.push(getUsf7DayUrl(d));
    }
    let loaded = false;
    function tryLoad(index: number) {
      if (index >= urls.length || loaded) return;
      const img = new Image();
      img.onload = () => {
        if (!loaded) {
          loaded = true;
          setImgSrc(urls[index]);
        }
      };
      img.onerror = () => {
        tryLoad(index + 1);
      };
      img.src = urls[index];
    }
    tryLoad(0);
    const timeoutId = setTimeout(() => {
      if (!loaded) {
        setImgSrc(FALLBACK_SRC);
      }
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, []);

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
              src={imgSrc}
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
            href="https://optics.marine.usf.edu/cgi-bin/optics_data?roi=YUCATAN&comp=1"
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
