"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { CurrenciesRates } from "@/app/api/currencies/route";
import { spacing, radius } from "@/lib/design-tokens";
import { Modal } from "@/components/ui/Modal";

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
    <Modal isOpen onClose={onClose} size="sm">
      <div style={{ padding: spacing.lg }}>
        {/* Header */}
        <h2
          id="currency-title"
          style={{
            fontSize: "20px",
            fontWeight: 700,
            margin: `0 0 ${spacing.lg}px 0`,
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          💱 {title}
        </h2>

        {/* Amount Input */}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className="glass hover-lift"
          style={{
            width: "100%",
            padding: spacing.md,
            fontSize: "24px",
            fontWeight: 700,
            borderRadius: radius.md,
            border: "2px solid rgba(0, 206, 209, 0.3)",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#FFF",
            marginBottom: spacing.md,
            textAlign: "center",
            boxSizing: "border-box",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* Currency Selection */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: spacing.md,
            marginBottom: spacing.lg,
            alignItems: "center",
          }}
        >
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="glass"
            style={{
              padding: spacing.sm,
              borderRadius: radius.sm,
              border: "2px solid rgba(0, 206, 209, 0.3)",
              fontSize: "15px",
              fontWeight: 600,
              background: "rgba(255, 255, 255, 0.1)",
              color: "#FFF",
              cursor: "pointer",
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} style={{ background: "#1a1a2e", color: "#FFF" }}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={swap}
            className="interactive hover-scale"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(0, 206, 209, 0.2)",
              border: "2px solid #00CED1",
              fontSize: "20px",
              color: "#00CED1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            ⇄
          </button>

          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="glass"
            style={{
              padding: spacing.sm,
              borderRadius: radius.sm,
              border: "2px solid rgba(0, 206, 209, 0.3)",
              fontSize: "15px",
              fontWeight: 600,
              background: "rgba(255, 255, 255, 0.1)",
              color: "#FFF",
              cursor: "pointer",
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} style={{ background: "#1a1a2e", color: "#FFF" }}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
        </div>

        {/* Loading / Result */}
        {loading && (
          <div
            className="spring-slide-up"
            style={{
              textAlign: "center",
              padding: spacing.lg,
              color: "rgba(255, 255, 255, 0.6)",
              fontSize: "14px",
            }}
          >
            {t.loading ?? "Loading…"}
          </div>
        )}

        {!loading && result != null && (
          <div
            className="spring-slide-up shadow-glow"
            style={{
              padding: spacing.lg,
              background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
              borderRadius: radius.md,
              textAlign: "center",
              color: "#FFF",
              boxShadow: "0 8px 32px rgba(0, 206, 209, 0.4)",
              animation: "spring-slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: spacing.sm }}>
              {amount} {fromCurrency} =
            </div>
            <div style={{ fontSize: "36px", fontWeight: 800 }}>
              {result.toFixed(2)} {toCurrency}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="interactive hover-scale"
          style={{
            marginTop: spacing.lg,
            width: "100%",
            padding: spacing.md,
            borderRadius: radius.md,
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#FFF",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {t.close ?? "Close"}
        </button>
      </div>
    </Modal>
  );
}
