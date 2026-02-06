"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const INTEREST_OPTIONS: { id: string; labelEn: string; icon: string }[] = [
  { id: "beaches", labelEn: "Beaches & Beach Clubs", icon: "🏖️" },
  { id: "cenotes", labelEn: "Cenotes & Swimming", icon: "💧" },
  { id: "ruins", labelEn: "Mayan Ruins & History", icon: "🏛️" },
  { id: "food", labelEn: "Food & Dining", icon: "🍽️" },
  { id: "nightlife", labelEn: "Nightlife & Parties", icon: "🎉" },
  { id: "wellness", labelEn: "Yoga & Wellness", icon: "🧘" },
  { id: "adventure", labelEn: "Adventure Sports", icon: "🤿" },
  { id: "nature", labelEn: "Nature & Wildlife", icon: "🌿" },
];

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
    coordinates?: { lat?: number; lng?: number };
  }[];
};

type ItineraryData = {
  title?: string;
  summary?: string;
  days?: ItineraryDay[];
  tips?: string[];
  estimated_total_cost?: string;
  rawText?: string;
};

const cardStyle = {
  background: "var(--card-bg)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "16px",
  padding: "24px",
};

export default function ItineraryPage() {
  const searchParams = useSearchParams();
  const lang = (searchParams.get("lang") as Lang) || "en";
  const t = translations[lang] as Record<string, string>;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [formData, setFormData] = useState({
    days: 3,
    interests: [] as string[],
    budget: "medium",
    groupType: "couple",
  });

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const generate = async () => {
    if (formData.interests.length === 0) {
      setError(t.selectOneInterest ?? "Select at least one interest");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.itinerary) {
        setItinerary(data.itinerary as ItineraryData);
      } else {
        setError(data.error ?? "Failed to generate");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <header
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "24px",
          paddingTop: "max(24px, env(safe-area-inset-top))",
          borderBottom: "1px solid var(--border-subtle)",
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
          ←
        </Link>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
          ✨ {t.aiItinerary ?? "AI Itinerary"}
        </h1>
      </header>

      <main
        style={{
          flex: 1,
          padding: "24px",
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        }}
      >
      {!itinerary ? (
        <div style={{ ...cardStyle, maxWidth: "800px", margin: "0 auto" }}>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "24px",
              fontSize: "15px",
            }}
          >
            {t.itinerarySubtitle ?? "Let AI create your perfect Tulum adventure"}
          </p>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                fontSize: "16px",
                fontWeight: "600",
                display: "block",
                marginBottom: "12px",
              }}
            >
              {t.howManyDays ?? "How many days?"} 📅
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, days: d }))}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "12px",
                    background:
                      formData.days === d
                        ? "linear-gradient(135deg, var(--tulum-turquoise, #00D4D4) 0%, #00BABA 100%)"
                        : "rgba(255,255,255,0.06)",
                    border:
                      formData.days === d
                        ? "2px solid var(--tulum-turquoise, #00D4D4)"
                        : "2px solid transparent",
                    color: "#FFF",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                fontSize: "16px",
                fontWeight: "600",
                display: "block",
                marginBottom: "12px",
              }}
            >
              {t.whatInterestsYou ?? "What interests you?"} ✨
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "10px",
              }}
            >
              {INTEREST_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleInterest(opt.id)}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    background: formData.interests.includes(opt.id)
                      ? "rgba(0, 212, 212, 0.15)"
                      : "rgba(255,255,255,0.05)",
                    border: formData.interests.includes(opt.id)
                      ? "2px solid var(--tulum-turquoise, #00D4D4)"
                      : "2px solid transparent",
                    color: "#FFF",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{opt.icon}</span>
                  {opt.labelEn}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                fontSize: "16px",
                fontWeight: "600",
                display: "block",
                marginBottom: "12px",
              }}
            >
              {t.budgetLabel ?? "Budget"} 💰
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {[
                { value: "low", labelKey: "lowBudget", desc: "$50-100/day" },
                { value: "medium", labelKey: "mediumBudget", desc: "$100-200/day" },
                { value: "high", labelKey: "highBudget", desc: "$200+/day" },
              ].map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, budget: b.value }))}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background:
                      formData.budget === b.value
                        ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      formData.budget === b.value ? "2px solid #FFD700" : "2px solid transparent",
                    color: formData.budget === b.value ? "#000" : "#FFF",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  <div>{t[b.labelKey] ?? b.labelKey}</div>
                  <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                fontSize: "16px",
                fontWeight: "600",
                display: "block",
                marginBottom: "12px",
              }}
            >
              {t.travelingWith ?? "Traveling with?"} 👥
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {[
                { value: "solo", labelKey: "solo", icon: "🧳" },
                { value: "couple", labelKey: "couple", icon: "💑" },
                { value: "family", labelKey: "family", icon: "👨‍👩‍👧‍👦" },
                { value: "friends", labelKey: "friends", icon: "👯" },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, groupType: g.value }))}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background:
                      formData.groupType === g.value
                        ? "rgba(80, 200, 120, 0.2)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      formData.groupType === g.value
                        ? "2px solid #50C878"
                        : "2px solid transparent",
                    color: "#FFF",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "4px" }}>{g.icon}</div>
                  {t[g.labelKey] ?? g.labelKey}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p
              style={{
                padding: "12px",
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: "12px",
                color: "#EF4444",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={loading}
            style={{
              width: "100%",
              padding: "18px",
              borderRadius: "16px",
              background: loading
                ? "rgba(255,255,255,0.1)"
                : "linear-gradient(135deg, var(--tulum-turquoise, #00D4D4) 0%, #50C878 100%)",
              border: "none",
              color: "#FFF",
              fontSize: "18px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span>
                {t.creatingItinerary ?? "Creating your itinerary…"}
              </span>
            ) : (
              `✨ ${t.generateItinerary ?? "Generate AI Itinerary"}`
            )}
          </button>
        </div>
      ) : (
        <ItineraryDisplay
          itinerary={itinerary}
          lang={lang}
          onReset={() => setItinerary(null)}
          t={t}
        />
      )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ItineraryDisplay({
  itinerary,
  lang,
  onReset,
  t,
}: {
  itinerary: ItineraryData;
  lang: Lang;
  onReset: () => void;
  t: Record<string, string>;
}) {
  const [selectedDay, setSelectedDay] = useState(0);
  const days = itinerary.days ?? [];
  const day = days[selectedDay];

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ ...cardStyle, marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 8px 0" }}>
              {itinerary.title ?? "Your Tulum Itinerary"}
            </h2>
            {itinerary.summary && (
              <p style={{ color: "var(--text-secondary)", fontSize: "15px", margin: 0, lineHeight: 1.5 }}>
                {itinerary.summary}
              </p>
            )}
            {itinerary.estimated_total_cost && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  background: "rgba(0, 212, 212, 0.1)",
                  borderRadius: "10px",
                  display: "inline-block",
                }}
              >
                <span style={{ fontSize: "13px", opacity: 0.9 }}>{t.estimatedCost ?? "Estimated cost"}: </span>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--tulum-turquoise, #00D4D4)" }}>
                  {itinerary.estimated_total_cost}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🔄 {t.createNew ?? "Create New"}
          </button>
        </div>
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
                  background: selectedDay === i ? "var(--tulum-turquoise, #00D4D4)" : "rgba(255,255,255,0.06)",
                  border: "none",
                  color: "#FFF",
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
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "14px",
                      border: "1px solid var(--border-subtle)",
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
                            color: "var(--tulum-turquoise, #00D4D4)",
                          }}
                        >
                          {act.time}
                        </span>
                      )}
                      {act.duration && (
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.05)",
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {act.duration}
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px" }}>{act.title ?? "Activity"}</h4>
                    {act.location && (
                      <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                        📍 {act.location}
                      </div>
                    )}
                    {act.description && (
                      <p style={{ fontSize: "15px", lineHeight: 1.5, color: "var(--text-primary)", marginBottom: "12px" }}>
                        {act.description}
                      </p>
                    )}
                    {act.tips && act.tips.length > 0 && (
                      <div
                        style={{
                          padding: "12px",
                          background: "rgba(255, 215, 0, 0.08)",
                          borderRadius: "10px",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#FFD700", marginBottom: "6px" }}>
                          💡 Tips
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--text-secondary)" }}>
                          {act.tips.map((tip, j) => (
                            <li key={j}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {act.estimated_cost && (
                      <div style={{ fontSize: "14px", color: "#50C878", fontWeight: "600" }}>
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
              <li key={i} style={{ marginBottom: "6px" }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {itinerary.rawText && !itinerary.days?.length && (
        <div style={{ ...cardStyle, marginTop: "24px", whiteSpace: "pre-wrap", fontSize: "14px" }}>
          {itinerary.rawText}
        </div>
      )}
    </div>
  );
}
