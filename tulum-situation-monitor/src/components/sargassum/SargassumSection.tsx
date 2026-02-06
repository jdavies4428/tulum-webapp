"use client";

import { useState } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface SargassumSectionProps {
  lang: Lang;
}

const SEVEN_DAY_TREND = [
  { day: "Mon", level: 20, color: "#10B981" },
  { day: "Tue", level: 25, color: "#10B981" },
  { day: "Wed", level: 30, color: "#10B981" },
  { day: "Thu", level: 35, color: "#10B981" },
  { day: "Fri", level: 45, color: "#F59E0B" },
  { day: "Sat", level: 50, color: "#F59E0B" },
  { day: "Sun", level: 40, color: "#F59E0B" },
];

export function SargassumSection({ lang }: SargassumSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const t = translations[lang] as Record<string, string>;

  const sargassumForecast = t.sargassumForecast ?? "Sargassum Satellite";
  const lowSargassum = t.lowSargassum ?? "Low Sargassum";
  const greatConditions = t.greatBeachConditions ?? "Great beach conditions today!";
  const minimalDesc =
    t.minimalSargassumDesc ??
    "Minimal sargassum detected. Perfect time to visit the beaches! Always verify with beach clubs for real-time conditions.";
  const checkSatellite = t.checkSatellite ?? "📸 Check satellite";
  const callAhead = t.callAhead ?? "📞 Call ahead";
  const sevenDayTrend = t.sevenDayTrend ?? "📊 7-Day Trend";
  const lowLabel = t.low ?? "Low";
  const mediumLabel = t.medium ?? "Medium";
  const highLabel = t.high ?? "High";
  const sevenDayOutlook = t.sevenDayOutlook ?? "🔮 7-Day Outlook";
  const outlook1 = t.sargassumOutlook1 ?? "Sargassum typically increases Feb-Mar";
  const outlook2 = t.sargassumOutlook2 ?? "Check satellite daily for updates";
  const outlook3 = t.sargassumOutlook3 ?? "Beach clubs have real-time status";
  const viewFullSatellite = t.viewFullSatellite ?? "🔴 View Full Satellite Data";

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
          marginBottom: isExpanded ? "20px" : "0",
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
            {sargassumForecast}
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
          {/* Current status card */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                fontSize: "80px",
                opacity: 0.1,
                lineHeight: 1,
              }}
            >
              🌿
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(16, 185, 129, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                ✓
              </div>
              <div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "var(--sargassum-low)",
                    marginBottom: "2px",
                  }}
                >
                  {lowSargassum}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {greatConditions}
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                margin: "0 0 16px 0",
                position: "relative",
                zIndex: 1,
              }}
            >
              {minimalDesc}
            </p>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                position: "relative",
                zIndex: 1,
              }}
            >
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  fontWeight: "500",
                }}
              >
                {checkSatellite}
              </span>
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.1)",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  fontWeight: "500",
                }}
              >
                {callAhead}
              </span>
            </div>
          </div>

          {/* Visual forecast */}
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid var(--border-subtle)",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "16px",
              }}
            >
              {sevenDayTrend}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                height: "100px",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              {SEVEN_DAY_TREND.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${day.level}%`,
                      background: `linear-gradient(to top, ${day.color}, ${day.color}88)`,
                      borderRadius: "6px 6px 0 0",
                      transition: "all 0.3s",
                      cursor: "pointer",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-tertiary)",
                      fontWeight: "600",
                    }}
                  >
                    {day.day}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                paddingTop: "12px",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: "#10B981",
                  }}
                />
                <span style={{ color: "var(--text-secondary)" }}>{lowLabel}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: "#F59E0B",
                  }}
                />
                <span style={{ color: "var(--text-secondary)" }}>{mediumLabel}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: "#EF4444",
                  }}
                />
                <span style={{ color: "var(--text-secondary)" }}>{highLabel}</span>
              </div>
            </div>
          </div>

          {/* Outlook card */}
          <div
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#F59E0B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
              }}
            >
              {sevenDayOutlook}
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: 1.8,
              }}
            >
              <li>{outlook1}</li>
              <li>{outlook2}</li>
              <li>{outlook3}</li>
            </ul>
          </div>

          {/* Data source link */}
          <a
            href="https://optics.marine.usf.edu/projects/SaWS.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "16px",
              padding: "12px 16px",
              background: "var(--button-secondary)",
              borderRadius: "10px",
              textDecoration: "none",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.2s",
            }}
          >
            <span>{viewFullSatellite}</span>
            <span>→</span>
          </a>
        </div>
      )}
    </div>
  );
}
