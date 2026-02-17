"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { CurrenciesRates } from "@/app/api/currencies/route";
import { spacing, radius } from "@/lib/design-tokens";
import { Card, CardContent } from "@/components/ui/Card";

const ROWS: { key: keyof CurrenciesRates; flag: string; name: string }[] = [
  { key: "USD", flag: "🇺🇸", name: "US Dollar" },
  { key: "CAD", flag: "🇨🇦", name: "Canadian Dollar" },
  { key: "EUR", flag: "🇪🇺", name: "Euro" },
  { key: "ARS", flag: "🇦🇷", name: "Argentine Peso" },
  { key: "AUD", flag: "🇦🇺", name: "Australian Dollar" },
  { key: "BRL", flag: "🇧🇷", name: "Brazilian Real" },
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

  return (
    <Card variant="glass" className="spring-slide-up" style={{ flexShrink: 0, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          padding: `${spacing.md}px`,
          background: "rgba(0, 0, 0, 0.3)",
          borderBottom: "2px solid rgba(0, 206, 209, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: "4px" }}>
          <span style={{ fontSize: "18px" }}>💵</span>
          <span style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#FFF" }}>
            {t.exchangeRates ?? "Exchange Rates"}
          </span>
        </div>
        <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)", fontWeight: 600, paddingLeft: "26px" }}>
          {t.toMexicanPeso ?? "to Mexican Peso (MXN)"} 🇲🇽
        </div>
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
            {t.loading ?? "Loading…"}
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
            {ROWS.map(({ key, flag, name }, index) => {
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
                    padding: `${spacing.md}px`,
                    borderBottom: index < ROWS.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                    animation: `spring-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s both`,
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                    <span style={{ fontSize: "24px" }}>{flag}</span>
                    <div>
                      <div style={{ color: "#FFF", fontWeight: 700, fontSize: "13px", lineHeight: "1.3" }}>
                        {name}
                      </div>
                      <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "11px", fontWeight: 600 }}>
                        1 {key} = ${formatRate(value)} MXN
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#00CED1",
                      fontWeight: 900,
                      fontSize: "20px",
                      textShadow: "0 0 8px rgba(0, 206, 209, 0.3)",
                    }}
                  >
                    ${formatRate(value)}
                  </div>
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
