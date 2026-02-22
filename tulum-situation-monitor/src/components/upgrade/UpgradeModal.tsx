"use client";

import { useState, useEffect } from "react";
import type { UsageLimits } from "@/lib/usage-tracker";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature?: keyof UsageLimits;
}

const FEATURE_LABELS: Record<keyof UsageLimits, { name: string; icon: string }> = {
  concierge: { name: "AI Concierge messages", icon: "🤖" },
  itinerary: { name: "AI itinerary generations", icon: "📋" },
  translation: { name: "translations", icon: "🌐" },
  placeDetails: { name: "place detail views", icon: "📍" },
};

export function UpgradeModal({ open, onClose, feature }: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  const featureInfo = feature ? FEATURE_LABELS[feature] : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: open ? "fadeIn 0.2s ease-out" : "fadeOut 0.2s ease-out",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        aria-hidden
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          background: "rgba(20, 30, 45, 0.95)",
          borderRadius: 20,
          padding: 32,
          border: "1px solid rgba(0, 206, 209, 0.2)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          animation: open
            ? "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            : "slideDown 0.3s ease-in",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{ textAlign: "center", fontSize: 48, marginBottom: 16 }}>
          {featureInfo?.icon ?? "⚡"}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            textAlign: "center",
            color: "#E8ECEF",
            marginBottom: 8,
          }}
        >
          Daily Limit Reached
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: 15,
            color: "rgba(232, 236, 239, 0.6)",
            textAlign: "center",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          {featureInfo
            ? `You've used all your free ${featureInfo.name} for today.`
            : "You've reached your daily free usage limit."}
          {" "}Come back tomorrow for more, or upgrade for unlimited access.
        </p>

        {/* Pro features */}
        <div
          style={{
            background: "rgba(0, 206, 209, 0.08)",
            border: "1px solid rgba(0, 206, 209, 0.15)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#00CED1",
              marginBottom: 12,
            }}
          >
            Tulum Pro includes:
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              "Unlimited AI concierge messages",
              "Unlimited itinerary generations",
              "Unlimited translations",
              "Priority support",
            ].map((item) => (
              <li
                key={item}
                style={{
                  fontSize: 13,
                  color: "rgba(232, 236, 239, 0.7)",
                  padding: "4px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ color: "#00CED1" }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA (placeholder — no Stripe yet) */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #00CED1, #00A5A8)",
            border: "none",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: 12,
          }}
        >
          Coming Soon
        </button>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            padding: 12,
            background: "transparent",
            border: "none",
            color: "rgba(232, 236, 239, 0.5)",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Maybe tomorrow
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0 }
          to { transform: translateY(0); opacity: 1 }
        }
        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1 }
          to { transform: translateY(20px); opacity: 0 }
        }
      `}</style>
    </div>
  );
}
