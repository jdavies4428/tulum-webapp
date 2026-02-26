"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { BottomNav } from "@/components/layout/BottomNav";
import type { ConciergeContext } from "@/lib/concierge-prompts";
import { SAMPLE_EVENTS, formatEventDate } from "@/data/sample-events";
import { ThemedEventCard } from "@/components/events/ThemedEventCard";

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

// ─── Sample Data removed — using shared SAMPLE_EVENTS from @/data/sample-events ───

// ─── Unit helpers ────────────────────────────────────────────────
function toF(c: number) { return Math.round(c * 9 / 5 + 32); }
function toMph(kmh: number) { return Math.round(kmh * 0.621371); }

const QUICK_ACTIONS = [
  { label: "Beaches", emoji: "🏖️", href: "/discover/beach-dashboard" },
  { label: "Food", emoji: "🍽️", href: "/discover/food-delivery" },
  { label: "Events", emoji: "📅", href: "/discover/events" },
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
        background: "#F7F7F7",
        border: "1px solid #EEEEEE",
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
        background: "linear-gradient(90deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 100%)",
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

    const useF = lang === "en";
    const ctx: ConciergeContext = {
      lang,
      currentWeather: data.weather
        ? {
            temperature: useF ? toF(data.weather.temp) : data.weather.temp,
            condition: data.weather.label,
            uvIndex: data.weather.uvIndex,
          }
        : undefined,
      timeOfDay: data.timeSegment,
      sargassumLevel: data.sargassumLevel,
      beachScore: data.topBeach?.score,
      topBeachName: data.topBeach?.name,
      waterTemp: data.weather?.waterTemp ? (useF ? toF(data.weather.waterTemp) : data.weather.waterTemp) : null,
      windSpeed: data.weather?.windSpeed ? (useF ? toMph(data.weather.windSpeed) : data.weather.windSpeed) : undefined,
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
        background: "#FFFFFF",
        color: "#222222",
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
        @keyframes fadeSlideUp {
          to { opacity: 1; transform: translateY(0); }
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
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            color: "#222222",
            fontSize: "20px",
            textDecoration: "none",
            flexShrink: 0,
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          ←
        </Link>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.3px",
              color: "#222222",
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
              background: "#F7F7F7",
              border: "1px solid #EEEEEE",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            <span style={{ fontSize: "15px" }}>{action.emoji}</span>
            <span style={{ fontSize: "12px", color: "#717171", fontWeight: 600 }}>
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
                <span style={{ fontSize: "48px", fontWeight: 300, color: "#222222", lineHeight: 1 }}>
                  {lang === "en" ? toF(data.weather.temp) : data.weather.temp}°{lang === "en" ? "F" : ""}
                </span>
                <span style={{ fontSize: "20px" }}>{data.weather.emoji}</span>
                <span style={{ fontSize: "15px", color: "#717171", fontWeight: 500 }}>
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
                    background: "rgba(0,0,0,0.05)",
                    color: "#717171",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  💨 {lang === "en" ? toMph(data.weather.windSpeed) : data.weather.windSpeed} {lang === "en" ? "mph" : "km/h"}
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
                    🌊 {lang === "en" ? toF(data.weather.waterTemp!) : data.weather.waterTemp}°{lang === "en" ? "F" : ""}
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
                  <span style={{ fontSize: "20px", fontWeight: 700, color: "#222222" }}>
                    {data.topBeach.name}
                  </span>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "8px",
                      background: "rgba(0, 206, 209, 0.1)",
                      color: "#00CED1",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {data.topBeach.emoji} {data.topBeach.score}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#717171" }}>
                    Sargassum: <strong style={{ color: data.sargassumLevel === "low" ? "#4CAF50" : "#FFC107" }}>{data.sargassumLevel}</strong>
                  </span>
                  <span style={{ fontSize: "12px", color: "#4B5563" }}>·</span>
                  <span style={{ fontSize: "12px", color: "#717171" }}>
                    Crowds: <strong style={{ color: "#717171" }}>{data.topBeach.crowd}</strong>
                  </span>
                  <span style={{ fontSize: "12px", color: "#4B5563" }}>·</span>
                  <span style={{ fontSize: "12px", color: "#717171" }}>
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
                color: "#555555",
                margin: 0,
                fontWeight: 400,
              }}
            >
              {aiText || "Loading recommendation..."}
            </p>
          )}
        </PulseCard>

        {/* ─── Weekly Events ─── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#222222", margin: 0 }}>
              {t.happeningNow ?? "Weekly Events"}
            </h2>
            <Link
              href={`/discover/events?lang=${lang}`}
              style={{ fontSize: "13px", color: "#00CED1", fontWeight: 600, textDecoration: "none" }}
            >
              {t.exploreAll ?? "See All"} →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {SAMPLE_EVENTS.map((event, idx) => (
              <Link
                key={event.id}
                href={`/discover/events?event=${event.id}&lang=${lang}`}
                style={{
                  textDecoration: "none",
                  display: "block",
                  opacity: 0,
                  transform: "translateY(12px)",
                  animation: `fadeSlideUp 0.5s ease ${idx * 80}ms forwards`,
                }}
              >
                {event.metadata?.card_style ? (
                  <ThemedEventCard event={event} />
                ) : (
                  <div
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      position: "relative",
                      minHeight: "200px",
                      border: "1px solid #EEEEEE",
                    }}
                  >
                    {event.image_url && (
                      <img
                        src={event.image_url}
                        alt={event.author_name}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.05) 100%)" }} />
                    <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", borderRadius: "8px", padding: "4px 10px", fontSize: "10px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.5px" }}>
                      {formatEventDate(event.created_at)}
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px" }}>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 600, marginBottom: "4px" }}>
                        {event.author_avatar} {event.author_name}
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.3 }}>
                        {event.content}
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  );
}
