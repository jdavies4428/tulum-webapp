"use client";

import { useState } from "react";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const ICONS = [
  "❤️",
  "⭐",
  "🏖️",
  "🍽️",
  "💑",
  "👨‍👩‍👧",
  "🎉",
  "🌅",
  "💧",
  "🏛️",
  "☕",
  "🌴",
  "🎨",
  "🏄",
  "🧘",
  "📸",
];

interface CreateListModalProps {
  onClose: () => void;
  onCreate: (name: string, icon: string) => void;
  lang?: Lang;
}

export function CreateListModal({ onClose, onCreate, lang = "en" }: CreateListModalProps) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("❤️");
  const t = translations[lang] as Record<string, string>;

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), selectedIcon);
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFF",
          borderRadius: "24px",
          padding: "32px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h3
          style={{
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "24px",
            color: "#333",
          }}
        >
          {t.createNewList ?? "Create New List"}
        </h3>

        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#666",
              marginBottom: "8px",
              display: "block",
            }}
          >
            {t.listName ?? "List Name"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.listNamePlaceholder ?? "e.g., Romantic Spots"}
            autoFocus
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "2px solid rgba(0, 206, 209, 0.3)",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "32px" }}>
          <label
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#666",
              marginBottom: "12px",
              display: "block",
            }}
          >
            {t.chooseIcon ?? "Choose Icon"}
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              gap: "8px",
            }}
          >
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon)}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background:
                    selectedIcon === icon
                      ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                      : "rgba(0, 0, 0, 0.05)",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "14px",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.05)",
              border: "none",
              fontSize: "16px",
              fontWeight: 600,
              color: "#666",
              cursor: "pointer",
            }}
          >
            {t.cancel ?? "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim()}
            style={{
              padding: "14px",
              borderRadius: "12px",
              background: name.trim()
                ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                : "rgba(0, 206, 209, 0.3)",
              border: "none",
              fontSize: "16px",
              fontWeight: 700,
              color: "#FFF",
              cursor: name.trim() ? "pointer" : "not-allowed",
              boxShadow: name.trim() ? "0 4px 16px rgba(0, 206, 209, 0.3)" : "none",
            }}
          >
            {t.createList ?? "Create List"}
          </button>
        </div>
      </div>
    </div>
  );
}
