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
                className="flex gap-2 border-b border-border py-2.5 last:border-0 first:pt-0"
              >
                <span
                  className={`h-fit shrink-0 whitespace-nowrap rounded border px-1.5 py-0.5 text-[8px] font-bold ${
                    alert.severity === "severe"
                      ? "border-accent-red bg-accent-red/20 text-accent-red"
                      : alert.severity === "moderate"
                        ? "border-accent-yellow bg-accent-yellow/20 text-accent-yellow"
                        : "border-accent-cyan bg-accent-cyan/20 text-accent-cyan"
                  }`}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white">{alert.title}</p>
                  <p className="text-[10px] text-text-muted leading-snug">{alert.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
