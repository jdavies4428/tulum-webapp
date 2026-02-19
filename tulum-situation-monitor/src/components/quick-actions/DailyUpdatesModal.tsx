"use client";

import { useState } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { spacing, radius, typography } from "@/lib/design-tokens";
import { Modal } from "@/components/ui/Modal";

interface DailyUpdatesModalProps {
  lang: Lang;
  onClose: () => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: `${spacing.sm}px ${spacing.md}px`,
  fontSize: "16px",
  borderRadius: radius.sm,
  border: "1px solid rgba(0, 206, 209, 0.2)",
  background: "rgba(0, 0, 0, 0.3)",
  color: "#E8ECEF",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box" as const,
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: typography.size.sm,
  fontWeight: 600,
  color: "rgba(232, 236, 239, 0.7)",
  marginBottom: spacing.xs,
};

export function DailyUpdatesModal({ lang, onClose }: DailyUpdatesModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sendTime, setSendTime] = useState("07:00");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang] as Record<string, string>;
  const title = t.dailyBeachUpdates ?? "Daily Beach Updates";

  const handleSubscribe = async () => {
    if (!phoneNumber || !startDate || !endDate) {
      setError("Please fill in all fields");
      return;
    }

    if (!phoneNumber.startsWith("+")) {
      setError("Phone number must include country code (e.g., +1 for US, +52 for Mexico)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/daily-updates/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          startDate,
          endDate,
          sendTime,
          timezone: "America/Cancun",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Modal isOpen onClose={onClose} size="sm">
        <div style={{ padding: spacing.lg, textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: spacing.md }}>✅</div>
          <h2
            style={{
              fontSize: typography.size.lg,
              fontWeight: 700,
              color: "#00CED1",
              marginBottom: spacing.sm,
            }}
          >
            {t.subscribed ?? "You're Subscribed!"}
          </h2>
          <p style={{ color: "rgba(232, 236, 239, 0.6)", fontSize: typography.size.sm }}>
            {t.dailyUpdatesConfirmation ??
              `You'll receive daily beach updates at ${sendTime} Cancun time from ${startDate} to ${endDate}.`}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} size="sm">
      <div style={{ padding: spacing.lg }}>
        {/* Header */}
        <h2
          style={{
            fontSize: typography.size.lg,
            fontWeight: 700,
            margin: `0 0 ${spacing.xs}px 0`,
            color: "#00CED1",
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          📱 {title}
        </h2>
        <p
          style={{
            fontSize: typography.size.sm,
            color: "rgba(232, 236, 239, 0.6)",
            marginBottom: spacing.lg,
          }}
        >
          {t.dailyUpdatesDescription ??
            "Get daily beach photos and weather forecasts sent to your phone every morning."}
        </p>

        {/* Phone Number */}
        <div style={{ marginBottom: spacing.md }}>
          <label style={LABEL_STYLE}>
            {t.phoneNumber ?? "Phone Number"}
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+52 984 123 4567"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={INPUT_STYLE}
            onFocus={(e) => (e.target.style.borderColor = "#00CED1")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(0, 206, 209, 0.2)")}
          />
          <small style={{ fontSize: typography.size.xs, color: "rgba(232, 236, 239, 0.45)" }}>
            Include country code (e.g., +1 for US, +52 for Mexico)
          </small>
        </div>

        {/* Date Range */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md, marginBottom: spacing.md }}>
          <div>
            <label style={LABEL_STYLE}>
              {t.startDate ?? "Start Date"}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              style={INPUT_STYLE}
            />
          </div>
          <div>
            <label style={LABEL_STYLE}>
              {t.endDate ?? "End Date"}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
              style={INPUT_STYLE}
            />
          </div>
        </div>

        {/* Send Time */}
        <div style={{ marginBottom: spacing.lg }}>
          <label style={LABEL_STYLE}>
            {t.sendTime ?? "Send Time (Cancun Time)"}
          </label>
          <select
            value={sendTime}
            onChange={(e) => setSendTime(e.target.value)}
            style={{
              ...INPUT_STYLE,
              cursor: "pointer",
            }}
          >
            <option value="06:00" style={{ background: "#0F1419" }}>6:00 AM</option>
            <option value="07:00" style={{ background: "#0F1419" }}>7:00 AM (Recommended)</option>
            <option value="08:00" style={{ background: "#0F1419" }}>8:00 AM</option>
            <option value="09:00" style={{ background: "#0F1419" }}>9:00 AM</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: spacing.md,
              marginBottom: spacing.md,
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: radius.sm,
              color: "#F87171",
              fontSize: typography.size.sm,
            }}
          >
            {error}
          </div>
        )}

        {/* Pricing Info */}
        <div
          style={{
            padding: spacing.md,
            background: "rgba(0, 206, 209, 0.08)",
            border: "1px solid rgba(0, 206, 209, 0.15)",
            borderRadius: radius.sm,
            marginBottom: spacing.lg,
            fontSize: typography.size.xs,
            color: "rgba(232, 236, 239, 0.7)",
          }}
        >
          <strong style={{ color: "#E8ECEF" }}>📊 What you&apos;ll receive:</strong>
          <ul style={{ margin: `${spacing.xs}px 0`, paddingLeft: spacing.lg }}>
            <li>Daily beach webcam photos (Casa Malca, Akumal)</li>
            <li>7-day weather forecast</li>
            <li>Sargassum conditions</li>
            <li>Water temperature & tide info</li>
          </ul>
          <small style={{ color: "rgba(232, 236, 239, 0.45)" }}>
            Standard messaging rates apply. You can unsubscribe anytime by replying STOP.
          </small>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: spacing.sm }}>
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              flex: 1,
              padding: `${spacing.md}px ${spacing.lg}px`,
              borderRadius: radius.md,
              background: loading
                ? "rgba(255, 255, 255, 0.1)"
                : "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
              color: "#FFF",
              fontSize: typography.size.sm,
              fontWeight: 700,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: loading ? "none" : "0 4px 16px rgba(0, 206, 209, 0.3)",
            }}
          >
            {loading ? "⏳ Subscribing..." : `📱 ${t.subscribe ?? "Subscribe"}`}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: `${spacing.md}px ${spacing.lg}px`,
              borderRadius: radius.md,
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#E8ECEF",
              fontSize: typography.size.sm,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {t.cancel ?? "Cancel"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
