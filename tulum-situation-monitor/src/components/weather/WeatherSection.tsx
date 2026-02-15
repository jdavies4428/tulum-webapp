"use client";

import { useState } from "react";
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

interface WeatherSectionProps {
  lang: Lang;
  data: OpenMeteoResponse | null;
  loading: boolean;
  error?: string | null;
  tide?: TideState;
  waterTemp?: number | null;
  onRefresh: () => void;
}

function WeatherMetric({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--tulum-ocean)",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          fontWeight: "700",
        }}
      >
        {icon} {label}
      </div>
      <div
        style={{
          fontSize: "18px",
          color: valueColor ?? "var(--tulum-ocean)",
          fontWeight: "700",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function HourlyCard({
  time,
  temp,
  icon,
  precip,
  isCurrent,
}: {
  time: string;
  temp: string;
  icon: string;
  precip: string;
  isCurrent?: boolean;
}) {
  return (
    <div
      style={{
        minWidth: "70px",
        textAlign: "center",
        padding: "12px 8px",
        background: isCurrent ? "rgba(0, 212, 212, 0.12)" : "transparent",
        borderRadius: "12px",
        border: isCurrent ? "1px solid rgba(0, 212, 212, 0.3)" : "1px solid transparent",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: isCurrent ? "var(--tulum-turquoise)" : "var(--text-secondary)",
          marginBottom: "8px",
          fontWeight: isCurrent ? "600" : "500",
        }}
      >
        {time}
      </div>
      <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
      <div
        style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "var(--text-primary)",
          marginBottom: "4px",
        }}
      >
        {temp}
      </div>
      <div style={{ fontSize: "11px", color: "var(--tulum-turquoise)" }}>💧 {precip}</div>
    </div>
  );
}

export function WeatherSection({
  lang,
  data,
  loading,
  error,
  tide,
  waterTemp,
  onRefresh,
}: WeatherSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const t = translations[lang] as Record<string, string>;
  const locale = lang === "es" ? "es-MX" : lang === "fr" ? "fr-FR" : "en-US";

  const waveHeight = t.waveHeight ?? "Wave Height";
  const uvIndex = t.uvIndex ?? "UV Index";
  const hourlyForecast = t.hourlyForecast ?? "Hourly Forecast";
  const nextHighTide = t.nextHigh ?? "Next High Tide";
  const lowTide = t.lowTide ?? "Low Tide";
  const sunriseLabel = t.sunrise ?? "Sunrise";
  const sunsetLabel = t.sunset ?? "Sunset";

  const current = data?.current;
  const hourly = data?.hourly;
  const daily = data?.daily;
  const weather = current ? getWeatherDescription(current.weather_code, lang) : null;

  // Build hourly items from API – start from current hour
  const hourlyItems: { time: string; temp: string; icon: string; precip: string; isCurrent: boolean }[] = [];
  if (hourly?.time) {
    const now = new Date();
    let startIdx = 0;
    for (let i = 0; i < hourly.time.length; i++) {
      const slotTime = new Date(hourly.time[i]);
      if (slotTime.getTime() >= now.getTime() - 3600000) {
        startIdx = i;
        break;
      }
    }
    for (let i = startIdx; i < Math.min(startIdx + 8, hourly.time.length); i++) {
      const time = new Date(hourly.time[i]);
      const hour = time.getHours();
      const hourStr =
        hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`;
      const temp = formatTemp(hourly.temperature_2m[i] ?? 0, lang);
      const rainProb = hourly.precipitation_probability?.[i] ?? 0;
      const code = hourly.weather_code?.[i] ?? 0;
      const icon = getWeatherIcon(code);
      const isCurrent = i === startIdx;
      hourlyItems.push({
        time: hourStr,
        temp,
        icon,
        precip: `${rainProb}%`,
        isCurrent,
      });
    }
    if (hourlyItems.length === 0 && hourly.time.length > 0) {
      const i = 0;
      const time = new Date(hourly.time[i]);
      const hour = time.getHours();
      const hourStr =
        hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`;
      hourlyItems.push({
        time: hourStr,
        temp: formatTemp(hourly.temperature_2m[i] ?? 0, lang),
        icon: getWeatherIcon(hourly.weather_code?.[i] ?? 0),
        precip: `${hourly.precipitation_probability?.[i] ?? 0}%`,
        isCurrent: true,
      });
    }
  }

  const uvVal = daily?.uv_index_max?.[0];
  const uvColor = uvVal != null && uvVal >= 8 ? "#FF6B6B" : undefined;

  if (!data) {
    return (
      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "18px" }}>🌤️</span>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "var(--text-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0,
            }}
          >
            {t.weatherConditions}
          </h2>
        </div>
        <div
          style={{
            background: "var(--card-bg)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid var(--border-subtle)",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          {loading ? "Loading…" : error ? (
            <span>
              {error}{" "}
              <button
                type="button"
                onClick={onRefresh}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--tulum-turquoise)",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Retry
              </button>
            </span>
          ) : (
            "Loading…"
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 0 8px 0" }}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          marginBottom: isExpanded ? "16px" : "0",
          padding: "0 0 12px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>🌤️</span>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: "var(--tulum-ocean)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              margin: 0,
            }}
          >
            {t.weatherConditions}
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-tertiary)",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            🔄
          </button>
          <span
            style={{
              color: "var(--text-tertiary)",
              fontSize: "18px",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.3s",
            }}
          >
            ▼
          </span>
        </div>
      </button>

      {isExpanded && (
        <div style={{ animation: "slideDown 0.3s ease-out" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)",
              borderRadius: "24px",
              padding: "24px",
              border: "2px solid rgba(255, 255, 255, 0.8)",
              marginBottom: "16px",
              boxShadow: "0 12px 40px rgba(0, 206, 209, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "56px",
                    fontWeight: "300",
                    color: "var(--tulum-ocean)",
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}
                >
                  {formatTempFull(current!.temperature_2m, lang)}
                </div>
                <div
                  style={{
                    color: "var(--tulum-aqua)",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {t.feelsLike} {formatTempFull(current!.apparent_temperature, lang)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "48px", marginBottom: "8px" }}>{weather!.icon}</div>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {weather!.desc}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                padding: "20px",
                background: "rgba(255, 255, 255, 0.6)",
                borderRadius: "20px",
                backdropFilter: "blur(10px)",
              }}
            >
              <WeatherMetric icon="🌊" label={waveHeight} value="—" />
              <WeatherMetric
                icon="☀️"
                label={uvIndex}
                value={uvVal != null ? String(Math.round(uvVal)) : "—"}
                valueColor={uvColor}
              />
              <WeatherMetric
                icon="💨"
                label={t.wind}
                value={
                  current!.wind_speed_10m != null
                    ? `${formatWind(current!.wind_speed_10m, lang)} ${getWindDirection(current!.wind_direction_10m)}`
                    : "—"
                }
              />
              <WeatherMetric icon="💧" label={t.humidity} value={`${current!.relative_humidity_2m}%`} />
            </div>
          </div>

          {hourlyItems.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "12px",
                }}
              >
                {hourlyForecast}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "8px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.2) transparent",
                }}
              >
                {hourlyItems.map((hour, idx) => (
                  <HourlyCard key={idx} {...hour} />
                ))}
              </div>
            </div>
          )}

          {tide && (
            <div
              style={{
                background: "rgba(0, 212, 212, 0.08)",
                border: "1px solid rgba(0, 212, 212, 0.2)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--tulum-turquoise)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontWeight: "600",
                    }}
                  >
                    🌊 {nextHighTide}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      color: "var(--text-primary)",
                      fontWeight: "600",
                    }}
                  >
                    {tide.nextHighTime.toLocaleTimeString(locale, {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "}
                    • {tide.highHeight}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-tertiary)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontWeight: "600",
                    }}
                  >
                    {lowTide}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      color: "var(--text-secondary)",
                      fontWeight: "600",
                    }}
                  >
                    {tide.nextLowTime.toLocaleTimeString(locale, {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "}
                    • {tide.lowHeight}
                  </div>
                </div>
              </div>
            </div>
          )}

          {daily?.sunrise?.[0] && daily?.sunset?.[0] && (
            <div style={{ display: "flex", gap: "12px" }}>
              <div
                style={{
                  flex: 1,
                  background: "var(--card-bg)",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid var(--border-subtle)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🌅</div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {sunriseLabel}
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    color: "var(--text-primary)",
                    fontWeight: "600",
                  }}
                >
                  {new Date(daily.sunrise[0]).toLocaleTimeString(locale, {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: "var(--card-bg)",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid var(--border-subtle)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🌇</div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {sunsetLabel}
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    color: "var(--text-primary)",
                    fontWeight: "600",
                  }}
                >
                  {new Date(daily.sunset[0]).toLocaleTimeString(locale, {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
