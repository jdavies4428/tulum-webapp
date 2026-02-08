"use client";

import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

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
        aria-labelledby="taxi-title"
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
          id="taxi-title"
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
          🚕 {title}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TAXI_OPTIONS.map((opt) => (
            <div
              key={opt.name}
              style={{
                padding: 16,
                background: "rgba(255, 215, 0, 0.1)",
                borderRadius: 12,
                border: "2px solid rgba(255, 215, 0, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{opt.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {opt.type}
                    {opt.estimatedWait && ` • ${opt.estimatedWait}`}
                  </div>
                </div>
              </div>
              {opt.note && (
                <div style={{ fontSize: 12, color: "#50C878", marginBottom: 8 }}>✨ {opt.note}</div>
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
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  border: "none",
                  color: "#000",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {opt.action ? "Open App" : `📞 Call ${opt.number}`}
              </button>
            </div>
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
