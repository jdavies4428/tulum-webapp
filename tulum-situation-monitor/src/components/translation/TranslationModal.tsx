"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
];

const MODES = [
  { id: "text" as const, labelKey: "translationText", icon: "💬" },
  { id: "phrases" as const, labelKey: "commonPhrases", icon: "📖" },
];

type Mode = (typeof MODES)[number]["id"];

interface Phrase {
  english: string;
  translated: string;
}

interface PhraseCategory {
  id: string;
  emoji: string;
  label: string;
  phrases: Phrase[];
}

interface TranslationModalProps {
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
}

function TextMode({
  inputText,
  setInputText,
  translatedText,
  sourceLanguage,
  setSourceLanguage,
  targetLanguage,
  setTargetLanguage,
  loading,
  onTranslate,
  onSwap,
  t,
}: {
  inputText: string;
  setInputText: (v: string) => void;
  translatedText: string;
  sourceLanguage: string;
  setSourceLanguage: (v: string) => void;
  targetLanguage: string;
  setTargetLanguage: (v: string) => void;
  loading: boolean;
  onTranslate: () => void;
  onSwap: () => void;
  t: Record<string, string>;
}) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "12px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <select
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "2px solid rgba(0, 206, 209, 0.3)",
            background: "rgba(255, 255, 255, 0.9)",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onSwap}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "rgba(0, 206, 209, 0.15)",
            border: "2px solid #00CED1",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⇄
        </button>

        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "2px solid rgba(0, 206, 209, 0.3)",
            background: "rgba(255, 255, 255, 0.9)",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.name}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "16px",
          border: "2px solid rgba(0, 206, 209, 0.2)",
        }}
      >
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.enterTextToTranslate ?? "Enter text to translate..."}
          style={{
            width: "100%",
            minHeight: "120px",
            border: "none",
            background: "transparent",
            fontSize: "16px",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
      </div>

      <button
        type="button"
        onClick={onTranslate}
        disabled={loading || !inputText.trim()}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "16px",
          background:
            loading || !inputText.trim()
              ? "rgba(0, 206, 209, 0.3)"
              : "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
          border: "none",
          fontSize: "16px",
          fontWeight: "700",
          color: "#FFF",
          cursor: loading || !inputText.trim() ? "not-allowed" : "pointer",
          marginBottom: "16px",
          boxShadow: "0 8px 24px rgba(0, 206, 209, 0.3)",
        }}
      >
        {loading ? (t.translating ?? "Translating...") : (t.translate ?? "Translate")}
      </button>

      {translatedText && (
        <div
          style={{
            background: "rgba(80, 200, 120, 0.15)",
            borderRadius: "16px",
            padding: "20px",
            border: "2px solid rgba(80, 200, 120, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#50C878",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {t.translation ?? "Translation"}:
          </div>
          <div style={{ fontSize: "16px", color: "#333", lineHeight: "1.6" }}>
            {translatedText}
          </div>

          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(translatedText)}
            style={{
              marginTop: "12px",
              padding: "8px 16px",
              borderRadius: "10px",
              background: "rgba(80, 200, 120, 0.2)",
              border: "2px solid #50C878",
              fontSize: "14px",
              fontWeight: "600",
              color: "#50C878",
              cursor: "pointer",
            }}
          >
            📋 {t.copyTranslation ?? "Copy Translation"}
          </button>
        </div>
      )}
    </div>
  );
}

function PhrasesMode({
  categories,
  targetLanguage,
  setTargetLanguage,
  onRefresh,
  loading,
  t,
}: {
  categories: PhraseCategory[];
  targetLanguage: string;
  setTargetLanguage: (v: string) => void;
  onRefresh: () => void;
  loading: boolean;
  t: Record<string, string>;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 1, minWidth: 180 }}>
          <label
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#666",
              marginBottom: "8px",
              display: "block",
            }}
          >
            {t.translateTo ?? "Translate to"}:
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "2px solid rgba(0, 206, 209, 0.3)",
              background: "rgba(255, 255, 255, 0.9)",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            background: loading
              ? "rgba(0, 206, 209, 0.3)"
              : "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            border: "none",
            fontSize: "14px",
            fontWeight: "700",
            color: "#FFF",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "18px" }}>🔄</span>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {categories.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 16px",
            color: "#666",
            fontSize: "15px",
          }}
        >
          Phrases unavailable. Try again or check your connection.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "16px",
                padding: "16px",
                border: "2px solid rgba(0, 206, 209, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#333",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "22px" }}>{cat.emoji}</span>
                {cat.label}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {cat.phrases.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "10px 12px",
                      background: "rgba(0, 206, 209, 0.06)",
                      borderRadius: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", color: "#666", marginBottom: "2px" }}>
                        {p.english}
                      </div>
                      <div style={{ fontSize: "15px", color: "#0099CC", fontWeight: "700" }}>
                        {p.translated}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(p.translated)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "rgba(0, 206, 209, 0.15)",
                        border: "2px solid #00CED1",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#00CED1",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      📋 {t.copy ?? "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TranslationModal({ lang, isOpen, onClose }: TranslationModalProps) {
  const [mode, setMode] = useState<Mode>("text");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [loading, setLoading] = useState(false);
  const [phraseCategories, setPhraseCategories] = useState<PhraseCategory[]>([]);
  const [phrasesLoading, setPhrasesLoading] = useState(false);

  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    if (isOpen && mode === "phrases") {
      loadPhrases();
    }
  }, [isOpen, mode, targetLanguage]);

  async function loadPhrases() {
    setPhrasesLoading(true);
    try {
      const res = await fetch(`/api/translate/phrases/${targetLanguage}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setPhraseCategories(data.categories);
      } else {
        setPhraseCategories([]);
      }
    } catch {
      setPhraseCategories([]);
    } finally {
      setPhrasesLoading(false);
    }
  }

  async function handleTranslate() {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/translate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          sourceLanguage,
          targetLanguage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTranslatedText(data.translated);
      } else {
        setTranslatedText("");
        alert(data.error || t.requestTimeout || "Translation failed. Please try again.");
      }
    } catch (err) {
      setTranslatedText("");
      alert(t.requestTimeout || "Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function swapLanguages() {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(translatedText);
    setTranslatedText(inputText);
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          zIndex: 9998,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "700px",
          height: "min(90vh, 600px)",
          maxHeight: "90vh",
          background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
          borderRadius: "32px",
          border: "3px solid rgba(0, 206, 209, 0.3)",
          boxShadow: "0 24px 80px rgba(0, 206, 209, 0.3)",
          zIndex: 9999,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "24px",
            background: "rgba(255, 255, 255, 0.9)",
            borderBottom: "2px solid rgba(0, 206, 209, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "32px" }}>🌐</span>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  margin: 0,
                  background: "linear-gradient(135deg, #0099CC 0%, #00CED1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t.translation ?? "Translation"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.1)",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${MODES.length}, 1fr)`,
              gap: "8px",
            }}
          >
            {MODES.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  padding: "12px",
                  background:
                    mode === m.id
                      ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                      : "rgba(255, 255, 255, 0.6)",
                  border: mode === m.id ? "2px solid #00CED1" : "2px solid transparent",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: mode === m.id ? "#FFF" : "#333",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.3s",
                }}
              >
                <span style={{ fontSize: "20px" }}>{m.icon}</span>
                {t[m.labelKey] ?? (m.id === "text" ? "Text" : "Phrases")}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "24px",
          }}
        >
          {mode === "text" && (
            <TextMode
              inputText={inputText}
              setInputText={setInputText}
              translatedText={translatedText}
              sourceLanguage={sourceLanguage}
              setSourceLanguage={setSourceLanguage}
              targetLanguage={targetLanguage}
              setTargetLanguage={setTargetLanguage}
              loading={loading}
              onTranslate={handleTranslate}
              onSwap={swapLanguages}
              t={t}
            />
          )}

          {mode === "phrases" && (
            phrasesLoading && phraseCategories.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#666",
                  fontSize: "16px",
                }}
              >
                {t.loading ?? "Loading phrases…"}
              </div>
            ) : (
              <PhrasesMode
                categories={phraseCategories}
                targetLanguage={targetLanguage}
                setTargetLanguage={setTargetLanguage}
                onRefresh={loadPhrases}
                loading={phrasesLoading}
                t={t}
              />
            )
          )}
        </div>
      </div>
    </>
  );
}
