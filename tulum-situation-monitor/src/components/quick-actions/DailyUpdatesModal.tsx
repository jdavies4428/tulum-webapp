"use client";

import { useState } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { spacing, radius, colors, typography } from "@/lib/design-tokens";
import { Modal } from "@/components/ui/Modal";

interface DailyUpdatesModalProps {
  lang: Lang;
  onClose: () => void;
}

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
    // Validate inputs
    if (!phoneNumber || !startDate || !endDate) {
      setError("Please fill in all fields");
      return;
    }

    // Basic phone validation (should start with + for international)
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
              fontWeight: typography.weight.bold,
              color: colors.success,
              marginBottom: spacing.sm,
            }}
          >
            {t.subscribed ?? "You're Subscribed!"}
          </h2>
          <p style={{ color: colors.neutral.gray[600], fontSize: typography.size.sm }}>
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
            fontWeight: typography.weight.bold,
            margin: `0 0 ${spacing.xs}px 0`,
            color: colors.primary.base,
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
            color: colors.neutral.gray[600],
            marginBottom: spacing.lg,
          }}
        >
          {t.dailyUpdatesDescription ??
            "Get daily beach photos and weather forecasts sent to your phone every morning."}
        </p>

        {/* Phone Number */}
        <div style={{ marginBottom: spacing.md }}>
          <label
            style={{
              display: "block",
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
              color: colors.neutral.gray[700],
              marginBottom: spacing.xs,
            }}
          >
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
            spellCheck="false"
            style={{
              width: "100%",
              padding: `${spacing.sm}px ${spacing.md}px`,
              fontSize: typography.size.sm,
              borderRadius: radius.sm,
              border: `2px solid ${colors.neutral.gray[300]}`,
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = colors.primary.base)}
            onBlur={(e) => (e.target.style.borderColor = colors.neutral.gray[300])}
          />
          <small style={{ fontSize: typography.size.xs, color: colors.neutral.gray[500] }}>
            Include country code (e.g., +1 for US, +52 for Mexico)
          </small>
        </div>

        {/* Date Range */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md, marginBottom: spacing.md }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
                color: colors.neutral.gray[700],
                marginBottom: spacing.xs,
              }}
            >
              {t.startDate ?? "Start Date"}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              style={{
                width: "100%",
                padding: `${spacing.sm}px ${spacing.md}px`,
                fontSize: typography.size.sm,
                borderRadius: radius.sm,
                border: `2px solid ${colors.neutral.gray[300]}`,
                outline: "none",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
                color: colors.neutral.gray[700],
                marginBottom: spacing.xs,
              }}
            >
              {t.endDate ?? "End Date"}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
              style={{
                width: "100%",
                padding: `${spacing.sm}px ${spacing.md}px`,
                fontSize: typography.size.sm,
                borderRadius: radius.sm,
                border: `2px solid ${colors.neutral.gray[300]}`,
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Send Time */}
        <div style={{ marginBottom: spacing.lg }}>
          <label
            style={{
              display: "block",
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
              color: colors.neutral.gray[700],
              marginBottom: spacing.xs,
            }}
          >
            {t.sendTime ?? "Send Time (Cancun Time)"}
          </label>
          <select
            value={sendTime}
            onChange={(e) => setSendTime(e.target.value)}
            style={{
              width: "100%",
              padding: `${spacing.sm}px ${spacing.md}px`,
              fontSize: typography.size.sm,
              borderRadius: radius.sm,
              border: `2px solid ${colors.neutral.gray[300]}`,
              outline: "none",
              background: colors.neutral.white,
            }}
          >
            <option value="06:00">6:00 AM</option>
            <option value="07:00">7:00 AM (Recommended)</option>
            <option value="08:00">8:00 AM</option>
            <option value="09:00">9:00 AM</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: spacing.md,
              marginBottom: spacing.md,
              background: colors.accent.subtle,
              border: `1px solid ${colors.error}`,
              borderRadius: radius.sm,
              color: colors.error,
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
            background: colors.primary.subtle,
            borderRadius: radius.sm,
            marginBottom: spacing.lg,
            fontSize: typography.size.xs,
            color: colors.neutral.gray[600],
          }}
        >
          <strong>📊 What you'll receive:</strong>
          <ul style={{ margin: `${spacing.xs}px 0`, paddingLeft: spacing.lg }}>
            <li>Daily beach webcam photos (Casa Malca, Akumal)</li>
            <li>7-day weather forecast</li>
            <li>Sargassum conditions</li>
            <li>Water temperature & tide info</li>
          </ul>
          <small style={{ color: colors.neutral.gray[500] }}>
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
                ? colors.neutral.gray[300]
                : `linear-gradient(135deg, ${colors.primary.base} 0%, ${colors.primary.dark} 100%)`,
              color: colors.neutral.white,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.bold,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
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
              background: colors.neutral.white,
              border: `2px solid ${colors.neutral.gray[300]}`,
              color: colors.neutral.gray[700],
              fontSize: typography.size.sm,
              fontWeight: typography.weight.semibold,
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
