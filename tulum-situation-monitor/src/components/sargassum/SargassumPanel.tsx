"use client";

import { useState } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface SargassumPanelProps {
  lang: Lang;
}

export function SargassumPanel({ lang }: SargassumPanelProps) {
  const [contentVisible, setContentVisible] = useState(true);
  const t = translations[lang] as Record<string, string>;
  const red = t.red ?? "RED";
  const yellow = t.yellow ?? "YELLOW";
  const green = t.green ?? "GREEN";
  const lowTitle = t.lowSargassum ?? "Low Sargassum";
  const lowDesc =
    t.lowSargassumDesc ??
    "Minimal sargassum. Check satellite images for current conditions. Verify with beach clubs before visiting.";

  return (
    <div className="sargassum-panel rounded-lg border border-[var(--border-color)] overflow-hidden bg-[var(--bg-panel)] shadow-lg backdrop-blur-md">
      <button
        type="button"
        className="panel-header flex w-full cursor-pointer items-center gap-1.5 border-b border-[var(--border-color)] bg-white/5 px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]"
        onClick={() => setContentVisible(!contentVisible)}
      >
        <span className="panel-icon">🌿</span>
        <span>{t.sargassumForecast ?? "SARGASSUM FORECAST"}</span>
        <span className="ml-auto text-xs">{contentVisible ? "▼" : "▶"}</span>
      </button>
      {contentVisible && (
        <>
          <div
            className="sargassum-status-section border-b border-[var(--border-color)] p-3"
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
            className="satellite-section border-b border-[var(--border-color)] p-3"
            style={{ padding: "12px", borderBottom: "1px solid var(--border-color)" }}
          >
            <div
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-yellow)]"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--accent-yellow)",
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              📊 7-Day Historical Average
            </div>
            <div className="text-center">
              <img
                src="/data/sargassum/latest_7day.png?v=2"
                alt="7-Day Sargassum"
                className="mx-auto w-full max-w-[260px] rounded border border-[var(--border-color)]"
                style={{
                  width: "100%",
                  maxWidth: "260px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                }}
              />
              <div
                className="mt-1.5 text-[9px] text-[var(--text-muted)]"
                style={{ marginTop: "6px", fontSize: "9px" }}
              >
                7-day rolling composite • Smoother trends
              </div>
            </div>
          </div>

          <div
            className="forecast-text-section border-b border-[var(--border-color)] p-3"
            style={{ padding: "12px", borderBottom: "1px solid var(--border-color)" }}
          >
            <div
              className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-green)]"
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--accent-green)",
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              🔮 7-Day Outlook
            </div>
            <div
              id="sargassum-outlook"
              className="text-[11px] leading-relaxed text-[var(--text-muted)]"
              style={{ fontSize: "11px", lineHeight: 1.5 }}
            >
              <p>• Sargassum amounts typically increase Feb-Mar</p>
              <p>• Check daily satellite for current conditions</p>
              <p>• Beach clubs can provide real-time beach status</p>
            </div>
          </div>

          <div className="sargassum-footer">
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
        </>
      )}
    </div>
  );
}
