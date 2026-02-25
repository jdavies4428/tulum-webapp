"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { CurrenciesRates } from "@/app/api/currencies/route";

const ROWS: { key: keyof CurrenciesRates; flag: string; name: string }[] = [
  { key: "USD", flag: "\u{1F1FA}\u{1F1F8}", name: "US Dollar" },
  { key: "CAD", flag: "\u{1F1E8}\u{1F1E6}", name: "Canadian Dollar" },
  { key: "EUR", flag: "\u{1F1EA}\u{1F1FA}", name: "Euro" },
  { key: "ARS", flag: "\u{1F1E6}\u{1F1F7}", name: "Argentine Peso" },
  { key: "AUD", flag: "\u{1F1E6}\u{1F1FA}", name: "Australian Dollar" },
  { key: "BRL", flag: "\u{1F1E7}\u{1F1F7}", name: "Brazilian Real" },
];

function formatRate(value: number): string {
  if (value >= 100) return value.toFixed(0);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

interface CurrencyRatesModalProps {
  lang: Lang;
  onClose: () => void;
  onOpenCalculator: () => void;
}

export function CurrencyRatesModal({ lang, onClose, onOpenCalculator }: CurrencyRatesModalProps) {
  const [rates, setRates] = useState<CurrenciesRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    let cancelled = false;
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
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 10002,
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "420px",
          background: "#FFFFFF",
          borderRadius: "24px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.15)",
          zIndex: 10003,
          overflow: "hidden",
          animation: "springSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #EEEEEE",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#222222", margin: 0 }}>
              {t.exchangeRates ?? "Exchange Rates"}
            </h2>
            <p style={{ fontSize: "13px", color: "#717171", margin: "4px 0 0", fontWeight: 500 }}>
              {t.toMexicanPeso ?? "to Mexican Peso (MXN)"} {"\u{1F1F2}\u{1F1FD}"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "#F7F7F7",
              border: "1px solid #EEEEEE",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#222222",
            }}
          >
            ✕
          </button>
        </div>

        {/* Rates list */}
        <div style={{ padding: "8px 0" }}>
          {loading && (
            <div style={{ textAlign: "center", color: "#999999", fontSize: "14px", padding: "32px" }}>
              {t.loading ?? "Loading..."}
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", color: "#999999", fontSize: "14px", padding: "32px" }}>
              {t.currenciesError ?? "Rates unavailable"}
            </div>
          )}

          {!loading && !error && rates && ROWS.map(({ key, flag, name }, index) => {
            const value = rates[key];
            if (value == null) return null;
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 24px",
                  borderBottom: index < ROWS.length - 1 ? "1px solid #F5F5F5" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "24px" }}>{flag}</span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#222222" }}>{name}</div>
                    <div style={{ fontSize: "12px", color: "#999999", fontWeight: 500 }}>
                      1 {key} = {formatRate(value)} MXN
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#00CED1",
                }}>
                  ${formatRate(value)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calculate Exchange button */}
        <div style={{ padding: "16px 24px 24px" }}>
          <button
            type="button"
            onClick={onOpenCalculator}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
              border: "none",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 206, 209, 0.3)",
            }}
          >
            {t.calculateExchange ?? "Calculate Exchange"}
          </button>
        </div>
      </div>
    </>
  );
}
