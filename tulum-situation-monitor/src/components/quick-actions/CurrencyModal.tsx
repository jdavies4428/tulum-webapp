"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { CurrenciesRates } from "@/app/api/currencies/route";
import { spacing, radius } from "@/lib/design-tokens";
import { Modal } from "@/components/ui/Modal";

const CURRENCIES = [
  { code: "USD", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "CAD", flag: "\u{1F1E8}\u{1F1E6}" },
  { code: "EUR", flag: "\u{1F1EA}\u{1F1FA}" },
  { code: "ARS", flag: "\u{1F1E6}\u{1F1F7}" },
  { code: "AUD", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "BRL", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "MXN", flag: "\u{1F1F2}\u{1F1FD}" },
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
            color: "#222222",
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          {title}
        </h2>

        {/* Amount Input */}
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          style={{
            width: "100%",
            padding: spacing.md,
            fontSize: "24px",
            fontWeight: 700,
            borderRadius: radius.md,
            border: "1px solid #DDDDDD",
            background: "#F7F7F7",
            color: "#222222",
            WebkitTextFillColor: "#222222",
            marginBottom: spacing.md,
            textAlign: "center",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
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
            style={{
              padding: spacing.sm,
              borderRadius: radius.sm,
              border: "1px solid #DDDDDD",
              fontSize: "15px",
              fontWeight: 600,
              background: "#F7F7F7",
              color: "#222222",
              cursor: "pointer",
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} style={{ background: "#FFFFFF", color: "#222222" }}>
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
              background: "rgba(0, 206, 209, 0.1)",
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
            style={{
              padding: spacing.sm,
              borderRadius: radius.sm,
              border: "1px solid #DDDDDD",
              fontSize: "15px",
              fontWeight: 600,
              background: "#F7F7F7",
              color: "#222222",
              cursor: "pointer",
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} style={{ background: "#FFFFFF", color: "#222222" }}>
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
              color: "#999999",
              fontSize: "14px",
            }}
          >
            {t.loading ?? "Loading..."}
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
            background: "#F7F7F7",
            border: "1px solid #EEEEEE",
            color: "#222222",
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
