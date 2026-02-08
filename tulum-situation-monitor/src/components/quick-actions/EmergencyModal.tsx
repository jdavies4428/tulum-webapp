"use client";

import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface EmergencyModalProps {
  lang: Lang;
  onClose: () => void;
}

const EMERGENCY_CONTACTS = [
  { icon: "🚓", label: "Police", number: "911", href: "tel:911" },
  { icon: "🚑", label: "Ambulance", number: "065", href: "tel:065" },
  { icon: "🔥", label: "Fire Department", number: "068", href: "tel:068" },
  { icon: "🏥", label: "Hospital", number: "+52 984 871 2000", href: "tel:+529848712000" },
  { icon: "🇺🇸", label: "US Embassy", number: "+52 55 5080 2000", href: "tel:+525550802000" },
];

export function EmergencyModal({ lang, onClose }: EmergencyModalProps) {
  const t = translations[lang] as Record<string, string>;
  const title = t.emergencyServices ?? "Emergency Services";

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
        aria-labelledby="emergency-title"
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
          id="emergency-title"
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
          🚨 {title}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {EMERGENCY_CONTACTS.map(({ icon, label, number, href }) => (
            <a
              key={label}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
                borderRadius: 12,
                background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
                border: "none",
                color: "#FFF",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 24 }}>{icon}</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div>{label}</div>
                <div style={{ fontSize: 13, opacity: 0.95 }}>{number}</div>
              </div>
              <span>📞</span>
            </a>
          ))}
        </div>
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
