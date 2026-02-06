import { NextResponse } from "next/server";
import type { OpenMeteoResponse } from "@/types/weather";
import type { MarineResponse } from "@/types/weather";
import { TULUM_LAT, TULUM_LNG } from "@/data/constants";

// Cache for 5 minutes – weather doesn't change that fast
export const revalidate = 300;

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";

const FORECAST_PARAMS =
  "current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=uv_index_max,sunrise,sunset&timezone=America/Cancun&forecast_hours=6";

export async function GET() {
  const forecastUrl = `${OPEN_METEO_URL}?latitude=${TULUM_LAT}&longitude=${TULUM_LNG}&${FORECAST_PARAMS}`;
  const marineUrl = `${OPEN_METEO_MARINE_URL}?latitude=${TULUM_LAT}&longitude=${TULUM_LNG}&current=sea_surface_temperature&timezone=America/Cancun`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const [forecastRes, marineRes] = await Promise.all([
      fetch(forecastUrl, { signal: controller.signal }),
      fetch(marineUrl, { signal: controller.signal }),
    ]);

    clearTimeout(timeout);

    if (!forecastRes.ok) {
      throw new Error("Weather fetch failed");
    }

    const forecast = (await forecastRes.json()) as OpenMeteoResponse;

    let waterTemp: number | null = null;
    if (marineRes.ok) {
      const marine = (await marineRes.json()) as MarineResponse;
      waterTemp = marine.current?.sea_surface_temperature ?? null;
    }

    return NextResponse.json({ forecast, waterTemp });
  } catch (e) {
    clearTimeout(timeout);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Weather fetch failed" },
      { status: 502 }
    );
  }
}
