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
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ fontSize: "11px", color: "#717171", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: "20px", color: valueColor ?? "#222222", fontWeight: 700 }}>
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
        background: isCurrent ? "rgba(0, 206, 209, 0.08)" : "#F7F7F7",
        borderRadius: "12px",
        border: isCurrent ? "1px solid rgba(0, 206, 209, 0.3)" : "1px solid #EEEEEE",
        transition: "all 0.2s",
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: "12px", color: isCurrent ? "#00CED1" : "#717171", marginBottom: "8px", fontWeight: isCurrent ? 700 : 500 }}>
        {time}
      </div>
      <div style={{ fontSize: "26px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "15px", fontWeight: 700, color: "#222222", marginBottom: "4px" }}>
        {temp}
      </div>
      <div style={{ fontSize: "11px", color: "#00CED1", fontWeight: 600 }}>💧 {precip}</div>
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
      hourlyItems.push({ time: hourStr, temp, icon, precip: `${rainProb}%`, isCurrent });
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
  const uvColor = uvVal != null && uvVal >= 8 ? "#EF4444" : "#222222";

  if (!data) {
    return (
      <div style={{ padding: "24px" }}>
        <div style={{ background: "#F7F7F7", borderRadius: "16px", padding: "24px", border: "1px solid #EEEEEE", textAlign: "center", color: "#717171", fontSize: "14px" }}>
          {loading ? "Loading…" : error ? (
            <span>
              {error}{" "}
              <button type="button" onClick={onRefresh} style={{ background: "transparent", border: "none", color: "#00CED1", cursor: "pointer", textDecoration: "underline" }}>
                Retry
              </button>
            </span>
          ) : "Loading…"}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 16px 8px" }}>

      {/* ── Main temp card ── */}
      <div style={{
        background: "#FFFFFF",
        borderRadius: "20px",
        padding: "20px",
        border: "1px solid #EEEEEE",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        marginBottom: "12px",
      }}>
        {/* Temp + icon row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "56px", fontWeight: 300, color: "#222222", lineHeight: 1, letterSpacing: "-2px" }}>
              {formatTempFull(current!.temperature_2m, lang)}
            </div>
            <div style={{ fontSize: "13px", color: "#717171", marginTop: "4px" }}>
              {t.feelsLike ?? "Feels like"} {formatTempFull(current!.apparent_temperature, lang)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "52px", lineHeight: 1, marginBottom: "6px" }}>{weather!.icon}</div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#717171", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {weather!.desc}
            </div>
          </div>
        </div>

        {/* Metrics grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          padding: "16px",
          background: "#F7F7F7",
          borderRadius: "14px",
          border: "1px solid #EEEEEE",
        }}>
          <WeatherMetric icon="🌊" label={waveHeight} value="—" />
          <WeatherMetric icon="☀️" label={uvIndex} value={uvVal != null ? String(Math.round(uvVal)) : "—"} valueColor={uvColor} />
          <WeatherMetric
            icon="💨"
            label={t.wind ?? "Wind"}
            value={current!.wind_speed_10m != null
              ? `${formatWind(current!.wind_speed_10m, lang)} ${getWindDirection(current!.wind_direction_10m)}`
              : "—"}
          />
          <WeatherMetric icon="💧" label={t.humidity ?? "Humidity"} value={`${current!.relative_humidity_2m}%`} />
        </div>

        {/* Water temp row */}
        {waterTemp != null && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#717171" }}>
            <span>🌡️</span>
            <span style={{ fontWeight: 600, color: "#222222" }}>{formatTempFull(waterTemp, lang)}</span>
            <span>{t.waterTemp ?? "Water Temperature"}</span>
          </div>
        )}
      </div>

      {/* ── Hourly Forecast ── */}
      {hourlyItems.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#717171", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            {hourlyForecast}
          </div>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
            {hourlyItems.map((hour, idx) => (
              <HourlyCard key={idx} {...hour} />
            ))}
          </div>
        </div>
      )}

      {/* ── Tide ── */}
      {tide && (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #EEEEEE",
          borderRadius: "16px",
          padding: "16px",
          marginBottom: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#717171", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
            🌊 {t.tides ?? "Tides"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#00CED1", fontWeight: 600, marginBottom: "4px" }}>
                {nextHighTide}
              </div>
              <div style={{ fontSize: "16px", color: "#222222", fontWeight: 700 }}>
                {tide.nextHighTime.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true })}
                {" "}• {tide.highHeight}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "#717171", fontWeight: 600, marginBottom: "4px" }}>
                {lowTide}
              </div>
              <div style={{ fontSize: "16px", color: "#717171", fontWeight: 600 }}>
                {tide.nextLowTime.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true })}
                {" "}• {tide.lowHeight}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sunrise / Sunset ── */}
      {daily?.sunrise?.[0] && daily?.sunset?.[0] && (
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1, background: "#FFFFFF", borderRadius: "14px", padding: "14px", border: "1px solid #EEEEEE", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>🌅</div>
            <div style={{ fontSize: "10px", color: "#717171", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
              {sunriseLabel}
            </div>
            <div style={{ fontSize: "15px", color: "#222222", fontWeight: 700 }}>
              {new Date(daily.sunrise[0]).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true })}
            </div>
          </div>
          <div style={{ flex: 1, background: "#FFFFFF", borderRadius: "14px", padding: "14px", border: "1px solid #EEEEEE", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>🌇</div>
            <div style={{ fontSize: "10px", color: "#717171", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
              {sunsetLabel}
            </div>
            <div style={{ fontSize: "15px", color: "#222222", fontWeight: 700 }}>
              {new Date(daily.sunset[0]).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
