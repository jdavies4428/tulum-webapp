"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { TranslationModal } from "@/components/translation/TranslationModal";

export default function TranslationPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang] as Record<string, string>;
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1A2332 0%, #0F1419 50%, #0A0E14 100%)",
        color: "#E8ECEF",
        padding: "24px",
        paddingTop: "max(24px, env(safe-area-inset-top))",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
          paddingBottom: "16px",
        }}
      >
        <Link
          href={`/discover?lang=${lang}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "rgba(0, 206, 209, 0.12)",
            border: "2px solid rgba(0, 206, 209, 0.2)",
            color: "#00CED1",
            fontSize: "20px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "800",
            margin: 0,
            color: "#00CED1",
          }}
        >
          🌐 {t.translation ?? "Translation"}
        </h1>
      </header>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "24px",
        }}
      >
        <p
          style={{
            fontSize: "16px",
            color: "#9BA3AF",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          {lang === "es"
            ? "Traduce texto en tiempo real o explora frases comunes para viajeros."
            : lang === "fr"
              ? "Traduisez du texte en temps réel ou explorez les phrases courantes pour les voyageurs."
              : "Translate text in real time or explore common phrases for travelers."}
        </p>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          style={{
            padding: "16px 32px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            border: "none",
            fontSize: "16px",
            fontWeight: "700",
            color: "#FFF",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0, 206, 209, 0.3)",
          }}
        >
          ✨ {t.openTranslator ?? "Open Translator"}
        </button>
      </div>

      <TranslationModal
        lang={lang}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
