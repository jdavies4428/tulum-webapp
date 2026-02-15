"use client";

import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { spacing, radius } from "@/lib/design-tokens";
import { Modal } from "@/components/ui/Modal";

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
    <Modal isOpen onClose={onClose} size="sm">
      <div style={{ padding: spacing.lg }}>
        {/* Header */}
        <h2
          id="emergency-title"
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
          🚨 {title}
        </h2>

        {/* Emergency Contacts */}
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          {EMERGENCY_CONTACTS.map(({ icon, label, number, href }, index) => (
            <a
              key={label}
              href={href}
              className="hover-lift spring-slide-up"
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.md,
                padding: spacing.md,
                borderRadius: radius.md,
                background: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                color: "#FFF",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(255, 0, 0, 0.3)",
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                animation: `spring-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s both`,
              }}
            >
              <span style={{ fontSize: "28px" }}>{icon}</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ marginBottom: spacing.xs }}>{label}</div>
                <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: 500 }}>{number}</div>
              </div>
              <span style={{ fontSize: "24px" }}>📞</span>
            </a>
          ))}
        </div>

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
