"use client";

import { useState } from "react";
import { AuthPromptModal } from "./AuthPromptModal";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface SignInButtonProps {
  lang?: Lang;
  /** Compact style for tight spaces (e.g. StatusBar) */
  compact?: boolean;
}

export function SignInButton({ lang = "en", compact = false }: SignInButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const t = translations[lang] as Record<string, string>;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        style={{
          padding: compact ? "8px 12px" : "10px 16px",
          borderRadius: compact ? "10px" : "12px",
          background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
          border: "none",
          color: "#FFF",
          fontSize: compact ? "12px" : "14px",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 206, 209, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 206, 209, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 206, 209, 0.3)";
        }}
      >
        <span>{"\u{1F464}"}</span>
        <span>{t.signIn ?? "Sign In"}</span>
      </button>
      <AuthPromptModal
        open={showModal}
        onClose={() => setShowModal(false)}
        reason="generic"
        lang={lang}
      />
    </>
  );
}
