import type { OpenMeteoResponse } from "@/types/weather";
import type { Alert } from "@/types/alert";
import type { Lang } from "./weather";
import { formatWind } from "./weather";

export type TranslationsAlerts = {
  highWindWarning: string;
  windAdvisory: string;
  thunderstormWarning: string;
  rainLikely: string;
  highUV: string;
  basedOnCurrent: string;
  basedOnForecast: string;
  dailyForecast: string;
};

export function generateAlerts(
  data: OpenMeteoResponse,
  lang: Lang,
  t: TranslationsAlerts
): Alert[] {
  const alerts: Alert[] = [];
  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;

  const windKmh = current.wind_speed_10m;
  const gustKmh = current.wind_gusts_10m ?? 0;

  if (gustKmh > 50 || windKmh > 40) {
    alerts.push({
      severity: "severe",
      title: t.highWindWarning,
      desc:
        lang === "es"
          ? `Ráfagas de ${formatWind(gustKmh, lang)}`
          : `Gusts to ${formatWind(gustKmh, lang)}`,
      meta: t.basedOnCurrent,
    });
  } else if (gustKmh > 35 || windKmh > 25) {
    alerts.push({
      severity: "moderate",
      title: t.windAdvisory,
      desc: `${formatWind(windKmh, lang)} / ${formatWind(gustKmh, lang)}`,
      meta: t.basedOnCurrent,
    });
  }

  if (current.weather_code >= 95) {
    alerts.push({
      severity: "severe",
      title: t.thunderstormWarning,
      desc: lang === "es" ? "Busque refugio" : "Seek shelter",
      meta: t.basedOnCurrent,
    });
  }

  if (hourly?.precipitation_probability) {
    const slice = hourly.precipitation_probability.slice(0, 6);
    const maxPrecipProb = Math.max(...slice);
    if (maxPrecipProb > 70) {
      alerts.push({
        severity: "info",
        title: t.rainLikely,
        desc: `${maxPrecipProb}%`,
        meta: t.basedOnForecast,
      });
    }
  }

  if (daily?.uv_index_max?.[0] !== undefined && daily.uv_index_max[0] >= 8) {
    const uv = daily.uv_index_max[0];
    alerts.push({
      severity: uv >= 11 ? "severe" : "moderate",
      title: t.highUV,
      desc: `UV ${Math.round(uv)}`,
      meta: t.dailyForecast,
    });
  }

  return alerts;
}
