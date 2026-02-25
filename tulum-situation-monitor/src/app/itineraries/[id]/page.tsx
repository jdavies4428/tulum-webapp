"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useAuthOptional } from "@/contexts/AuthContext";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { translations } from "@/lib/i18n";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Lang } from "@/lib/weather";

type ItineraryDay = {
  day: number;
  title?: string;
  activities?: {
    time?: string;
    duration?: string;
    title?: string;
    location?: string;
    description?: string;
    tips?: string[];
    estimated_cost?: string;
  }[];
};

type ItineraryData = {
  id?: string;
  title?: string;
  summary?: string;
  days?: ItineraryDay[];
  tips?: string[];
  estimated_total_cost?: string;
};

const cardStyle = {
  background: "var(--card-bg)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "16px",
  padding: "24px",
};

export default function SavedItineraryPage() {
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const auth = useAuthOptional();
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    if (!id || !auth?.isAuthenticated) {
      setLoading(false);
      return;
    }
    fetch(`/api/itinerary/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setItinerary({
          title: data.title,
          summary: data.summary,
          days: data.days ?? [],
          tips: data.tips ?? [],
          estimated_total_cost: data.estimated_total_cost,
        });
      })
      .catch(() => setItinerary(null))
      .finally(() => setLoading(false));
  }, [id, auth?.isAuthenticated]);

  const handleDelete = async () => {
    if (!confirm(t.deleteItineraryConfirm ?? "Delete this itinerary?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/itinerary/${id}`, { method: "DELETE" });
      if (res.ok) {
        window.location.href = `/itineraries?lang=${lang}`;
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
          padding: "24px",
        }}
      >
        <div style={{ color: "var(--tulum-ocean)" }}>{t.loading ?? "Loading…"}</div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          background: "var(--bg-primary)",
          padding: "24px",
        }}
      >
        <p style={{ color: "#666" }}>{t.itineraryNotFound ?? "Itinerary not found"}</p>
        <Link
          href={`/itineraries?lang=${lang}`}
          style={{
            padding: "14px 24px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            color: "#FFF",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          {t.back ?? "Back"}
        </Link>
      </div>
    );
  }

  const days = itinerary.days ?? [];
  const [selectedDay, setSelectedDay] = useState(0);
  const day = days[selectedDay];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
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
          href={`/itineraries?lang=${lang}`}
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
        <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, flex: 1 }}>
          {itinerary.title ?? "Itinerary"}
        </h1>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid rgba(239,68,68,0.5)",
            background: "rgba(239,68,68,0.1)",
            color: "#EF4444",
            fontSize: "14px",
            fontWeight: 600,
            cursor: deleting ? "default" : "pointer",
          }}
        >
          {deleting ? "…" : t.delete ?? "Delete"}
        </button>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ ...cardStyle, marginBottom: "24px" }}>
          {itinerary.summary && (
            <p style={{ color: "var(--text-secondary)", fontSize: "15px", margin: "0 0 12px 0", lineHeight: 1.5 }}>
              {itinerary.summary}
            </p>
          )}
          {itinerary.estimated_total_cost && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(0, 212, 212, 0.1)",
                borderRadius: "10px",
                display: "inline-block",
              }}
            >
              <span style={{ fontSize: "13px", opacity: 0.9 }}>{t.estimatedCost ?? "Estimated cost"}: </span>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--tulum-turquoise)" }}>
                {itinerary.estimated_total_cost}
              </span>
            </div>
          )}
        </div>

        {days.length > 0 && (
          <>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "8px" }}>
              {days.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDay(i)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    background: selectedDay === i ? "var(--tulum-turquoise)" : "#F7F7F7",
                    border: selectedDay === i ? "none" : "1px solid #EEEEEE",
                    color: selectedDay === i ? "#FFF" : "#222222",
                    fontSize: "15px",
                    fontWeight: "700",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.dayLabel ?? "Day"} {d.day}
                </button>
              ))}
            </div>

            {day && (
              <div style={{ ...cardStyle }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>
                  {day.title ?? `${t.dayLabel ?? "Day"} ${day.day}`}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {(day.activities ?? []).map((act, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "18px",
                        background: "#F7F7F7",
                        borderRadius: "14px",
                        border: "1px solid #EEEEEE",
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                        {act.time && (
                          <span
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              background: "rgba(0, 212, 212, 0.15)",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "var(--tulum-turquoise)",
                            }}
                          >
                            {act.time}
                          </span>
                        )}
                        {act.duration && (
                          <span style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.04)", fontSize: "13px", color: "var(--text-secondary)" }}>
                            {act.duration}
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>{act.title ?? "Activity"}</h4>
                      {act.location && (
                        <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>📍 {act.location}</div>
                      )}
                      {act.description && (
                        <p style={{ fontSize: "15px", lineHeight: 1.5, marginBottom: "12px" }}>{act.description}</p>
                      )}
                      {act.tips && act.tips.length > 0 && (
                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)" }}>
                          {act.tips.map((tip, j) => (
                            <li key={j}>{tip}</li>
                          ))}
                        </ul>
                      )}
                      {act.estimated_cost && (
                        <div style={{ fontSize: "14px", color: "#50C878", fontWeight: "600", marginTop: "8px" }}>
                          💰 {act.estimated_cost}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {itinerary.tips && itinerary.tips.length > 0 && (
          <div
            style={{
              marginTop: "24px",
              ...cardStyle,
              borderColor: "rgba(255, 215, 0, 0.3)",
              background: "rgba(255, 215, 0, 0.06)",
            }}
          >
            <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "12px", color: "#FFD700" }}>
              💡 {t.proTips ?? "Pro Tips"}
            </h4>
            <ul style={{ margin: 0, paddingLeft: "24px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {itinerary.tips.map((tip, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <BottomNav lang={lang} />
    </div>
  );
}
