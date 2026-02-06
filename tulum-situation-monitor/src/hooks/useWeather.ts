"use client";

import { useState, useEffect, useCallback } from "react";
import type { OpenMeteoResponse } from "@/types/weather";
import type { MarineResponse } from "@/types/weather";
import { TULUM_LAT, TULUM_LNG, OPEN_METEO_URL, OPEN_METEO_MARINE_URL } from "@/data/constants";

const FETCH_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

async function fetchWithRetry<T>(fetcher: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetcher();
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
  }
  throw lastError ?? new Error("Fetch failed");
}

export function useWeather() {
  const [data, setData] = useState<OpenMeteoResponse | null>(null);
  const [waterTemp, setWaterTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const directForecastUrl = `${OPEN_METEO_URL}?latitude=${TULUM_LAT}&longitude=${TULUM_LNG}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=uv_index_max,sunrise,sunset&timezone=America/Cancun&forecast_hours=6`;
  const directMarineUrl = `${OPEN_METEO_MARINE_URL}?latitude=${TULUM_LAT}&longitude=${TULUM_LNG}&current=sea_surface_temperature&timezone=America/Cancun`;

  const fetchWeather = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Prefer API route (cached server-side) – fallback to direct Open-Meteo on failure
      const res = await fetchWithRetry(async () => {
        const r = await fetchWithTimeout("/api/weather", FETCH_TIMEOUT_MS);
        if (r.ok) return r;
        const text = await r.text();
        throw new Error(text || "API failed");
      }).catch(async () => {
        return fetchWithTimeout(directForecastUrl, FETCH_TIMEOUT_MS);
      });

      if (!res.ok) throw new Error("Weather fetch failed");

      const body = await res.json();
      if (body.forecast) {
        setData(body.forecast);
        if (typeof body.waterTemp === "number") setWaterTemp(body.waterTemp);
      } else {
        setData(body as OpenMeteoResponse);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load weather");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWaterTemp = useCallback(async () => {
    if (waterTemp != null) return;
    try {
      const res = await fetchWithRetry(() =>
        fetchWithTimeout(directMarineUrl, FETCH_TIMEOUT_MS)
      );
      if (!res.ok) return;
      const json: MarineResponse = await res.json();
      if (json.current?.sea_surface_temperature != null) {
        setWaterTemp(json.current.sea_surface_temperature);
      }
    } catch {
      // optional: water temp is non-critical
    }
  }, [waterTemp]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  useEffect(() => {
    if (!loading) fetchWaterTemp();
  }, [loading, fetchWaterTemp]);

  return { data, waterTemp, loading, error, refetch: fetchWeather, refetchWater: fetchWaterTemp };
}
