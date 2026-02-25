"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { EmergencyModal } from "./EmergencyModal";
import { TaxiModal } from "./TaxiModal";
import type { Lang } from "@/lib/weather";

// Code-split larger modals
const TranslationModal = dynamic(
  () => import("@/components/translation/TranslationModal").then((mod) => ({ default: mod.TranslationModal })),
  { ssr: false, loading: () => null }
);

const CurrencyModal = dynamic(
  () => import("./CurrencyModal").then((mod) => ({ default: mod.CurrencyModal })),
  { ssr: false, loading: () => null }
);

const DailyUpdatesModal = dynamic(
  () => import("./DailyUpdatesModal").then((mod) => ({ default: mod.DailyUpdatesModal })),
  { ssr: false, loading: () => null }
);

const CurrencyRatesModal = dynamic(
  () => import("./CurrencyRatesModal").then((mod) => ({ default: mod.CurrencyRatesModal })),
  { ssr: false, loading: () => null }
);

export const OPEN_MAP_LAYERS_EVENT = "open-map-layers";
export const OPEN_QUICK_ACTIONS_EVENT = "open-quick-actions";

const ACTIONS = [
  { id: "emergency", icon: "🚨", labelKey: "sos", label: "SOS", priority: "critical" as const },
  { id: "settings", icon: "⚙️", labelKey: "settings", label: "Settings", priority: null as string | null },
  { id: "taxi", icon: "🚕", labelKey: "taxi", label: "Taxi", priority: null as string | null },
  { id: "foodDelivery", icon: "🛵", labelKey: "foodDelivery", label: "Food Delivery", priority: null as string | null },
  { id: "translate", icon: "🌐", labelKey: "translate", label: "Translate", priority: null as string | null },
  { id: "currency", icon: "💱", labelKey: "currencies", label: "Currencies", priority: null as string | null },
  { id: "messages", icon: "💬", labelKey: "messages", label: "Messages", priority: null as string | null },
  { id: "dailyUpdates", icon: "📱", labelKey: "dailyBeachUpdates", label: "Daily Beach Updates", priority: null as string | null },
];

type ModalState = "emergency" | "translate" | "taxi" | "currency" | "currencyRates" | "dailyUpdates" | null;

export function QuickActionsFAB() {
  const [lang] = usePersistedLang(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const router = useRouter();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    const open = () => setIsExpanded(true);
    window.addEventListener(OPEN_QUICK_ACTIONS_EVENT, open);
    return () => window.removeEventListener(OPEN_QUICK_ACTIONS_EVENT, open);
  }, []);

  const t = translations[lang] as Record<string, string>;

  const handleAction = (actionId: string) => {
    setIsExpanded(false);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    switch (actionId) {
      case "settings":
        router.push(`/settings?lang=${lang}`);
        break;
      case "foodDelivery":
        router.push(`/discover/food-delivery?lang=${lang}`);
        break;
      case "emergency":
        setModal("emergency");
        break;
      case "translate":
        setModal("translate");
        break;
      case "taxi":
        setModal("taxi");
        break;
      case "currency":
        setModal("currencyRates");
        break;
      case "messages":
        router.push(`/messages?lang=${lang}`);
        break;
      case "dailyUpdates":
        setModal("dailyUpdates");
        break;
    }
  };

  const closeModal = () => setModal(null);

  return (
    <>
      {modal === "emergency" && <EmergencyModal lang={lang} onClose={closeModal} />}
      {modal === "translate" && (
        <TranslationModal lang={lang} isOpen={true} onClose={closeModal} />
      )}
      {modal === "taxi" && <TaxiModal lang={lang} onClose={closeModal} />}
      {modal === "currency" && <CurrencyModal lang={lang} onClose={closeModal} />}
      {modal === "currencyRates" && (
        <CurrencyRatesModal
          lang={lang}
          onClose={closeModal}
          onOpenCalculator={() => setModal("currency")}
        />
      )}
      {modal === "dailyUpdates" && <DailyUpdatesModal lang={lang} onClose={closeModal} />}

      {/* Quick Actions overlay */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: isMobile ? 10001 : 998,
            animation: "fadeIn 0.2s ease-out",
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: isMobile ? "flex-end" : "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: isMobile ? "24px 24px 0 0" : "24px",
              padding: "24px",
              ...(isMobile
                ? { maxHeight: "80vh" }
                : { width: "90%", maxWidth: "400px" }),
              boxShadow: isMobile
                ? "0 -4px 24px rgba(0,0,0,0.1)"
                : "0 24px 64px rgba(0, 0, 0, 0.15)",
              animation: isMobile
                ? "slideUpMobile 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards"
                : "springSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Drag handle (mobile) */}
            {isMobile && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(0,0,0,0.15)" }} />
              </div>
            )}

            {/* Title */}
            <h2 style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#222222",
              margin: "0 0 20px 0",
              textAlign: "center",
            }}>
              {t.quickActions ?? "Quick Actions"}
            </h2>

            {/* Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}>
              {ACTIONS.map((action) => {
                const isCritical = action.priority === "critical";
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleAction(action.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "20px 12px",
                      borderRadius: "16px",
                      background: isCritical ? "#FFF0F0" : "#F7F7F7",
                      border: isCritical
                        ? "1.5px solid rgba(255, 0, 0, 0.25)"
                        : "1px solid #EEEEEE",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span style={{ fontSize: 32, lineHeight: 1 }}>{action.icon}</span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isCritical ? "#CC0000" : "#222222",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}>
                      {t[action.labelKey] ?? action.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "#F7F7F7",
                border: "1px solid #EEEEEE",
                color: "#222222",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t.close ?? "Close"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
