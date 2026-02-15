"use client";

import {
  formatTemp,
  formatTempFull,
  formatWind,
  getWeatherDescription,
  getWeatherIcon,
  getWindDirection,
} from "@/lib/weather";
import type { Lang } from "@/lib/weather";
import type { OpenMeteoResponse } from "@/types/weather";
import type { TideState } from "@/hooks/useTides";
import { translations } from "@/lib/i18n";
import { spacing, radius, shadows } from "@/lib/design-tokens";
import { Card, CardContent } from "@/components/ui/Card";

interface WeatherPanelProps {
  lang: Lang;
  data: OpenMeteoResponse | null;
  loading: boolean;
  error?: string | null;
  tide?: TideState;
  waterTemp?: number | null;
  onRefresh: () => void;
}

export function WeatherPanel({ lang, data, loading, error, tide, waterTemp, onRefresh }: WeatherPanelProps) {
  const t = translations[lang];
  const current = data?.current;
  const hourly = data?.hourly;
  const daily = data?.daily;

  if (!data) {
    return (
      <Card variant="glass" className="spring-slide-up">
        <div
          className="glass-heavy interactive"
          style={{
            padding: `${spacing.sm}px ${spacing.md}px`,
            borderRadius: `${radius.md}px ${radius.md}px 0 0`,
            display: "flex",
            alignItems: "center",
            gap: spacing.xs,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <span style={{ fontSize: "16px" }}>🌤️</span>
          <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.7)" }}>
            {t.weatherConditions}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="interactive"
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              opacity: 0.6,
              transition: "all 0.2s",
            }}
          >
            ⟳
          </button>
        </div>
        <CardContent>
          <div style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.6)" }}>
            {loading ? "Loading…" : error ? (
              <span>
                {error}
                <button
                  type="button"
                  onClick={onRefresh}
                  className="interactive"
                  style={{
                    marginLeft: spacing.sm,
                    textDecoration: "underline",
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </span>
            ) : (
              "Loading…"
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const weather = getWeatherDescription(current!.weather_code, lang);
  const locale = lang === "es" ? "es-MX" : "en-US";

  return (
    <Card variant="glass" className="spring-slide-up" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div
        className="glass-heavy interactive"
        style={{
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: `${radius.md}px ${radius.md}px 0 0`,
          display: "flex",
          alignItems: "center",
          gap: spacing.xs,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <span style={{ fontSize: "16px" }}>🌤️</span>
        <span style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.7)" }}>
          {t.weatherConditions}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          onKeyDown={(e) => e.key === "Enter" && onRefresh()}
          className="interactive hover-scale"
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            opacity: 0.6,
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          ⟳
        </button>
      </div>

      {/* Main Temperature Display */}
      <div
        className="glass"
        style={{
          padding: spacing.md,
          textAlign: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: spacing.sm, marginBottom: spacing.xs }}>
          <span style={{ fontSize: "48px" }}>{weather.icon}</span>
          <span style={{ fontSize: "48px", fontWeight: 700, color: "#FFF" }}>
            {formatTempFull(current!.temperature_2m, lang)}
          </span>
        </div>
        <p style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.7)", marginBottom: spacing.xs }}>
          {weather.desc}
        </p>
        <p style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)" }}>
          {t.feelsLike} {formatTempFull(current!.apparent_temperature, lang)}
        </p>
      </div>

      {/* Hourly Forecast Strip */}
      {hourly?.time && <HourlyStrip hourly={hourly} lang={lang} />}

      {/* Weather Details Grid */}
      <div
        className="glass"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: spacing.md,
          padding: spacing.md,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div>
          <p style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.7)", marginBottom: spacing.xs }}>🌬️ {t.wind}</p>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFF" }}>
            {formatWind(current!.wind_speed_10m, lang)}
          </p>
          <p style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)" }}>
            {getWindDirection(current!.wind_direction_10m)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.7)", marginBottom: spacing.xs }}>💨 {t.gusts}</p>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFF" }}>
            {current!.wind_gusts_10m != null ? formatWind(current!.wind_gusts_10m, lang) : "--"}
          </p>
        </div>
        <div>
          <p style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.7)", marginBottom: spacing.xs }}>💧 {t.humidity}</p>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFF" }}>{current!.relative_humidity_2m}%</p>
        </div>
        <div>
          <p style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.7)", marginBottom: spacing.xs }}>🔽 {t.pressure}</p>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "#FFF" }}>{Math.round(current!.pressure_msl)} mb</p>
        </div>
      </div>

      {/* Tide Information */}
      {tide && (
        <>
          <div
            className="glass-heavy"
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: `${spacing.sm}px ${spacing.xs}px`,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ flex: 1, borderRight: "1px solid rgba(255, 255, 255, 0.1)", padding: `${spacing.xs}px 0`, textAlign: "center" }}>
              <p style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: spacing.xs }}>
                🌊 {t.highTide}
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#FFF", marginBottom: spacing.xs }}>
                {tide.nextHighTime.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true })}
              </p>
              <p style={{ fontSize: "10px", color: "#00CED1" }}>{tide.highHeight}</p>
            </div>
            <div style={{ flex: 1, padding: `${spacing.xs}px 0`, textAlign: "center" }}>
              <p style={{ fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(255, 255, 255, 0.6)", marginBottom: spacing.xs }}>
                🌊 {t.lowTide}
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#FFF", marginBottom: spacing.xs }}>
                {tide.nextLowTime.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true })}
              </p>
              <p style={{ fontSize: "10px", color: "#00CED1" }}>{tide.lowHeight}</p>
            </div>
          </div>
          <div
            className="glass"
            style={{
              padding: `${spacing.xs}px ${spacing.md}px`,
              textAlign: "center",
              fontSize: "9px",
              color: "rgba(255, 255, 255, 0.6)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {tide.isRising ? (
              <span style={{ color: "#50C878" }}>↑ {t.tideRising}</span>
            ) : (
              <span style={{ color: "#F59E0B" }}>↓ {t.tideFalling}</span>
            )}{" "}
            • {tide.isRising ? t.nextHigh : t.nextLow}:{" "}
            {(tide.isRising ? tide.nextHighTime : tide.nextLowTime).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true })}
          </div>
        </>
      )}

      {/* Water Temperature */}
      <div
        className="glass hover-lift"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing.sm,
          padding: spacing.sm,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          background: "linear-gradient(135deg, rgba(0, 206, 209, 0.1) 0%, rgba(0, 206, 209, 0.05) 100%)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <span style={{ fontSize: "24px" }}>🏊</span>
        <div>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "#00CED1" }}>
            {waterTemp != null ? formatTempFull(waterTemp, lang) : "~27°C"}
          </p>
          <p style={{ fontSize: "9px", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.6)" }}>{t.waterTemp}</p>
        </div>
      </div>

      {/* Sunrise/Sunset */}
      {daily?.sunrise?.[0] && daily?.sunset?.[0] && (
        <div
          className="glass"
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: spacing.sm,
            fontSize: "14px",
            fontWeight: 600,
            color: "#F59E0B",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
            🌅 {new Date(daily.sunrise[0]).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
            🌇 {new Date(daily.sunset[0]).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      )}

      {/* Data Source Footer */}
      <div style={{ padding: `${spacing.xs}px ${spacing.md}px`, textAlign: "center", fontSize: "8px", color: "rgba(255, 255, 255, 0.4)" }}>
        📡 {t.dataSource}
      </div>
    </Card>
  );
}

function HourlyStrip({
  hourly,
  lang,
}: {
  hourly: OpenMeteoResponse["hourly"];
  lang: Lang;
}) {
  const items = [];
  for (let i = 1; i <= 5 && i < (hourly.time?.length ?? 0); i++) {
    const time = new Date(hourly.time![i]);
    const hour = time.getHours();
    const hourStr =
      hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`;
    const temp = hourly.temperature_2m[i];
    const rainProb = hourly.precipitation_probability?.[i] ?? 0;
    const code = hourly.weather_code?.[i] ?? 0;
    const icon = getWeatherIcon(code);
    items.push(
      <div
        key={i}
        className="hover-lift"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: spacing.xs,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.6)" }}>{hourStr}</span>
        <span style={{ fontSize: "24px" }}>{icon}</span>
        <span style={{ fontSize: "12px", fontWeight: 500, color: "#FFF" }}>{formatTemp(temp, lang)}</span>
        <span style={{ fontSize: "10px", color: rainProb > 50 ? "#00CED1" : "rgba(255, 255, 255, 0.6)" }}>
          💧{rainProb}%
        </span>
      </div>
    );
  }
  return (
    <div
      className="glass-heavy"
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: `${spacing.sm}px ${spacing.xs}px`,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {items}
    </div>
  );
}
