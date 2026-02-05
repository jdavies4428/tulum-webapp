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
    <div className="rounded-lg border border-border bg-bg-panel overflow-hidden shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-1.5 border-b border-border bg-white/5 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        <span>⚠️</span>
        <span>{t.activeAlerts}</span>
        <span
          className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
            alerts.length === 0 ? "bg-accent-green text-white" : "bg-accent-red text-white"
          }`}
        >
          {alerts.length}
        </span>
      </div>
      <div className="max-h-[120px] overflow-y-auto p-3">
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
