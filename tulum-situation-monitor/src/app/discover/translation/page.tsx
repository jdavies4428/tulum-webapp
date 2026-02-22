"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { TranslationModal } from "@/components/translation/TranslationModal";

export default function TranslationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang] as Record<string, string>;
  const [modalOpen, setModalOpen] = useState(true);

  const handleClose = () => {
    setModalOpen(false);
    router.push(`/discover?lang=${lang}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1A2332 0%, #0F1419 50%, #0A0E14 100%)",
        color: "#E8ECEF",
      }}
    >
      <TranslationModal
        lang={lang}
        isOpen={modalOpen}
        onClose={handleClose}
      />
    </div>
  );
}
