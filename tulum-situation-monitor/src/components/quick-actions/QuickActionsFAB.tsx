"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { EmergencyModal } from "./EmergencyModal";
import { TaxiModal } from "./TaxiModal";
import type { Lang } from "@/lib/weather";

// Code-split large modals for better initial bundle size (~30KB+ savings)
const TranslationModal = dynamic(
  () => import("@/components/translation/TranslationModal").then((mod) => ({ default: mod.TranslationModal })),
  { ssr: false, loading: () => null }
);

const CurrencyModal = dynamic(
  () => import("./CurrencyModal").then((mod) => ({ default: mod.CurrencyModal })),
  { ssr: false, loading: () => null }
);

export const OPEN_MAP_LAYERS_EVENT = "open-map-layers";

const ACTIONS = [
  {
    id: "emergency",
    icon: "🚨",
    labelKey: "sos",
    color: "#FF0000",
    priority: "critical" as const,
  },
  {
    id: "translate",
    icon: "🌐",
    labelKey: "translate",
    color: "#00CED1",
    priority: null as string | null,
  },
  {
    id: "taxi",
    icon: "🚕",
    labelKey: "taxi",
    color: "#FFD700",
    priority: null as string | null,
  },
  {
    id: "currency",
    icon: "💱",
    labelKey: "currenciesPanel",
    color: "#50C878",
    priority: null as string | null,
  },
  {
    id: "mapLayers",
    icon: "🗺️",
    labelKey: "mapLayers",
    color: "#00CED1",
    priority: null as string | null,
    mapOnly: true,
    mobileOnly: true,
  },
] as const;

export function QuickActionsFAB() {
  const [lang] = usePersistedLang(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modal, setModal] = useState<"emergency" | "translate" | "taxi" | "currency" | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const t = translations[lang] as Record<string, string>;

  const visibleActions = ACTIONS.filter((a) => {
    const mapOnly = "mapOnly" in a && a.mapOnly;
    const mobileOnly = "mobileOnly" in a && a.mobileOnly;
    if (mapOnly && pathname !== "/map") return false;
    if (mobileOnly && !isMobile) return false;
    return true;
  });

  const handleAction = (actionId: string) => {
    setIsExpanded(false);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
    if (actionId === "mapLayers") {
      window.dispatchEvent(new CustomEvent(OPEN_MAP_LAYERS_EVENT));
      return;
    }
    if (actionId === "emergency") setModal("emergency");
    else if (actionId === "translate") setModal("translate");
    else if (actionId === "taxi") setModal("taxi");
    else if (actionId === "currency") setModal("currency");
  };

  const closeModal = () => setModal(null);

  const isIOS =
    typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const bottom = isIOS
    ? "calc(60px + env(safe-area-inset-bottom, 0px))"
    : 60;

  return (
    <>
      {modal === "emergency" && <EmergencyModal lang={lang} onClose={closeModal} />}
      {modal === "translate" && (
        <TranslationModal lang={lang} isOpen={true} onClose={closeModal} />
      )}
      {modal === "taxi" && <TaxiModal lang={lang} onClose={closeModal} />}
      {modal === "currency" && <CurrencyModal lang={lang} onClose={closeModal} />}

      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
          }}
          aria-hidden
        />
      )}

      <div
        style={{
          position: "fixed",
          bottom,
          right: 24,
          zIndex: 999,
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        {isExpanded &&
          visibleActions.map((action, index) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleAction(action.id)}
              className="quick-action-fab-item"
              data-index={index}
              style={{
                width: 56,
                minWidth: 56,
                height: 56,
                minHeight: 56,
                borderRadius: "50%",
                background:
                  action.priority === "critical"
                    ? "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)"
                    : `linear-gradient(135deg, ${action.color} 0%, ${action.color}DD 100%)`,
                border: "none",
                boxShadow: `0 8px 24px ${action.color}40`,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                position: "relative",
              }}
            >
              <span style={{ fontSize: 24 }}>{action.icon}</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#FFF",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {t[action.labelKey] ?? action.labelKey}
              </span>
              {action.priority === "critical" && (
                <span
                  className="quick-action-sos-pulse"
                  style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    border: "2px solid #FF0000",
                    pointerEvents: "none",
                  }}
                />
              )}
            </button>
          ))}

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Close quick actions" : "Open quick actions"}
          className="quick-action-fab-main"
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: isExpanded
              ? "linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)"
              : "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            border: "none",
            boxShadow: "0 8px 32px rgba(0, 206, 209, 0.4)",
            cursor: "pointer",
            fontSize: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: isExpanded ? "rotate(45deg) scale(1.1)" : "rotate(0deg) scale(1)",
            transition: "transform 0.3s ease, background 0.3s ease",
          }}
        >
          ⚡
        </button>
      </div>
    </>
  );
}
