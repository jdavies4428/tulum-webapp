"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { CurrenciesRates } from "@/app/api/currencies/route";

const ROWS: { key: keyof CurrenciesRates; flag: string }[] = [
  { key: "USD", flag: "🇺🇸" },
  { key: "CAD", flag: "🇨🇦" },
  { key: "EUR", flag: "🇪🇺" },
  { key: "ARS", flag: "🇦🇷" },
];

interface CurrenciesPanelProps {
  lang: Lang;
}

function formatRate(value: number): string {
  if (value >= 100) return value.toFixed(0);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

export function CurrenciesPanel({ lang }: CurrenciesPanelProps) {
  const [rates, setRates] = useState<CurrenciesRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch("/api/currencies")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data: CurrenciesRates) => {
        if (!cancelled) setRates(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const title = t.currenciesPanel ?? "Currencies";

  return (
    <div className="panel" style={{ flexShrink: 0 }}>
      <div className="panel-header">
        <span className="panel-icon">💱</span>
        <span>{title}</span>
      </div>
      <div
        style={{
          padding: "12px 14px",
          fontSize: "13px",
          color: "var(--text-secondary)",
        }}
      >
        {loading && (
          <div style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
            Loading…
          </div>
        )}
        {error && (
          <div style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
            {t.currenciesError ?? "Rates unavailable"}
          </div>
        )}
        {!loading && !error && rates && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {ROWS.map(({ key, flag }) => {
              const value = rates[key];
              if (value == null) return null;
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "16px" }}>{flag}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>
                      {key} / MXN
                    </span>
                  </span>
                  <span style={{ color: "var(--tulum-turquoise, #00D4D4)", fontWeight: "700" }}>
                    {formatRate(value)}
                  </span>
                </div>
              );
            })}
            {ROWS.every((r) => rates[r.key] == null) && (
              <div style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
                {t.currenciesError ?? "Rates unavailable"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
