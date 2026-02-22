"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";

const SAMPLE_LISTINGS = [
  { title: "Beach Cruiser Bike", category: "For Sale", emoji: "\u{1F6B2}", desc: "Well-maintained beach cruiser, perfect for getting around town", price: "$150 USD", seller: "Maria T.", posted: "2 days ago" },
  { title: "Furnished Studio \u2014 Monthly", category: "Housing", emoji: "\u{1F3E0}", desc: "Bright studio in La Veleta, WiFi, AC, fully furnished", price: "$800 USD/mo", seller: "Carlos R.", posted: "1 week ago" },
  { title: "Yoga Teacher (200hr RYT)", category: "Services", emoji: "\u{1F9D8}", desc: "Private or group yoga classes, vinyasa & yin, bilingual", price: "Contact", seller: "Ana L.", posted: "3 days ago" },
  { title: "Vintage VW Beetle Tour", category: "Experiences", emoji: "\u{1F697}", desc: "3-hour tour of Tulum\u2019s hidden spots in a classic VW", price: "$45 USD/person", seller: "Diego M.", posted: "5 days ago" },
  { title: "Pro Photography Session", category: "Services", emoji: "\u{1F4F8}", desc: "Professional vacation photos \u2014 couples, families, content creation", price: "$200 USD", seller: "Sofia K.", posted: "1 day ago" },
  { title: "Stand-Up Paddleboard", category: "For Sale", emoji: "\u{1F3C4}", desc: "Inflatable SUP with pump, paddle & bag. Great condition", price: "$250 USD", seller: "Jake W.", posted: "4 days ago" },
];

const CATEGORIES = ["All", "For Sale", "Housing", "Services", "Experiences"];

const categoryColors: Record<string, string> = {
  "For Sale": "#4CAF50",
  "Housing": "#FF9800",
  "Services": "#2196F3",
  "Experiences": "#9C27B0",
};

const cardStyle: React.CSSProperties = {
  position: "relative",
  background: "var(--card-bg)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "16px",
  padding: "16px 20px",
  transition: "background 0.2s, border-color 0.2s",
};

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang];
  const tAny = t as Record<string, string>;
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? SAMPLE_LISTINGS
    : SAMPLE_LISTINGS.filter((l) => l.category === activeCategory);

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
          {"\u{1F3EA}"} {tAny.marketplace ?? "Marketplace"}
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

      {/* Listing cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((listing) => {
          const catColor = categoryColors[listing.category] || "#00CED1";
          return (
            <div
              key={listing.title}
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
                {/* Emoji as image placeholder */}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "12px",
                    background: "var(--button-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    flexShrink: 0,
                  }}
                >
                  {listing.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "15px" }}>{listing.title}</strong>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#00CED1",
                        background: "rgba(0,206,209,0.12)",
                        padding: "2px 10px",
                        borderRadius: "6px",
                        fontWeight: 700,
                      }}
                    >
                      {listing.price}
                    </span>
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      color: catColor,
                      background: `${catColor}20`,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                  >
                    {listing.category}
                  </span>
                  <p style={{ margin: "0 0 8px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {listing.desc}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {listing.seller} &middot; {listing.posted}
                    </span>
                    <button
                      disabled
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-subtle)",
                        background: "var(--button-secondary)",
                        color: "var(--text-secondary)",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "not-allowed",
                        opacity: 0.5,
                        fontFamily: "inherit",
                      }}
                    >
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating "Post a Listing" button */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <button
          disabled
          style={{
            padding: "14px 32px",
            borderRadius: "28px",
            border: "none",
            background: "rgba(0,206,209,0.3)",
            color: "rgba(0,206,209,0.5)",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "not-allowed",
            fontFamily: "inherit",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          + Post a Listing
        </button>
      </div>
    </div>
  );
}
