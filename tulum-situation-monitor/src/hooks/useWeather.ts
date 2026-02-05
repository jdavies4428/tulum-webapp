"use client";

import { useState, useEffect, useCallback } from "react";
import type { OpenMeteoResponse } from "@/types/weather";
import type { MarineResponse } from "@/types/weather";
import { TULUM_LAT, TULUM_LNG, OPEN_METEO_URL, OPEN_METEO_MARINE_URL } from "@/data/constants";

export function useWeather() {
  const [data, setData] = useState<OpenMeteoResponse | null>(null);
  const [waterTemp, setWaterTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const url = `${OPEN_METEO_URL}?latitude=${TULUM_LAT}&longitude=${TULUM_LNG}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=uv_index_max,sunrise,sunset&timezone=America/Cancun&forecast_hours=6`;

  const fetchWeather = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather fetch failed");
      const json: OpenMeteoResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load weather");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWaterTemp = useCallback(async () => {
    try {
      const res = await fetch(
        `${OPEN_METEO_MARINE_URL}?latitude=${TULUM_LAT}&longitude=${TULUM_LNG}&current=sea_surface_temperature&timezone=America/Cancun`
      );
      if (!res.ok) return;
      const json: MarineResponse = await res.json();
      if (json.current?.sea_surface_temperature != null) {
        setWaterTemp(json.current.sea_surface_temperature);
      }
    } catch {
      // optional: set fallback
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    fetchWaterTemp();
  }, [fetchWeather, fetchWaterTemp]);

  return { data, waterTemp, loading, error, refetch: fetchWeather, refetchWater: fetchWaterTemp };
}
