"use client";

import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { spacing, radius } from "@/lib/design-tokens";
import { Modal } from "@/components/ui/Modal";

const INDRIVE = {
  scheme: "indrive://",
  ios: "https://apps.apple.com/app/indrive-taxi-rides-platform/id780125801",
  android: "https://play.google.com/store/apps/details?id=sinet.startup.inDriver",
};

const EIBY = {
  scheme: "eiby://",
  ios: "https://apps.apple.com/us/app/eiby-taxi-cliente/id1254888887",
  android: "https://play.google.com/store/apps/details?id=mx.eiby.eibyusuario",
};

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1);
}

function isAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

function openAppOrStore(scheme: string, iosStore: string, androidStore: string) {
  const storeUrl = isIOS() ? iosStore : isAndroid() ? androidStore : iosStore;
  window.location.href = scheme;
  setTimeout(() => {
    window.location.href = storeUrl;
  }, 1500);
}

interface TaxiModalProps {
  lang: Lang;
  onClose: () => void;
}

const TAXI_OPTIONS = [
  {
    name: "Local Taxi Stand",
    number: "+52 984 871 2345",
    type: "Regular",
    estimatedWait: "5-10 min",
    note: null,
    action: null,
  },
  {
    name: "InDrive",
    type: "App-based",
    estimatedWait: null,
    note: null,
    action: () => openAppOrStore(INDRIVE.scheme, INDRIVE.ios, INDRIVE.android),
    number: null,
  },
  {
    name: "Eiby",
    type: "App-based",
    estimatedWait: null,
    note: null,
    action: () => openAppOrStore(EIBY.scheme, EIBY.ios, EIBY.android),
    number: null,
  },
  {
    name: "Private Driver (Mario)",
    number: "+52 984 123 4567",
    type: "Private",
    estimatedWait: "15-20 min",
    note: "Recommended by locals",
    action: null,
  },
];

export function TaxiModal({ lang, onClose }: TaxiModalProps) {
  const t = translations[lang] as Record<string, string>;
  const title = t.callTaxi ?? "Call a Taxi";

  return (
    <Modal isOpen onClose={onClose} maxWidth="420px">
      <div style={{ padding: spacing.lg }}>
        {/* Header */}
        <h2
          id="taxi-title"
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
          🚕 {title}
        </h2>

        {/* Taxi Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          {TAXI_OPTIONS.map((opt, index) => (
            <div
              key={opt.name}
              className="glass hover-lift spring-slide-up"
              style={{
                padding: spacing.md,
                background: "linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)",
                borderRadius: radius.md,
                border: "2px solid rgba(255, 215, 0, 0.3)",
                animation: `spring-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s both`,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: spacing.sm,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#FFF",
                      marginBottom: spacing.xs,
                    }}
                  >
                    {opt.name}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.7)",
                      fontWeight: 500,
                    }}
                  >
                    {opt.type}
                    {opt.estimatedWait && ` • ${opt.estimatedWait}`}
                  </div>
                </div>
              </div>
              {opt.note && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#50C878",
                    marginBottom: spacing.sm,
                    fontWeight: 600,
                  }}
                >
                  ✨ {opt.note}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (opt.action) {
                    opt.action();
                  } else if (opt.number) {
                    window.location.href = `tel:${opt.number}`;
                  }
                  onClose();
                }}
                className="interactive hover-scale"
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  borderRadius: radius.sm,
                  background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  border: "none",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {opt.action ? "📱 Open App" : `📞 Call ${opt.number}`}
              </button>
            </div>
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
