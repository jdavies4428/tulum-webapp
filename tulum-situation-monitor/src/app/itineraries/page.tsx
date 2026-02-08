"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthOptional } from "@/contexts/AuthContext";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { translations } from "@/lib/i18n";

interface SavedItinerary {
  id: string;
  title: string;
  summary: string | null;
  estimated_total_cost: string | null;
  created_at: string;
  days: unknown[];
}

export default function MyItinerariesPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const auth = useAuthOptional();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      setLoading(false);
      return;
    }
    fetch("/api/itinerary/list")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setItineraries(data.itineraries ?? []))
      .catch(() => setItineraries([]))
      .finally(() => setLoading(false));
  }, [auth?.isAuthenticated]);

  if (auth?.loading || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
          padding: "24px",
        }}
      >
        <div style={{ color: "var(--tulum-ocean)", fontSize: "18px" }}>
          {t.loading ?? "Loading…"}
        </div>
      </div>
    );
  }

  if (!auth?.isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
          padding: "24px",
        }}
      >
        <p style={{ color: "#666", fontSize: "18px", textAlign: "center" }}>
          {t.signInToViewItineraries ?? "Sign in to view your saved itineraries"}
        </p>
        <Link
          href={`/signin?next=${encodeURIComponent("/itineraries")}&lang=${lang}`}
          style={{
            padding: "14px 28px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            color: "#FFF",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {t.signIn ?? "Sign in"}
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
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
          href={`/?lang=${lang}`}
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
          ←
        </Link>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
          📋 {t.myItineraries ?? "My Itineraries"}
        </h1>
      </header>

      {itineraries.length === 0 ? (
        <div
          style={{
            padding: "32px",
            background: "var(--card-bg)",
            borderRadius: "16px",
            border: "1px solid var(--border-subtle)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
            {t.noItinerariesYet ?? "No saved itineraries yet"}
          </p>
          <Link
            href={`/itinerary?lang=${lang}`}
            style={{
              display: "inline-block",
              padding: "14px 24px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
              color: "#FFF",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ✨ {t.generateItinerary ?? "Generate AI Itinerary"}
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {itineraries.map((it) => {
            const daysCount = Array.isArray(it.days) ? it.days.length : 0;
            const dateStr = it.created_at
              ? new Date(it.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "";
            return (
              <Link
                key={it.id}
                href={`/itineraries/${it.id}?lang=${lang}`}
                style={{
                  display: "block",
                  padding: "20px",
                  background: "var(--card-bg)",
                  borderRadius: "16px",
                  border: "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  color: "var(--text-primary)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-emphasis)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 8px 0" }}>
                  {it.title}
                </h3>
                {it.summary && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      margin: "0 0 12px 0",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {it.summary}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {daysCount > 0 && (
                    <span>
                      {t.dayLabel ?? "Day"} {daysCount}
                    </span>
                  )}
                  {it.estimated_total_cost && (
                    <span style={{ color: "var(--tulum-ocean)", fontWeight: "600" }}>
                      {it.estimated_total_cost}
                    </span>
                  )}
                  {dateStr && <span>{dateStr}</span>}
                </div>
              </Link>
            );
          })}
          <Link
            href={`/itinerary?lang=${lang}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "16px",
              borderRadius: "16px",
              border: "2px dashed rgba(0, 206, 209, 0.4)",
              color: "var(--tulum-ocean)",
              fontWeight: 600,
              textDecoration: "none",
              marginTop: "8px",
            }}
          >
            ✨ {t.createNew ?? "Create New"}
          </Link>
        </div>
      )}
    </div>
  );
}
