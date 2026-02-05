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
      <div className="rounded-lg border border-border bg-bg-panel overflow-hidden shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-1.5 border-b border-border bg-white/5 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          <span>🌤️</span>
          <span>{t.weatherConditions}</span>
          <button type="button" onClick={onRefresh} className="ml-auto opacity-60 hover:opacity-100">
            ⟳
          </button>
        </div>
        <div className="p-4 text-center text-text-muted">
          {loading ? "Loading…" : error ? (
            <span>
              {error}
              <button type="button" onClick={onRefresh} className="ml-2 underline hover:no-underline">
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

  const weather = getWeatherDescription(current!.weather_code, lang);
  const locale = lang === "es" ? "es-MX" : "en-US";

  return (
    <div className="rounded-lg border border-border bg-bg-panel overflow-hidden shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-1.5 border-b border-border bg-white/5 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        <span>🌤️</span>
        <span>{t.weatherConditions}</span>
        <button type="button" onClick={onRefresh} className="ml-auto opacity-60 hover:opacity-100">
          ⟳
        </button>
      </div>
      <div className="border-b border-border p-3 text-center">
        <div className="mb-1 flex items-center justify-center gap-2">
          <span className="text-3xl">{weather.icon}</span>
          <span className="text-3xl font-bold text-white">
            {formatTempFull(current!.temperature_2m, lang)}
          </span>
        </div>
        <p className="text-xs uppercase tracking-wider text-text-muted">{weather.desc}</p>
        <p className="mt-0.5 text-[10px] text-[#666]">
          {t.feelsLike} {formatTempFull(current!.apparent_temperature, lang)}
        </p>
      </div>
      {hourly?.time && (
        <HourlyStrip hourly={hourly} lang={lang} />
      )}
      <div className="grid grid-cols-2 gap-2 border-b border-border p-3">
        <div>
          <p className="text-[10px] text-text-muted">🌬️ {t.wind}</p>
          <p className="text-sm font-medium">
            {formatWind(current!.wind_speed_10m, lang)}
          </p>
          <p className="text-[10px] text-[#666]">
            {getWindDirection(current!.wind_direction_10m)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">💨 {t.gusts}</p>
          <p className="text-sm font-medium">
            {current!.wind_gusts_10m != null
              ? formatWind(current!.wind_gusts_10m, lang)
              : "--"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">💧 {t.humidity}</p>
          <p className="text-sm font-medium">{current!.relative_humidity_2m}%</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">🔽 {t.pressure}</p>
          <p className="text-sm font-medium">{Math.round(current!.pressure_msl)} mb</p>
        </div>
      </div>
      {tide && (
        <>
          <div className="flex justify-around border-b border-border bg-black/30 px-2 py-2.5">
            <div className="flex-1 border-r border-border py-1.5 text-center">
              <p className="mb-1 text-[8px] uppercase tracking-wider text-text-muted">🌊 {t.highTide}</p>
              <p className="mb-0.5 text-sm font-semibold text-white">
                {tide.nextHighTime.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true })}
              </p>
              <p className="text-[10px] text-accent-cyan">{tide.highHeight}</p>
            </div>
            <div className="flex-1 py-1.5 text-center">
              <p className="mb-1 text-[8px] uppercase tracking-wider text-text-muted">🌊 {t.lowTide}</p>
              <p className="mb-0.5 text-sm font-semibold text-white">
                {tide.nextLowTime.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true })}
              </p>
              <p className="text-[10px] text-accent-cyan">{tide.lowHeight}</p>
            </div>
          </div>
          <p className="border-b border-border bg-black/20 py-1.5 text-center text-[9px] text-text-muted">
            {tide.isRising ? (
              <span className="text-accent-green">↑ {t.tideRising}</span>
            ) : (
              <span className="text-amber-500">↓ {t.tideFalling}</span>
            )}{" "}
            • {tide.isRising ? t.nextHigh : t.nextLow}:{" "}
            {(tide.isRising ? tide.nextHighTime : tide.nextLowTime).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", hour12: true })}
          </p>
        </>
      )}
      <div className="flex items-center justify-center gap-2 border-b border-border bg-accent-cyan/10 py-2">
        <span className="text-lg">🏊</span>
        <div>
          <p className="text-base font-bold text-accent-cyan">
            {waterTemp != null ? formatTempFull(waterTemp, lang) : "~27°C"}
          </p>
          <p className="text-[9px] uppercase text-text-muted">{t.waterTemp}</p>
        </div>
      </div>
      {daily?.sunrise?.[0] && daily?.sunset?.[0] && (
        <div className="flex justify-around border-b border-border bg-amber-500/10 py-2.5 text-sm font-semibold text-amber-500">
          <span className="flex items-center gap-1.5">
            🌅 {new Date(daily.sunrise[0]).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}
          </span>
          <span className="flex items-center gap-1.5">
            🌇 {new Date(daily.sunset[0]).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>
      )}
      <p className="border-t border-border px-3 py-1.5 text-center text-[8px] text-[#555]">📡 {t.dataSource}</p>
    </div>
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
      <div key={i} className="flex flex-col items-center text-center">
        <span className="text-[10px] text-text-muted">{hourStr}</span>
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium">{formatTemp(temp, lang)}</span>
        <span className={`text-[10px] ${rainProb > 50 ? "text-accent-cyan" : "text-text-muted"}`}>
          💧{rainProb}%
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-between border-b border-border bg-black/30 px-2 py-2.5">
      {items}
    </div>
  );
}
