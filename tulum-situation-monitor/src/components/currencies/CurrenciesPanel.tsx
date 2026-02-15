"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { CurrenciesRates } from "@/app/api/currencies/route";
import { spacing, radius } from "@/lib/design-tokens";
import { Card, CardContent } from "@/components/ui/Card";

const ROWS: { key: keyof CurrenciesRates; flag: string }[] = [
  { key: "USD", flag: "🇺🇸" },
  { key: "CAD", flag: "🇨🇦" },
  { key: "EUR", flag: "🇪🇺" },
  { key: "ARS", flag: "🇦🇷" },
  { key: "AUD", flag: "🇦🇺" },
  { key: "BRL", flag: "🇧🇷" },
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
    <Card variant="glass" className="spring-slide-up" style={{ flexShrink: 0, overflow: "hidden" }}>
      {/* Header */}
      <div
        className="glass-heavy"
        style={{
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: `${radius.md}px ${radius.md}px 0 0`,
          display: "flex",
          alignItems: "center",
          gap: spacing.xs,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <span style={{ fontSize: "16px" }}>💱</span>
        <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.7)" }}>
          {title}
        </span>
      </div>

      {/* Content */}
      <CardContent>
        {loading && (
          <div
            className="spring-slide-up"
            style={{
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "14px",
              padding: spacing.md,
            }}
          >
            Loading…
          </div>
        )}

        {error && (
          <div
            className="spring-slide-up"
            style={{
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "14px",
              padding: spacing.md,
            }}
          >
            {t.currenciesError ?? "Rates unavailable"}
          </div>
        )}

        {!loading && !error && rates && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ROWS.map(({ key, flag }, index) => {
              const value = rates[key];
              if (value == null) return null;
              return (
                <div
                  key={key}
                  className="glass hover-lift spring-slide-up"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.sm,
                    padding: `${spacing.sm}px ${spacing.md}px`,
                    borderBottom: index < ROWS.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                    animation: `spring-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s both`,
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
                    <span style={{ fontSize: "20px" }}>{flag}</span>
                    <span style={{ color: "#FFF", fontWeight: 600, fontSize: "13px" }}>
                      {key} / MXN
                    </span>
                  </span>
                  <span
                    style={{
                      color: "#00CED1",
                      fontWeight: 700,
                      fontSize: "14px",
                      textShadow: "0 0 8px rgba(0, 206, 209, 0.3)",
                    }}
                  >
                    {formatRate(value)}
                  </span>
                </div>
              );
            })}
            {ROWS.every((r) => rates[r.key] == null) && (
              <div style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.5)", fontSize: "14px", padding: spacing.md }}>
                {t.currenciesError ?? "Rates unavailable"}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
