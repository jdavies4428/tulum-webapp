"use client";

import { useState, useEffect } from "react";
import { useAuthOptional } from "@/contexts/AuthContext";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const WELCOME_SHOWN_KEY = "tulum-welcome-shown";

export function WelcomeModal({ lang = "en" }: { lang?: Lang }) {
  const auth = useAuthOptional();
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);
  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    if (!auth || auth.loading || !auth.user) {
      return;
    }
    const userId = auth.user.id;
    try {
      const shown = typeof window !== "undefined" ? window.localStorage.getItem(WELCOME_SHOWN_KEY) : null;
      if (shown !== userId) {
        setShow(true);
      }
      setChecked(true);
    } catch {
      setChecked(true);
    }
  }, [auth?.user?.id, auth?.loading, auth?.user]);

  const handleClose = () => {
    if (auth?.user?.id) {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(WELCOME_SHOWN_KEY, auth.user.id);
        }
      } catch {
        // ignore
      }
    }
    setShow(false);
  };

  if (!show || !auth?.user) return null;

  const displayName =
    (auth.user.user_metadata?.full_name as string | undefined) ??
    auth.user.email?.split("@")[0] ??
    "";
  const firstName = displayName.split(" ")[0] || "";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
          borderRadius: "24px",
          padding: "40px",
          maxWidth: "500px",
          textAlign: "center",
          border: "3px solid rgba(0, 206, 209, 0.3)",
          boxShadow: "0 24px 80px rgba(0, 206, 209, 0.2)",
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎉</div>

        <h2
          style={{
            fontSize: "28px",
            fontWeight: 800,
            marginBottom: "16px",
            color: "#333",
          }}
        >
          {t.welcomeModalTitle ?? "Welcome to Tulum Discovery!"}
        </h2>

        <p
          style={{
            fontSize: "16px",
            color: "#666",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          {firstName
            ? (t.welcomeModalGreeting ?? "Hey {name}! You can now save favorites, create lists, and get personalized recommendations.").replace("{name}", firstName)
            : t.welcomeModalGreetingNoName ?? "You can now save favorites, create lists, and get personalized recommendations."}
        </p>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "32px",
            textAlign: "left",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "12px",
              color: "#333",
            }}
          >
            {t.welcomeModalWhatsNew ?? "What's new:"}
          </h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: "24px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            <li>❤️ {t.welcomeTipFavorites ?? "Save unlimited favorites"}</li>
            <li>📋 {t.welcomeTipLists ?? "Create custom lists"}</li>
            <li>🔔 {t.welcomeTipAlerts ?? "Set alerts for beach conditions"}</li>
            <li>🔄 {t.welcomeTipSync ?? "Sync across all devices"}</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={handleClose}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            border: "none",
            color: "#FFF",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0, 206, 209, 0.3)",
          }}
        >
          {t.welcomeModalCta ?? "Let's Explore! 🌴"}
        </button>
      </div>
    </div>
  );
}
