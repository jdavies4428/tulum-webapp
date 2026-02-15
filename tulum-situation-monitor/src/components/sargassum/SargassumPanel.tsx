"use client";

import { useState, useRef, useEffect } from "react";
import { translations } from "@/lib/i18n";
import { getUsf7DayUrl } from "@/lib/sargassum-usf";
import type { Lang } from "@/lib/weather";
import { spacing, radius } from "@/lib/design-tokens";
import { Card, CardContent } from "@/components/ui/Card";

const FALLBACK_7DAY = "/data/sargassum/latest_7day.png";

interface SargassumPanelProps {
  lang: Lang;
}

export function SargassumPanel({ lang }: SargassumPanelProps) {
  const [contentVisible, setContentVisible] = useState(true);
  const [imgSrc, setImgSrc] = useState(FALLBACK_7DAY);
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
      img.onerror = () => tryLoad(index + 1);
      img.src = urls[index];
    }
    tryLoad(0);
    const timeoutId = setTimeout(() => {
      if (!loaded) setImgSrc(FALLBACK_7DAY);
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleImgError = () => {
    if (imgRef.current) imgRef.current.style.display = "none";
    if (fallbackRef.current) fallbackRef.current.style.display = "block";
  };

  return (
    <Card variant="glass" className="spring-slide-up" style={{ overflow: "hidden" }}>
      {/* Collapsible Header */}
      <div
        className="glass-heavy interactive hover-scale"
        onClick={() => setContentVisible(!contentVisible)}
        onKeyDown={(e) => e.key === "Enter" && setContentVisible(!contentVisible)}
        role="button"
        tabIndex={0}
        style={{
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: `${radius.md}px ${radius.md}px 0 0`,
          display: "flex",
          alignItems: "center",
          gap: spacing.xs,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <span style={{ fontSize: "16px" }}>🌿</span>
        <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.7)" }}>
          {t.sargassumForecast ?? "Sargassum Satellite"}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.6)",
            transform: contentVisible ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          ▼
        </span>
      </div>

      {/* Collapsible Content */}
      {contentVisible && (
        <div
          className="spring-slide-up"
          id="sargassum-forecast-content"
          style={{
            animation: "spring-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Status Section with Traffic Light */}
          <div
            className="glass"
            style={{
              padding: spacing.md,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: spacing.md,
                marginBottom: spacing.md,
              }}
            >
              {/* Red Light */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.xs }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(255, 107, 107, 0.2)",
                    border: "2px solid rgba(255, 107, 107, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(255, 107, 107, 0.4)" }} />
                </div>
                <span style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>
                  {red}
                </span>
              </div>

              {/* Yellow Light */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.xs }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(245, 158, 11, 0.2)",
                    border: "2px solid rgba(245, 158, 11, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(245, 158, 11, 0.4)" }} />
                </div>
                <span style={{ fontSize: "9px", fontWeight: 600, color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>
                  {yellow}
                </span>
              </div>

              {/* Green Light - Active */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing.xs }}>
                <div
                  className="shadow-glow"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(80, 200, 120, 0.3)",
                    border: "2px solid #50C878",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 16px rgba(80, 200, 120, 0.5)",
                  }}
                >
                  <div
                    className="quick-action-sos-pulse"
                    style={{ width: 16, height: 16, borderRadius: "50%", background: "#50C878" }}
                  />
                </div>
                <span style={{ fontSize: "9px", fontWeight: 600, color: "#50C878", textTransform: "uppercase" }}>
                  {green}
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFF", marginBottom: spacing.xs }}>
                {lowTitle}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.7)", lineHeight: "1.5" }}>
                {lowDesc}
              </div>
            </div>
          </div>

          {/* Satellite Image Section */}
          <div
            className="glass"
            style={{
              padding: spacing.md,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#F59E0B",
                marginBottom: spacing.sm,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              📊 7-Day Historical Average
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                className="glass-heavy"
                style={{
                  display: "inline-block",
                  padding: spacing.sm,
                  borderRadius: radius.md,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="7-Day Sargassum"
                  style={{
                    width: "100%",
                    maxWidth: "260px",
                    borderRadius: radius.sm,
                    display: "block",
                  }}
                  onError={handleImgError}
                />
              </div>
              <div
                ref={fallbackRef}
                className="glass"
                style={{
                  display: "none",
                  padding: spacing.md,
                  textAlign: "center",
                  background: "rgba(245, 158, 11, 0.1)",
                  borderRadius: radius.md,
                  marginTop: spacing.sm,
                }}
              >
                <p style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                  Image loading or unavailable
                </p>
              </div>
              <div style={{ marginTop: spacing.xs, fontSize: "9px", color: "rgba(255, 255, 255, 0.5)" }}>
                7-day rolling composite • Smoother trends
              </div>
            </div>
          </div>

          {/* 7-Day Outlook */}
          <div
            className="glass"
            style={{
              padding: spacing.md,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#50C878",
                marginBottom: spacing.sm,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              🔮 7-Day Outlook
            </div>
            <div
              id="sargassum-outlook"
              style={{
                fontSize: "11px",
                lineHeight: "1.6",
                color: "rgba(255, 255, 255, 0.7)",
                display: "flex",
                flexDirection: "column",
                gap: spacing.xs,
              }}
            >
              <p style={{ margin: 0 }}>• Sargassum amounts typically increase Feb-Mar</p>
              <p style={{ margin: 0 }}>• Check daily satellite for current conditions</p>
              <p style={{ margin: 0 }}>• Beach clubs can provide real-time beach status</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer with External Link */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: spacing.sm,
        }}
      >
        <a
          href="https://optics.marine.usf.edu/projects/SaWS.html"
          target="_blank"
          rel="noopener noreferrer"
          className="interactive hover-lift"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: `${spacing.xs}px ${spacing.md}px`,
            borderRadius: radius.sm,
            background: "linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%)",
            border: "1px solid rgba(255, 107, 107, 0.3)",
            color: "#FF6B6B",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: spacing.xs,
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          🔴 View Full USF Satellite Data →
        </a>
      </div>
    </Card>
  );
}
