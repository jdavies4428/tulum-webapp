"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import type { Lang } from "@/lib/weather";
import type { ScoredBeach } from "@/app/api/beach-conditions/route";

interface BeachConditionsData {
  beaches: ScoredBeach[];
  forecast: { day: string; score: number; emoji: string }[];
  weather: { temp: number; code: number; windSpeed: number } | null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function ConditionBadge({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "rgba(20, 30, 45, 0.85)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#E8ECEF",
      }}
    >
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function BestBeachCard({ beach, t }: { beach: ScoredBeach; t: Record<string, string> }) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${beach.lat},${beach.lng}`;
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
        borderRadius: "24px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 12px 48px rgba(255, 215, 0, 0.3)",
        border: "3px solid rgba(255, 255, 255, 0.5)",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "rgba(0, 0, 0, 0.6)",
          textTransform: "uppercase",
          letterSpacing: "1px",
          marginBottom: "12px",
        }}
      >
        🌟 {t.bestBeachToday ?? "Best Beach Today"}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "28px",
            fontWeight: "800",
            margin: 0,
            color: "#FFF",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          {beach.name}
        </h3>
        <div
          style={{
            fontSize: "48px",
            fontWeight: "800",
            color: "#FFF",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "baseline",
            gap: "4px",
          }}
        >
          <span>{beach.tulumScore.score}</span>
          <span style={{ fontSize: "24px" }}>/10</span>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <ConditionBadge
          icon="🌊"
          label={capitalize(beach.sargassumLevel)}
        />
        <ConditionBadge
          icon="☀️"
          label={beach.weatherLabel}
        />
        <ConditionBadge
          icon="👥"
          label={capitalize(beach.crowdLevel)}
        />
        <ConditionBadge
          icon="📍"
          label={`${beach.distance} km ${t.away ?? "away"}`}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "14px",
            background: "rgba(20, 30, 45, 0.85)",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "700",
            color: "#FF9500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            textDecoration: "none",
          }}
        >
          <span>🗺️</span>
          <span>{t.getDirections ?? "Directions"}</span>
        </a>
        {beach.url && (
          <a
            href={beach.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "14px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.5)",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "700",
              color: "#FFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <span>ℹ️</span>
            <span>{t.details ?? "Details"}</span>
          </a>
        )}
      </div>
    </div>
  );
}

function BeachListItem({
  beach,
  rank,
  t,
}: {
  beach: ScoredBeach;
  rank: number;
  t: Record<string, string>;
}) {
  const scoreColor =
    beach.tulumScore.score >= 8
      ? "#50C878"
      : beach.tulumScore.score >= 6
        ? "#FFD700"
        : "#FF6B6B";
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${beach.lat},${beach.lng}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        background: "rgba(20, 30, 45, 0.6)",
        borderRadius: "12px",
        border: "1px solid rgba(232, 236, 239, 0.15)",
        cursor: "pointer",
        transition: "all 0.2s",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: rank === 1 ? "#FFD700" : "rgba(232, 236, 239, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: "700",
          color: rank === 1 ? "#FFF" : "rgba(232, 236, 239, 0.6)",
        }}
      >
        {rank}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#E8ECEF",
            marginBottom: "4px",
          }}
        >
          {beach.name}
        </div>
        <div style={{ fontSize: "13px", color: "rgba(232, 236, 239, 0.6)" }}>
          🌊 {capitalize(beach.sargassumLevel)} • 📍 {beach.distance} km
        </div>
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: "800",
          color: scoreColor,
        }}
      >
        {beach.tulumScore.score}
      </div>
    </a>
  );
}

function LoadingSkeleton() {
  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          height: 200,
          background: "rgba(20, 30, 45, 0.5)",
          borderRadius: "24px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          height: 120,
          background: "rgba(20, 30, 45, 0.5)",
          borderRadius: "16px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export function BeachConditionsDashboard() {
  const [lang] = usePersistedLang(null);
  const [data, setData] = useState<BeachConditionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/beach-conditions");
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error loading beach conditions");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div
      style={{
        padding: "24px",
        paddingTop: "max(24px, env(safe-area-inset-top))",
        paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        background: "linear-gradient(180deg, #0F172A 0%, #141E2D 100%)",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
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
            background: "rgba(0, 206, 209, 0.12)",
            border: "2px solid rgba(0, 206, 209, 0.2)",
            color: "var(--tulum-ocean)",
            fontSize: "20px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "32px" }}>🏖️</span>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              margin: 0,
              background: "linear-gradient(135deg, #0099CC 0%, #00CED1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t.beachConditions ?? "Beach Conditions"}
          </h1>
        </div>
      </header>

      {loading && <LoadingSkeleton />}
      {error && (
        <div
          style={{
            padding: 24,
            background: "rgba(255, 107, 107, 0.15)",
            borderRadius: 16,
            color: "#c0392b",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}
      {!loading && !error && data && (
        <>
          {data.beaches.length > 0 && (
            <BestBeachCard beach={data.beaches[0]} t={t} />
          )}
          <div
            style={{
              background: "rgba(20, 30, 45, 0.85)",
              borderRadius: "24px",
              padding: "20px",
              marginBottom: "24px",
              border: "2px solid rgba(0, 206, 209, 0.2)",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "16px",
                color: "#E8ECEF",
              }}
            >
              📊 {t.allBeaches ?? "All Beaches"}
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {data.beaches.map((beach, index) => (
                <BeachListItem
                  key={beach.id}
                  beach={beach}
                  rank={index + 1}
                  t={t}
                />
              ))}
            </div>
          </div>
          {data.forecast && data.forecast.length > 0 && (
            <div
              style={{
                background: "rgba(20, 30, 45, 0.85)",
                borderRadius: "24px",
                padding: "20px",
                border: "2px solid rgba(0, 206, 209, 0.2)",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "16px",
                  color: "#E8ECEF",
                }}
              >
                📅 {t.threeDayForecast ?? "3-Day Forecast"}
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                {data.forecast.map((f) => (
                  <div
                    key={f.day}
                    style={{
                      padding: "16px",
                      background: "rgba(0, 206, 209, 0.1)",
                      borderRadius: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(232, 236, 239, 0.6)", marginBottom: 4 }}>
                      {f.day}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0099CC" }}>
                      {f.score}
                    </div>
                    <div style={{ fontSize: 20 }}>{f.emoji}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
