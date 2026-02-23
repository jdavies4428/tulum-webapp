"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import type { ConciergeContext } from "@/lib/concierge-prompts";

// ─── Types ───────────────────────────────────────────────────────

interface PulseData {
  timeSegment: string;
  hour: number;
  weather: {
    temp: number;
    feelsLike: number;
    humidity: number;
    code: number;
    label: string;
    emoji: string;
    windSpeed: number;
    uvIndex: number;
    uvLabel: string;
    uvColor: string;
    waterTemp: number | null;
  } | null;
  sun: {
    sunrise: string | null;
    sunset: string | null;
    sunsetISO: string | null;
  };
  topBeach: {
    name: string;
    score: number;
    rating: string;
    emoji: string;
    sargassum: string;
    crowd: string;
  } | null;
  sargassumLevel: string;
}

const SEGMENT_LABELS: Record<string, { label: string; emoji: string }> = {
  morning: { label: "Good Morning", emoji: "🌅" },
  midday: { label: "Midday", emoji: "☀️" },
  afternoon: { label: "Afternoon", emoji: "🌤️" },
  evening: { label: "Good Evening", emoji: "🌅" },
  night: { label: "Tonight", emoji: "🌙" },
};

// ─── Sample Data (Events + Community) ────────────────────────────

const SAMPLE_EVENTS = [
  { title: "Full Moon Ceremony", venue: "Papaya Playa Project", time: "8:00 PM", emoji: "🌕" },
  { title: "Live Jazz Night", venue: "Gitano", time: "9:00 PM", emoji: "🎵" },
  { title: "Sunrise Yoga", venue: "Sanara Hotel", time: "6:30 AM", emoji: "🧘" },
];

const SAMPLE_COMMUNITY = [
  { title: "Ride share to Cancún airport — Friday 6am", category: "Rides", color: "#0ABDE3" },
  { title: "Free yoga mats — moving back to the States", category: "Free", color: "#10AC84" },
  { title: "Best tacos that aren't on the tourist strip?", category: "Recs", color: "#F368E0" },
];

const QUICK_ACTIONS = [
  { label: "Translate", emoji: "🌐", href: "/discover/translation" },
  { label: "Beaches", emoji: "🏖️", href: "/discover/beach-dashboard" },
  { label: "Food", emoji: "🍽️", href: "/discover/food-delivery" },
  { label: "Events", emoji: "📅", href: "/discover/events" },
  { label: "Rides", emoji: "🚗", href: "/discover/transportation" },
];

// ─── Card wrapper ────────────────────────────────────────────────

function PulseCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        background: "rgba(0, 206, 209, 0.06)",
        border: "1px solid rgba(0, 206, 209, 0.12)",
        borderRadius: "20px",
        padding: "20px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {children}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────

function Skeleton({ width, height }: { width: string; height: string }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: "8px",
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function PulsePage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang] as Record<string, string>;

  const [data, setData] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiRequested = useRef(false);

  // Fetch pulse data
  const fetchPulse = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pulse");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Pulse fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPulse();
    const interval = setInterval(fetchPulse, 300_000); // 5 min refresh
    return () => clearInterval(interval);
  }, [fetchPulse]);

  // Stream AI recommendation once data is loaded
  useEffect(() => {
    if (!data?.weather || aiRequested.current) return;
    aiRequested.current = true;
    setAiLoading(true);

    const ctx: ConciergeContext = {
      lang,
      currentWeather: data.weather
        ? {
            temperature: data.weather.temp,
            condition: data.weather.label,
            uvIndex: data.weather.uvIndex,
          }
        : undefined,
      timeOfDay: data.timeSegment,
      sargassumLevel: data.sargassumLevel,
      beachScore: data.topBeach?.score,
      topBeachName: data.topBeach?.name,
      waterTemp: data.weather?.waterTemp,
      windSpeed: data.weather?.windSpeed,
      sunrise: data.sun?.sunrise,
      sunset: data.sun?.sunset,
      crowdLevel: data.topBeach?.crowd,
    };

    // Use dedicated pulse recommendation endpoint (concise, 200 token max)
    fetch("/api/pulse/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: ctx }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("AI response failed");
        const reader = response.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const d = line.slice(6);
              if (d === "[DONE]") break;
              try {
                const parsed = JSON.parse(d);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setAiText(accumulated);
                }
              } catch {
                /* incomplete chunk */
              }
            }
          }
        }
      })
      .catch((e) => console.error("AI stream error:", e))
      .finally(() => setAiLoading(false));
  }, [data, lang]);

  const seg = SEGMENT_LABELS[data?.timeSegment ?? "morning"] ?? SEGMENT_LABELS.morning;

  return (
    <div
      style={{
        height: "100dvh",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        background: "#0F1419",
        color: "#E8ECEF",
        paddingTop: "max(20px, env(safe-area-inset-top))",
        paddingBottom: "100px",
      }}
    >
      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "0 24px 12px",
        }}
      >
        <Link
          href={`/?lang=${lang}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#9BA3AF",
            fontSize: "16px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          &larr;
        </Link>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.3px",
              color: "#E8ECEF",
            }}
          >
            {t.pulse ?? "Tulum Pulse"}
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "#6B7280",
              margin: "2px 0 0",
              fontWeight: 500,
            }}
          >
            {seg.emoji} {t.rightNow ?? "What to do right now"}
          </p>
        </div>
      </header>

      {/* ─── Quick Actions (pinned under header) ─── */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "0 24px 14px",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={`${action.href}?lang=${lang}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "20px",
              background: "rgba(0, 206, 209, 0.06)",
              border: "1px solid rgba(0, 206, 209, 0.12)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            <span style={{ fontSize: "15px" }}>{action.emoji}</span>
            <span style={{ fontSize: "12px", color: "#9BA3AF", fontWeight: 600 }}>
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "0 20px",
        }}
      >
        {/* ─── Conditions Card ─── */}
        <PulseCard delay={0}>
          {loading || !data?.weather ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Skeleton width="60%" height="40px" />
              <Skeleton width="80%" height="16px" />
              <div style={{ display: "flex", gap: "8px" }}>
                <Skeleton width="80px" height="28px" />
                <Skeleton width="80px" height="28px" />
                <Skeleton width="80px" height="28px" />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
                <span style={{ fontSize: "48px", fontWeight: 300, color: "#E8ECEF", lineHeight: 1 }}>
                  {data.weather.temp}°
                </span>
                <span style={{ fontSize: "20px" }}>{data.weather.emoji}</span>
                <span style={{ fontSize: "15px", color: "#9BA3AF", fontWeight: 500 }}>
                  {data.weather.label}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    background: `${data.weather.uvColor}18`,
                    color: data.weather.uvColor,
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  UV {data.weather.uvIndex} · {data.weather.uvLabel}
                </span>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#9BA3AF",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  💨 {data.weather.windSpeed} km/h
                </span>
                {data.weather.waterTemp && (
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "8px",
                      background: "rgba(0, 150, 200, 0.12)",
                      color: "#0ABDE3",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    🌊 {data.weather.waterTemp}°
                  </span>
                )}
                {data.sun.sunset && (
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "8px",
                      background: "rgba(255, 159, 67, 0.12)",
                      color: "#FF9F43",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    🌅 {data.sun.sunset}
                  </span>
                )}
              </div>
            </>
          )}
        </PulseCard>

        {/* ─── Beach Card ─── */}
        {(loading || data?.topBeach) && (
          <PulseCard delay={100}>
            {loading || !data?.topBeach ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Skeleton width="40%" height="14px" />
                <Skeleton width="70%" height="22px" />
                <Skeleton width="50%" height="14px" />
              </div>
            ) : (
              <Link
                href={`/discover/beach-dashboard?lang=${lang}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6B7280",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: "6px",
                  }}
                >
                  {t.bestBeachNow ?? "Best Beach Right Now"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: "#E8ECEF" }}>
                    {data.topBeach.name}
                  </span>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "8px",
                      background: "rgba(0, 206, 209, 0.15)",
                      color: "#00CED1",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {data.topBeach.emoji} {data.topBeach.score}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#9BA3AF" }}>
                    Sargassum: <strong style={{ color: data.sargassumLevel === "low" ? "#4CAF50" : "#FFC107" }}>{data.sargassumLevel}</strong>
                  </span>
                  <span style={{ fontSize: "12px", color: "#4B5563" }}>·</span>
                  <span style={{ fontSize: "12px", color: "#9BA3AF" }}>
                    Crowds: <strong style={{ color: "#9BA3AF" }}>{data.topBeach.crowd}</strong>
                  </span>
                  <span style={{ fontSize: "12px", color: "#4B5563" }}>·</span>
                  <span style={{ fontSize: "12px", color: "#9BA3AF" }}>
                    {data.topBeach.rating}
                  </span>
                </div>
              </Link>
            )}
          </PulseCard>
        )}

        {/* ─── AI Recommendation Card ─── */}
        <PulseCard delay={200}>
          <div
            style={{
              fontSize: "11px",
              color: "#00CED1",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: "10px",
            }}
          >
            ✨ {t.basedOnConditions ?? "Based on conditions right now"}
          </div>
          {aiLoading && !aiText ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Skeleton width="100%" height="16px" />
              <Skeleton width="90%" height="16px" />
              <Skeleton width="70%" height="16px" />
            </div>
          ) : (
            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                color: "#D1D5DB",
                margin: 0,
                fontWeight: 400,
              }}
            >
              {aiText || "Loading recommendation..."}
            </p>
          )}
        </PulseCard>

        {/* ─── Events Card ─── */}
        <PulseCard delay={300}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span
              style={{
                fontSize: "11px",
                color: "#6B7280",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              {t.tonightEvents ?? "Happening Soon"}
            </span>
            <Link
              href={`/discover/events?lang=${lang}`}
              style={{ fontSize: "11px", color: "#00CED1", fontWeight: 600, textDecoration: "none" }}
            >
              See all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {SAMPLE_EVENTS.map((ev) => (
              <div
                key={ev.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "20px", width: "28px", textAlign: "center" }}>
                  {ev.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#E8ECEF" }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>
                    {ev.venue} · {ev.time}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "9px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "rgba(255,193,7,0.12)",
                    color: "rgba(255,193,7,0.5)",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                  }}
                >
                  SAMPLE
                </span>
              </div>
            ))}
          </div>
        </PulseCard>

        {/* ─── Community Card ─── */}
        <PulseCard delay={400}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span
              style={{
                fontSize: "11px",
                color: "#6B7280",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              {t.communityBoard ?? "Community Board"}
            </span>
            <Link
              href={`/discover/community-board?lang=${lang}`}
              style={{ fontSize: "11px", color: "#00CED1", fontWeight: 600, textDecoration: "none" }}
            >
              See all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {SAMPLE_COMMUNITY.map((post) => (
              <div
                key={post.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  borderLeft: `2px solid ${post.color}55`,
                  paddingLeft: "12px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#D1D5DB",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.title}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    color: post.color,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {post.category}
                </span>
              </div>
            ))}
          </div>
        </PulseCard>
      </div>
    </div>
  );
}
