"use client";

import type { Alert } from "@/types/alert";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface AlertsPanelProps {
  lang: Lang;
  alerts: Alert[];
}

export function AlertsPanel({ lang, alerts }: AlertsPanelProps) {
  const t = translations[lang];

  return (
    <div className="panel alerts-panel">
      <div className="panel-header">
        <span className="panel-icon">⚠️</span>
        <span>{t.activeAlerts}</span>
        <span
          className={`alert-count ${alerts.length === 0 ? "none" : ""}`}
        >
          {alerts.length}
        </span>
      </div>
      <div className="alert-list">
        {alerts.length === 0 ? (
          <p className="text-center text-sm text-accent-green">{t.noAlerts}</p>
        ) : (
          <ul className="space-y-0">
            {alerts.map((alert, i) => (
              <li
                key={i}
                className="flex flex-col gap-1.5 border-b border-border px-3 py-3 last:border-0 first:pt-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 whitespace-nowrap rounded border px-2 py-0.5 text-[9px] font-bold ${
                      alert.severity === "severe"
                        ? "border-accent-red bg-accent-red/20 text-accent-red"
                        : alert.severity === "moderate"
                          ? "border-accent-yellow bg-accent-yellow/20 text-accent-yellow"
                          : "border-accent-cyan bg-accent-cyan/20 text-accent-cyan"
                    }`}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                  <p className="min-w-0 flex-1 text-sm font-semibold text-white">{alert.title}</p>
                </div>
                <p className="text-xs text-text-muted leading-snug">{alert.desc}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
