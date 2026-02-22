"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";

const SAMPLE_SERVICES = [
  { name: "Temazcal Ceremony", category: "Traditional", emoji: "\u{1F525}", desc: "Ancient Mayan sweat lodge ritual for purification and renewal", price: "$80 USD", duration: "2 hours" },
  { name: "Jungle Sound Bath", category: "Sound Healing", emoji: "\u{1F3B5}", desc: "Crystal bowls and gongs in an open-air jungle setting", price: "$45 USD", duration: "75 min" },
  { name: "Reiki & Crystal Healing", category: "Energy Work", emoji: "\u{1F48E}", desc: "Chakra balancing with certified Reiki master and local crystals", price: "$60 USD", duration: "60 min" },
  { name: "Mayan Clay Detox", category: "Body Treatment", emoji: "\u{1F9D6}", desc: "Full body clay wrap using natural Yucat\u00E1n minerals", price: "$95 USD", duration: "90 min" },
  { name: "Breathwork at Sunrise", category: "Breathwork", emoji: "\u{1F305}", desc: "Guided breathwork session on the beach at dawn", price: "$35 USD", duration: "60 min" },
];

const CATEGORIES = ["All", "Traditional", "Sound Healing", "Energy Work", "Body Treatment", "Breathwork"];

const cardStyle: React.CSSProperties = {
  position: "relative",
  background: "var(--card-bg)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "16px",
  padding: "16px 20px",
  transition: "background 0.2s, border-color 0.2s",
};

export default function HealingPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang];
  const tAny = t as Record<string, string>;
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? SAMPLE_SERVICES
    : SAMPLE_SERVICES.filter((s) => s.category === activeCategory);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
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
          borderBottom: "1px solid var(--border-subtle)",
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
            background: "var(--button-secondary)",
            border: "1px solid var(--border-emphasis)",
            color: "var(--text-primary)",
            fontSize: "20px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          &larr;
        </Link>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
          {"\u{1F33F}"} {tAny.healing ?? "Healing"}
        </h1>
      </header>

      {/* Preview banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(0,206,209,0.15), rgba(255,193,7,0.15))",
          border: "1px solid rgba(0,206,209,0.3)",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "20px",
          fontSize: "13px",
          color: "var(--text-secondary)",
          lineHeight: 1.4,
        }}
      >
        {"\u{1F6A7}"} <strong style={{ color: "var(--text-primary)" }}>Preview Mode</strong> &mdash; Sample data shown to demonstrate this upcoming feature
      </div>

      {/* Category filter chips */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "16px",
          marginBottom: "16px",
          scrollbarWidth: "none",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: activeCategory === cat ? "rgba(0,206,209,0.6)" : "var(--border-subtle)",
              background: activeCategory === cat ? "rgba(0,206,209,0.15)" : "var(--card-bg)",
              color: activeCategory === cat ? "#00CED1" : "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((svc) => (
          <div
            key={svc.name}
            style={cardStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--card-hover)";
              e.currentTarget.style.borderColor = "var(--border-emphasis)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--card-bg)";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            {/* SAMPLE badge */}
            <span
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(255,193,7,0.2)",
                color: "#FFC107",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "4px",
                letterSpacing: "0.5px",
              }}
            >
              SAMPLE
            </span>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <span style={{ fontSize: "32px", lineHeight: 1 }}>{svc.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: "16px", display: "block", marginBottom: "4px" }}>{svc.name}</strong>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      background: "var(--button-secondary)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {svc.category}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#00CED1",
                      background: "rgba(0,206,209,0.12)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontWeight: 600,
                    }}
                  >
                    {svc.price}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      background: "var(--button-secondary)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {"\u{23F1}\uFE0F"} {svc.duration}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {svc.desc}
                </p>
                <button
                  disabled
                  style={{
                    marginTop: "12px",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--button-secondary)",
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "not-allowed",
                    opacity: 0.5,
                    fontFamily: "inherit",
                  }}
                >
                  Book Session
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
