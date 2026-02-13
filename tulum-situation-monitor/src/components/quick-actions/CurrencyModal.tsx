"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { CurrenciesRates } from "@/app/api/currencies/route";

// Match sidebar CurrenciesPanel: all currencies with rates to MXN
const CURRENCIES = [
  { code: "USD", flag: "🇺🇸" },
  { code: "CAD", flag: "🇨🇦" },
  { code: "EUR", flag: "🇪🇺" },
  { code: "ARS", flag: "🇦🇷" },
  { code: "AUD", flag: "🇦🇺" },
  { code: "BRL", flag: "🇧🇷" },
  { code: "MXN", flag: "🇲🇽" },
];

interface CurrencyModalProps {
  lang: Lang;
  onClose: () => void;
}

export function CurrencyModal({ lang, onClose }: CurrencyModalProps) {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("MXN");
  const [rates, setRates] = useState<CurrenciesRates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/currencies")
      .then((r) => r.json())
      .then((data: CurrenciesRates) => setRates(data))
      .catch(() => setRates(null))
      .finally(() => setLoading(false));
  }, []);

  // MXN rate: 1 USD = rates.USD MXN, so 1 MXN = 1/rates.USD USD
  const getRate = (code: string): number => {
    if (!rates) return 0;
    if (code === "MXN") return 1;
    const r = rates[code as keyof CurrenciesRates];
    return r ?? 0;
  };

  const result = (() => {
    const fromRate = getRate(fromCurrency);
    const toRate = getRate(toCurrency);
    if (!fromRate || !toRate) return null;
    return (amount * fromRate) / toRate;
  })();

  const t = translations[lang] as Record<string, string>;
  const title = t.currencyConverter ?? "Currency Converter";

  const swap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
        }}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="currency-title"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(400px, calc(100vw - 32px))",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "var(--bg-panel)",
          borderRadius: 16,
          boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          zIndex: 9999,
          padding: 20,
        }}
      >
        <h2
          id="currency-title"
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: "0 0 16px 0",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          💱 {title}
        </h2>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          style={{
            width: "100%",
            padding: 16,
            fontSize: 24,
            fontWeight: 700,
            borderRadius: 12,
            border: "2px solid rgba(0, 206, 209, 0.3)",
            marginBottom: 16,
            textAlign: "center",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "2px solid rgba(0, 206, 209, 0.3)",
              fontSize: 15,
              fontWeight: 600,
              background: "var(--bg-panel)",
            }}
          >
            {CURRENCIES.filter((c) => c.code !== toCurrency).map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={swap}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(0, 206, 209, 0.15)",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              alignSelf: "center",
            }}
          >
            ⇄
          </button>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "2px solid rgba(0, 206, 209, 0.3)",
              fontSize: 15,
              fontWeight: 600,
              background: "var(--bg-panel)",
            }}
          >
            {CURRENCIES.filter((c) => c.code !== fromCurrency).map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 20, color: "var(--text-tertiary)" }}>
            {t.loading ?? "Loading…"}
          </div>
        )}
        {!loading && result != null && (
          <div
            style={{
              padding: 20,
              background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
              borderRadius: 16,
              textAlign: "center",
              color: "#FFF",
            }}
          >
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
              {amount} {fromCurrency} =
            </div>
            <div style={{ fontSize: 32, fontWeight: 800 }}>
              {result.toFixed(2)} {toCurrency}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 16,
            width: "100%",
            padding: 12,
            borderRadius: 10,
            background: "rgba(0,0,0,0.1)",
            border: "none",
            color: "var(--text-primary)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.close ?? "Close"}
        </button>
      </div>
    </>
  );
}
