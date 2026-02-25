"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { BottomNav } from "@/components/layout/BottomNav";

const CATEGORIES = [
  { id: "all", label: "All", color: "#00CED1" },
  { id: "announcements", label: "Announcements", color: "#FF9F43" },
  { id: "housing", label: "Housing", color: "#54A0FF" },
  { id: "services", label: "Services", color: "#5F27CD" },
  { id: "lost-found", label: "Lost & Found", color: "#EE5A24" },
  { id: "rides", label: "Rides & Travel", color: "#0ABDE3" },
  { id: "free", label: "Free / Gifting", color: "#10AC84" },
  { id: "recommendations", label: "Recommendations", color: "#F368E0" },
];

interface Post {
  id: number;
  title: string;
  body: string;
  category: string;
  author: string;
  timeAgo: string;
  pinned?: boolean;
}

const SAMPLE_POSTS: Post[] = [
  {
    id: 1,
    title: "Full Moon Ceremony at Papaya Playa \u2014 Feb 28",
    body: "Join us for a sacred cacao ceremony under the full moon. Live music, fire dancers, and a guided meditation on the beach. Doors open at 8pm. Bring your intention.",
    category: "announcements",
    author: "Papaya Playa Project",
    timeAgo: "2 hours ago",
    pinned: true,
  },
  {
    id: 2,
    title: "Water outage scheduled \u2014 Aldea Zama, March 3",
    body: "Heads up neighbors. Municipal water will be off from 6am\u201312pm for pipe maintenance on Calle Sagitario. Fill your tinacos the night before.",
    category: "announcements",
    author: "Aldea Zama Residents",
    timeAgo: "5 hours ago",
    pinned: true,
  },
  {
    id: 3,
    title: "Bright room in La Veleta coliving \u2014 March",
    body: "Private room with ensuite bath in a quiet coliving house. Fast WiFi, shared kitchen, rooftop with jungle views. 3 other residents, all remote workers. $650/mo all-in.",
    category: "housing",
    author: "Camila R.",
    timeAgo: "1 day ago",
  },
  {
    id: 4,
    title: "Has anyone seen a golden retriever near Aldea Zama?",
    body: "Our dog Luna slipped out yesterday evening near the Aldea Zama entrance. She\u2019s friendly, wearing a blue collar with tags. Please DM if you spot her. We\u2019re heartbroken.",
    category: "lost-found",
    author: "Jake & Maria",
    timeAgo: "6 hours ago",
  },
  {
    id: 5,
    title: "Ride share to Canc\u00FAn airport \u2014 Friday 6am",
    body: "Driving to CUN Friday morning, leaving from centro at 6am sharp. Room for 2\u20133 people. Split gas and toll, works out to about $15 USD each. Reliable car, AC works.",
    category: "rides",
    author: "Tom B.",
    timeAgo: "3 hours ago",
  },
  {
    id: 6,
    title: "Free yoga mats \u2014 moving back to the States",
    body: "Leaving Tulum after two beautiful years. Giving away 3 Manduka mats, some bolsters, and a meditation cushion. All in good shape. Pick up in La Veleta this week.",
    category: "free",
    author: "Sarah K.",
    timeAgo: "12 hours ago",
  },
  {
    id: 7,
    title: "Freelance web developer \u2014 available for short projects",
    body: "Full-stack dev based in Tulum. React, Node, Shopify, WordPress. Happy to work with local businesses on websites, booking systems, or anything digital. Portfolio available.",
    category: "services",
    author: "Daniel M.",
    timeAgo: "2 days ago",
  },
  {
    id: 8,
    title: "Best tacos that aren\u2019t on the tourist strip?",
    body: "Been here two weeks and I\u2019m sure I\u2019m missing the real spots. Where do locals actually eat? Bonus points for al pastor recommendations. Budget-friendly preferred.",
    category: "recommendations",
    author: "Lena W.",
    timeAgo: "4 hours ago",
  },
  {
    id: 9,
    title: "Sound healing \u2014 private sessions at your space",
    body: "Certified sound therapist offering crystal bowl sessions in your home, villa, or hotel. Deep relaxation, stress release, and energetic realignment. 60 or 90 minute sessions.",
    category: "services",
    author: "Ximena L.",
    timeAgo: "1 day ago",
  },
  {
    id: 10,
    title: "Found: set of keys near Hartwood restaurant",
    body: "Found a keyring with 3 keys and a small turtle keychain on the road near Hartwood last night. DM me to describe them and I\u2019ll get them back to you.",
    category: "lost-found",
    author: "Marco P.",
    timeAgo: "8 hours ago",
  },
];

const categoryColorMap: Record<string, string> = {};
CATEGORIES.forEach((c) => { categoryColorMap[c.id] = c.color; });

export default function CommunityBoardPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang] as Record<string, string>;
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? SAMPLE_POSTS
    : SAMPLE_POSTS.filter((p) => p.category === activeCategory);

  // Pinned posts always first
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        color: "#222222",
        paddingTop: "max(24px, env(safe-area-inset-top))",
        paddingBottom: "100px",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "0 24px 20px",
          borderBottom: "1px solid #EEEEEE",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "6px",
          }}
        >
          <Link
            href={`/discover?lang=${lang}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "#F7F7F7",
              border: "1px solid #EEEEEE",
              color: "#717171",
              fontSize: "18px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            &larr;
          </Link>
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "700",
                margin: 0,
                letterSpacing: "-0.3px",
                color: "#222222",
              }}
            >
              {t.communityBoard ?? "Community Board"}
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#6B7280",
                margin: "2px 0 0",
                fontWeight: "500",
              }}
            >
              {t.discoverCommunityDesc ?? "Local updates & tips"}
            </p>
          </div>
        </div>
      </header>

      {/* Preview banner */}
      <div style={{ padding: "16px 24px 0" }}>
        <div
          style={{
            background: "#F7F7F7",
            border: "1px solid #EEEEEE",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "12px",
            color: "#6B7280",
            lineHeight: 1.5,
          }}
        >
          {"\u{1F6A7}"}{" "}
          <strong style={{ color: "#717171" }}>Preview</strong> &mdash; Sample
          posts shown to demonstrate this upcoming feature
        </div>
      </div>

      {/* Category filter */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          padding: "16px 24px",
          scrollbarWidth: "none",
        }}
      >
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: active
                  ? `${cat.color}66`
                  : "#EEEEEE",
                background: active ? `${cat.color}18` : "transparent",
                color: active ? cat.color : "#6B7280",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                letterSpacing: "0.1px",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          padding: "0 24px",
        }}
      >
        {sorted.map((post) => {
          const catColor = categoryColorMap[post.category] || "#00CED1";
          const catLabel =
            CATEGORIES.find((c) => c.id === post.category)?.label ?? "";

          return (
            <article
              key={post.id}
              style={{
                position: "relative",
                background: post.pinned
                  ? "rgba(255, 159, 67, 0.06)"
                  : "rgba(0,0,0,0.02)",
                borderLeft: `3px solid ${catColor}${post.pinned ? "CC" : "55"}`,
                borderRadius: "0 14px 14px 0",
                padding: "20px 22px",
                transition: "all 0.25s ease",
                cursor: "default",
                marginBottom: "0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                e.currentTarget.style.borderLeftColor = catColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = post.pinned
                  ? "rgba(255, 159, 67, 0.06)"
                  : "rgba(0,0,0,0.02)";
                e.currentTarget.style.borderLeftColor = `${catColor}${post.pinned ? "CC" : "55"}`;
              }}
            >
              {/* SAMPLE badge */}
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "rgba(255,193,7,0.12)",
                  color: "rgba(255,193,7,0.5)",
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  letterSpacing: "0.8px",
                }}
              >
                SAMPLE
              </span>

              {/* Meta row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                {post.pinned && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#FF9F43",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    Pinned
                  </span>
                )}
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: catColor,
                    opacity: 0.85,
                  }}
                >
                  {catLabel}
                </span>
                <span style={{ fontSize: "11px", color: "#4B5563" }}>
                  &middot;
                </span>
                <span style={{ fontSize: "11px", color: "#4B5563" }}>
                  {post.timeAgo}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 650,
                  color: "#222222",
                  margin: "0 0 6px",
                  lineHeight: 1.35,
                  letterSpacing: "-0.2px",
                }}
              >
                {post.title}
              </h3>

              {/* Body */}
              <p
                style={{
                  fontSize: "14px",
                  color: "#717171",
                  margin: "0 0 12px",
                  lineHeight: 1.55,
                  fontWeight: 400,
                }}
              >
                {post.body}
              </p>

              {/* Author */}
              <span
                style={{
                  fontSize: "12px",
                  color: "#4B5563",
                  fontWeight: 500,
                }}
              >
                {post.author}
              </span>
            </article>
          );
        })}
      </div>

      {/* Floating "New Post" button */}
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
            padding: "12px 28px",
            borderRadius: "24px",
            border: "1px solid #EEEEEE",
            background: "#F7F7F7",
            color: "#B0B0B0",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "not-allowed",
            fontFamily: "inherit",
            letterSpacing: "0.1px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          + New Post
        </button>
      </div>

      <BottomNav lang={lang} />
    </div>
  );
}
