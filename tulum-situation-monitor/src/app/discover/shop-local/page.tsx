"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";

const SAMPLE_SHOPS = [
  { name: "Luna Artesanal", category: "Handcrafts", emoji: "\u{1F3FA}", desc: "Handmade jewelry, textiles & ceramics by local Mayan artisans", price: "$$" },
  { name: "Selva Boutique", category: "Fashion", emoji: "\u{1F457}", desc: "Bohemian resort wear, linen clothing & leather sandals", price: "$$" },
  { name: "Cacao & Copal", category: "Wellness", emoji: "\u{1F331}", desc: "Organic cacao, copal incense, essential oils & local remedies", price: "$" },
  { name: "Tulum Surf Shop", category: "Surf & Beach", emoji: "\u{1F3C4}", desc: "Surfboards, snorkel gear, reef-safe sunscreen & swimwear", price: "$$" },
  { name: "Mercado Art\u00EDstico", category: "Art", emoji: "\u{1F3A8}", desc: "Contemporary Mexican art, photography prints & sculptures", price: "$$$" },
  { name: "Ra\u00EDces Concept Store", category: "Home", emoji: "\u{1F3E0}", desc: "Sustainable home d\u00E9cor, hammocks & handwoven blankets", price: "$$" },
];

const CATEGORIES = ["All", "Handcrafts", "Fashion", "Wellness", "Surf & Beach", "Art", "Home"];

const cardStyle: React.CSSProperties = {
  position: "relative",
  background: "var(--card-bg)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "16px",
  padding: "16px 20px",
  transition: "background 0.2s, border-color 0.2s",
};

export default function ShopLocalPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang];
  const tAny = t as Record<string, string>;
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? SAMPLE_SHOPS
    : SAMPLE_SHOPS.filter((s) => s.category === activeCategory);

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
          {"\u{1F6CD}\uFE0F"} {tAny.shopLocal ?? "Shop Local"}
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

      {/* Shop cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((shop) => (
          <div
            key={shop.name}
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
              <span style={{ fontSize: "32px", lineHeight: 1 }}>{shop.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "16px" }}>{shop.name}</strong>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#00CED1",
                      background: "rgba(0,206,209,0.12)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontWeight: 600,
                    }}
                  >
                    {shop.price}
                  </span>
                </div>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                    background: "var(--button-secondary)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    marginBottom: "6px",
                  }}
                >
                  {shop.category}
                </span>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {shop.desc}
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
                  Visit Shop
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
