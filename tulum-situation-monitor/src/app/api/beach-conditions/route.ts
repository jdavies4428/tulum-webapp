import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isInBeachZone, haversineKm, TULUM_LAT, TULUM_LNG } from "@/data/constants";
import {
  calculateTulumScore,
  estimateCrowdLevel,
  type SargassumLevel,
} from "@/lib/beach-score";
import type { OpenMeteoResponse } from "@/types/weather";
import type { BeachClub } from "@/types/place";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const FORECAST_PARAMS =
  "current=temperature_2m,weather_code,wind_speed_10m&daily=uv_index_max&timezone=America/Cancun";

export const revalidate = 300;

type VenueRow = {
  id: string;
  place_id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description: string | null;
  description_es: string | null;
  description_fr: string | null;
  phone: string | null;
  website: string | null;
  has_webcam: boolean;
  rating?: number | null;
  photo_reference?: string | null;
  photo_url?: string | null;
};

export interface ScoredBeach {
  id: string;
  place_id?: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  sargassumLevel: SargassumLevel;
  crowdLevel: string;
  weatherLabel: string;
  tulumScore: {
    score: number;
    rating: string;
    emoji: string;
    factors: Record<string, number>;
  };
  photo_url?: string | null;
  url?: string;
}

function getWeatherLabel(code: number): string {
  const map: Record<number, string> = {
    0: "Perfect Weather",
    1: "Perfect Weather",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Drizzle",
    53: "Drizzle",
    55: "Drizzle",
    61: "Rain",
    63: "Rain",
    65: "Heavy Rain",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm",
  };
  return map[code] ?? "Good";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : TULUM_LAT;
  const userLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : TULUM_LNG;

  try {
    const [supabase, weatherRes] = await Promise.all([
      createClient(),
      fetch(
        `${OPEN_METEO_URL}?latitude=${TULUM_LAT}&longitude=${TULUM_LNG}&${FORECAST_PARAMS}`,
        { next: { revalidate: 300 } }
      ),
    ]);

    const { data: venues, error } = await supabase.rpc("get_venues");
    if (error) throw error;

    const rows = (venues ?? []) as VenueRow[];
    const clubs = rows.filter(
      (r) => r.category === "club" && isInBeachZone(r.lat ?? 0, r.lng ?? 0)
    );

    let weather: OpenMeteoResponse | null = null;
    if (weatherRes.ok) {
      weather = (await weatherRes.json()) as OpenMeteoResponse;
    }

    const current = weather?.current;
    const crowdLevel = estimateCrowdLevel();
    const sargassumLevel: SargassumLevel = "low"; // Regional default; can integrate USF data later

    const scoredBeaches: ScoredBeach[] = clubs.map((club) => {
      const lat = club.lat ?? 0;
      const lng = club.lng ?? 0;
      const distance = haversineKm(userLat, userLng, lat, lng);

      const tulumScore = calculateTulumScore({
        sargassumLevel,
        crowdLevel,
        temperature: current?.temperature_2m,
        windSpeed: current?.wind_speed_10m,
        uvIndex: weather?.daily?.uv_index_max?.[0],
        weatherCode: current?.weather_code,
        hasRestrooms: true,
        hasShowers: true,
        hasFood: true,
        hasUmbrellas: true,
        distanceFromUser: distance,
        parkingAvailable: true,
      });

      return {
        id: club.id,
        place_id: club.place_id,
        name: club.name,
        lat,
        lng,
        distance: Math.round(distance * 10) / 10,
        sargassumLevel,
        crowdLevel,
        weatherLabel: getWeatherLabel(current?.weather_code ?? 0),
        tulumScore,
        photo_url: club.photo_url,
        url: club.website ?? undefined,
      };
    });

    const sorted = scoredBeaches.sort((a, b) => b.tulumScore.score - a.tulumScore.score);

    // 3-day forecast: use same score with slight day variance (simplified)
    const baseScore = sorted[0]?.tulumScore.score ?? 8;
    const forecastDays = [0, 1, 2].map((i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const variance = i === 0 ? 0 : i === 1 ? -0.2 : -0.4;
      const score = Math.max(5, Math.min(10, Math.round((baseScore + variance) * 10) / 10));
      return {
        day: dayNames[d.getDay()],
        score,
        emoji: score >= 9 ? "🌟" : score >= 8 ? "⭐" : "✨",
      };
    });

    return NextResponse.json({
      beaches: sorted,
      forecast: forecastDays,
      weather: current
        ? {
            temp: current.temperature_2m,
            code: current.weather_code,
            windSpeed: current.wind_speed_10m,
          }
        : null,
    });
  } catch (e) {
    console.error("beach-conditions error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load beach conditions" },
      { status: 500 }
    );
  }
}
