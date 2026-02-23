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
export const OPEN_QUICK_ACTIONS_EVENT = "open-quick-actions";

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
    id: "concierge",
    icon: "🤖",
    labelKey: "conciergeTitle",
    color: "#9370DB",
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

  // Listen for external trigger (e.g. from EnhancedSidebar inline button)
  useEffect(() => {
    const open = () => setIsExpanded(true);
    window.addEventListener(OPEN_QUICK_ACTIONS_EVENT, open);
    return () => window.removeEventListener(OPEN_QUICK_ACTIONS_EVENT, open);
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
    if (actionId === "concierge") {
      router.push(`/concierge?lang=${lang}`);
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

  const isHomePage = pathname === "/";
  const isPulsePage = pathname === "/pulse";

  // Mobile home: in-line with the flags + sign-in button row, sized to match flags
  // Mobile other: top-right corner, well left of Sign in button
  // Desktop: bottom-right corner, above the map Sign in button
  const positionStyles = isMobile && isHomePage
    ? { top: 107, bottom: "auto", right: 112, left: "auto", transform: "none" }
    : isMobile
    ? { top: 18, bottom: "auto", right: 145, left: "auto", transform: "none" }
    : {
        bottom: isIOS ? "calc(100px + env(safe-area-inset-bottom, 0px))" : 100,
        top: "auto",
        right: 28,
        left: "auto",
        transform: "none",
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

      {/* Expanded grid overlay */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            zIndex: isMobile ? 10001 : 998,
            animation: "fadeIn 0.2s ease-out",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              width: "100%",
              maxWidth: "320px",
              animation: "springSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {visibleActions.map((action) => (
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
                  background: action.priority === "critical"
                    ? "rgba(255, 0, 0, 0.15)"
                    : "rgba(20, 30, 45, 0.85)",
                  border: action.priority === "critical"
                    ? "1px solid rgba(255, 0, 0, 0.4)"
                    : "1px solid rgba(0, 206, 209, 0.15)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <span style={{ fontSize: 32, lineHeight: 1 }}>{action.icon}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: action.priority === "critical" ? "#FF6B6B" : "#E8ECEF",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {t[action.labelKey] ?? action.labelKey}
                </span>
                {action.priority === "critical" && (
                  <span
                    className="quick-action-sos-pulse"
                    style={{
                      position: "absolute",
                      inset: -3,
                      borderRadius: "16px",
                      border: "2px solid #FF0000",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            style={{
              marginTop: "20px",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              border: "2px solid rgba(255, 255, 255, 0.25)",
              color: "#FFF",
              fontSize: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* FAB trigger button — hidden on mobile home (inline in sidebar) and pulse page (has own quick actions) */}
      {!isExpanded && !(isMobile && isHomePage) && !isPulsePage && (
        <div
          style={{
            position: "fixed",
            ...positionStyles,
            zIndex: isMobile ? 10002 : 999,
          }}
        >
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            aria-label="Open quick actions"
            className="shadow-glow"
            style={{
              width: isMobile ? 38 : 56,
              height: isMobile ? 38 : 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00CED1F0 0%, #00BABACC 100%)",
              border: "2px solid rgba(0, 206, 209, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 206, 209, 0.4), 0 3px 12px rgba(0, 0, 0, 0.2)",
              cursor: "pointer",
              fontSize: isMobile ? 18 : 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))",
            }}
          >
            ⚡
          </button>
        </div>
      )}
    </>
  );
}
