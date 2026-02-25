"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { BottomNav } from "@/components/layout/BottomNav";

const SAMPLE_EXCURSIONS = [
  { name: "Cenote Hopping Tour", category: "Cenotes", emoji: "\u{1F4A7}", desc: "Visit 3 stunning cenotes with guide, snorkel gear included", price: "$65 USD", duration: "4 hours", difficulty: "Easy" as const },
  { name: "Tulum Ruins & Beach", category: "Ruins", emoji: "\u{1F3DB}\uFE0F", desc: "Guided tour of ancient Mayan ruins with beach time after", price: "$45 USD", duration: "3 hours", difficulty: "Easy" as const },
  { name: "Sian Ka\u2019an Biosphere", category: "Nature", emoji: "\u{1F99C}", desc: "UNESCO reserve boat tour \u2014 dolphins, manatees & mangroves", price: "$120 USD", duration: "Full day", difficulty: "Moderate" as const },
  { name: "Sunset Sailing & Snorkel", category: "Water Sports", emoji: "\u26F5", desc: "Catamaran along the coast with reef snorkeling and open bar", price: "$85 USD", duration: "3 hours", difficulty: "Easy" as const },
  { name: "Coba Ruins Bike Tour", category: "Ruins", emoji: "\u{1F6B2}", desc: "Cycle through the jungle to climb Coba\u2019s ancient pyramid", price: "$55 USD", duration: "Half day", difficulty: "Moderate" as const },
  { name: "Bioluminescent Kayak", category: "Night Tours", emoji: "\u2728", desc: "Night kayak through glowing waters in the lagoon", price: "$70 USD", duration: "2 hours", difficulty: "Easy" as const },
];

const CATEGORIES = ["All", "Cenotes", "Ruins", "Nature", "Water Sports", "Night Tours"];

const cardStyle: React.CSSProperties = {
  position: "relative",
  background: "var(--card-bg)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "16px",
  padding: "16px 20px",
  transition: "background 0.2s, border-color 0.2s",
};

const difficultyColors: Record<string, { bg: string; color: string }> = {
  Easy: { bg: "rgba(76,175,80,0.15)", color: "#4CAF50" },
  Moderate: { bg: "rgba(255,193,7,0.15)", color: "#FFC107" },
};

export default function ExcursionsPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang];
  const tAny = t as Record<string, string>;
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? SAMPLE_EXCURSIONS
    : SAMPLE_EXCURSIONS.filter((e) => e.category === activeCategory);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        padding: "24px",
        paddingTop: "max(24px, env(safe-area-inset-top))",
        paddingBottom: "100px",
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
          {"\u26F5"} {tAny.excursions ?? "Excursions"}
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

      {/* Excursion cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((exc) => (
          <div
            key={exc.name}
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
              <span style={{ fontSize: "32px", lineHeight: 1 }}>{exc.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: "16px", display: "block", marginBottom: "4px" }}>{exc.name}</strong>
                <p style={{ margin: "0 0 8px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {exc.desc}
                </p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#00CED1",
                      background: "rgba(0,206,209,0.12)",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      fontWeight: 700,
                    }}
                  >
                    {exc.price}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      background: "var(--button-secondary)",
                      padding: "3px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    {"\u{23F1}\uFE0F"} {exc.duration}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      background: difficultyColors[exc.difficulty].bg,
                      color: difficultyColors[exc.difficulty].color,
                      padding: "3px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    {exc.difficulty}
                  </span>
                </div>
                <button
                  disabled
                  style={{
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
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav lang={lang} />
    </div>
  );
}
