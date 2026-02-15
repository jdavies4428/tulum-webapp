"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { spacing, shadows } from "@/lib/design-tokens";
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

const DailyUpdatesModal = dynamic(
  () => import("./DailyUpdatesModal").then((mod) => ({ default: mod.DailyUpdatesModal })),
  { ssr: false, loading: () => null }
);

const TulumRightNowModal = dynamic(
  () => import("./TulumRightNowModal").then((mod) => ({ default: mod.TulumRightNowModal })),
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
    id: "tulumNow",
    icon: "✨",
    labelKey: "tulumRightNow",
    color: "#FF6B9D",
    priority: null as string | null,
  },
  {
    id: "settings",
    icon: "⚙️",
    labelKey: "settings",
    color: "#9370DB",
    priority: null as string | null,
  },
  {
    id: "dailyUpdates",
    icon: "📱",
    labelKey: "dailyBeachUpdates",
    color: "#00CED1",
    priority: null as string | null,
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
  const [modal, setModal] = useState<"emergency" | "translate" | "taxi" | "currency" | "dailyUpdates" | "tulumNow" | null>(null);
  const pathname = usePathname();
  const router = useRouter();

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
    if (actionId === "settings") {
      router.push(`/settings?lang=${lang}`);
      return;
    }
    if (actionId === "emergency") setModal("emergency");
    else if (actionId === "translate") setModal("translate");
    else if (actionId === "taxi") setModal("taxi");
    else if (actionId === "currency") setModal("currency");
    else if (actionId === "dailyUpdates") setModal("dailyUpdates");
    else if (actionId === "tulumNow") setModal("tulumNow");
  };

  const closeModal = () => setModal(null);

  const isIOS =
    typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Mobile: lower right of header, user circle upper right. Desktop: bottom right of screen
  const positionStyles = isMobile
    ? { top: 80, bottom: "auto", right: spacing.md, left: "auto" }
    : {
        bottom: isIOS ? "calc(60px + env(safe-area-inset-bottom, 0px))" : 60,
        top: "auto",
        right: spacing.lg,
        left: "auto"
      };

  return (
    <>
      {modal === "emergency" && <EmergencyModal lang={lang} onClose={closeModal} />}
      {modal === "translate" && (
        <TranslationModal lang={lang} isOpen={true} onClose={closeModal} />
      )}
      {modal === "taxi" && <TaxiModal lang={lang} onClose={closeModal} />}
      {modal === "currency" && <CurrencyModal lang={lang} onClose={closeModal} />}
      {modal === "dailyUpdates" && <DailyUpdatesModal lang={lang} onClose={closeModal} />}
      {modal === "tulumNow" && <TulumRightNowModal lang={lang} onClose={closeModal} />}

      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="spring-slide-up"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 998,
            animation: "fadeIn 0.3s ease-out",
          }}
          aria-hidden
        />
      )}

      <div
        style={{
          position: "fixed",
          ...positionStyles,
          zIndex: 999,
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: isMobile ? "flex-start" : "flex-end",
          gap: spacing.md,
        }}
      >
        {isExpanded &&
          visibleActions.map((action, index) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleAction(action.id)}
              className="quick-action-fab-item hover-scale"
              data-index={index}
              style={{
                width: isMobile ? 54 : 60,
                minWidth: isMobile ? 54 : 60,
                height: isMobile ? 54 : 60,
                minHeight: isMobile ? 54 : 60,
                borderRadius: "50%",
                background:
                  action.priority === "critical"
                    ? "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)"
                    : `linear-gradient(135deg, ${action.color}F0 0%, ${action.color}CC 100%)`,
                border: `2px solid ${action.priority === "critical" ? "rgba(255, 0, 0, 0.3)" : `${action.color}40`}`,
                boxShadow: action.priority === "critical"
                  ? "0 6px 20px rgba(255, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)"
                  : `0 6px 20px ${action.color}40, 0 2px 8px rgba(0, 0, 0, 0.15)`,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                position: "relative",
                animation: `spring-slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.05}s both`,
                transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <span style={{ fontSize: isMobile ? 22 : 26, filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))" }}>{action.icon}</span>
              <span
                style={{
                  fontSize: isMobile ? 8 : 9,
                  fontWeight: 800,
                  color: "#FFF",
                  textTransform: "uppercase",
                  letterSpacing: "0.3px",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                  lineHeight: 1,
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
          className="quick-action-fab-main shadow-glow"
          style={{
            width: isMobile ? 60 : 68,
            height: isMobile ? 60 : 68,
            borderRadius: "50%",
            background: isExpanded
              ? "linear-gradient(135deg, #FF6B6BF0 0%, #FF5252CC 100%)"
              : "linear-gradient(135deg, #00CED1F0 0%, #00BABACC 100%)",
            border: isExpanded
              ? "2px solid rgba(255, 107, 107, 0.3)"
              : "2px solid rgba(0, 206, 209, 0.3)",
            boxShadow: isExpanded
              ? "0 8px 32px rgba(255, 107, 107, 0.4), 0 3px 12px rgba(0, 0, 0, 0.2)"
              : "0 8px 32px rgba(0, 206, 209, 0.4), 0 3px 12px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
            fontSize: isMobile ? 26 : 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: isExpanded ? "rotate(45deg) scale(1.05)" : "rotate(0deg) scale(1)",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))",
          }}
        >
          ⚡
        </button>
      </div>
    </>
  );
}
