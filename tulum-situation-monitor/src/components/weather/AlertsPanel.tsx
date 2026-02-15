"use client";

import type { Alert } from "@/types/alert";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { spacing, radius } from "@/lib/design-tokens";
import { Card, CardContent } from "@/components/ui/Card";

interface AlertsPanelProps {
  lang: Lang;
  alerts: Alert[];
}

export function AlertsPanel({ lang, alerts }: AlertsPanelProps) {
  const t = translations[lang];

  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case "severe":
        return {
          bg: "rgba(255, 107, 107, 0.15)",
          border: "#FF6B6B",
          text: "#FF6B6B",
        };
      case "moderate":
        return {
          bg: "rgba(245, 158, 11, 0.15)",
          border: "#F59E0B",
          text: "#F59E0B",
        };
      default:
        return {
          bg: "rgba(0, 206, 209, 0.15)",
          border: "#00CED1",
          text: "#00CED1",
        };
    }
  };

  return (
    <Card variant="glass" className="spring-slide-up" style={{ overflow: "hidden" }}>
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
        <span style={{ fontSize: "16px" }}>⚠️</span>
        <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.7)" }}>
          {t.activeAlerts}
        </span>
        <span
          style={{
            marginLeft: "auto",
            padding: `${spacing.xs}px ${spacing.sm}px`,
            borderRadius: radius.sm,
            fontSize: "10px",
            fontWeight: 700,
            background: alerts.length === 0 ? "rgba(80, 200, 120, 0.2)" : "rgba(255, 107, 107, 0.2)",
            color: alerts.length === 0 ? "#50C878" : "#FF6B6B",
            border: `1px solid ${alerts.length === 0 ? "#50C878" : "#FF6B6B"}`,
          }}
        >
          {alerts.length}
        </span>
      </div>

      {/* Alerts List */}
      <CardContent>
        {alerts.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: "14px", color: "#50C878", padding: spacing.md }}>
            {t.noAlerts}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {alerts.map((alert, i) => {
              const colors = getSeverityColors(alert.severity);
              return (
                <div
                  key={i}
                  className="glass hover-lift spring-slide-up"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: spacing.xs,
                    padding: spacing.md,
                    borderBottom: i < alerts.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                    animation: `spring-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.05}s both`,
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                    <span
                      style={{
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        borderRadius: radius.sm,
                        border: `1px solid ${colors.border}`,
                        background: colors.bg,
                        color: colors.text,
                        padding: `${spacing.xs}px ${spacing.sm}px`,
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                    <p style={{ minWidth: 0, flex: 1, fontSize: "14px", fontWeight: 600, color: "#FFF", margin: 0 }}>
                      {alert.title}
                    </p>
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.7)", lineHeight: "1.5", margin: 0 }}>
                    {alert.desc}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
