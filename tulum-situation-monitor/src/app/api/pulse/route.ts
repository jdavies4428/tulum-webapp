import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isInBeachZone, TULUM_LAT, TULUM_LNG } from "@/data/constants";
import {
  calculateTulumScore,
  estimateCrowdLevel,
  type SargassumLevel,
} from "@/lib/beach-score";

export const revalidate = 300; // 5 min cache

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";

type TimeSegment = "morning" | "midday" | "afternoon" | "evening" | "night";

function getTimeSegment(): { segment: TimeSegment; hour: number } {
  // Tulum is UTC-5 (EST) year-round (Quintana Roo)
  const now = new Date();
  const utcHour = now.getUTCHours();
  const hour = (utcHour - 5 + 24) % 24;

  if (hour >= 6 && hour < 10) return { segment: "morning", hour };
  if (hour >= 10 && hour < 14) return { segment: "midday", hour };
  if (hour >= 14 && hour < 18) return { segment: "afternoon", hour };
  if (hour >= 18 && hour < 22) return { segment: "evening", hour };
  return { segment: "night", hour };
}

function getWeatherLabel(code: number): string {
  const map: Record<number, string> = {
    0: "Clear skies",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Severe storm",
  };
  return map[code] ?? "Fair";
}

function getWeatherEmoji(code: number): string {
  if (code <= 1) return "☀️";
  if (code <= 3) return "⛅";
  if (code >= 95) return "⛈️";
  if (code >= 61) return "🌧️";
  if (code >= 51) return "🌦️";
  if (code >= 45) return "🌫️";
  return "🌤️";
}

function getUvLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Low", color: "#4CAF50" };
  if (uv <= 5) return { label: "Moderate", color: "#FFC107" };
  if (uv <= 7) return { label: "High", color: "#FF9800" };
  if (uv <= 10) return { label: "Very High", color: "#F44336" };
  return { label: "Extreme", color: "#9C27B0" };
}

type VenueRow = {
  id: string;
  place_id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  rating?: number | null;
  photo_url?: string | null;
  website?: string | null;
};

export async function GET() {
  const { segment, hour } = getTimeSegment();

  try {
    // Fetch weather + marine + venues in parallel
    const weatherParams =
      "current=temperature_2m,weather_code,wind_speed_10m,apparent_temperature,relative_humidity_2m&daily=uv_index_max,sunrise,sunset&hourly=precipitation_probability&timezone=America/Cancun";
    const marineParams =
      "current=sea_surface_temperature&timezone=America/Cancun";

    const [supabase, weatherRes, marineRes] = await Promise.all([
      createClient(),
      fetch(
        `${OPEN_METEO_URL}?latitude=${TULUM_LAT}&longitude=${TULUM_LNG}&${weatherParams}`,
        { next: { revalidate: 300 } }
      ),
      fetch(
        `${MARINE_URL}?latitude=${TULUM_LAT}&longitude=${TULUM_LNG}&${marineParams}`,
        { next: { revalidate: 300 } }
      ),
    ]);

    // Parse weather
    let weather: any = null;
    if (weatherRes.ok) {
      weather = await weatherRes.json();
    }

    // Parse marine
    let marine: any = null;
    if (marineRes.ok) {
      marine = await marineRes.json();
    }

    // Get top beach
    const { data: venues } = await supabase.rpc("get_venues");
    const rows = (venues ?? []) as VenueRow[];
    const clubs = rows.filter(
      (r) => r.category === "club" && isInBeachZone(r.lat ?? 0, r.lng ?? 0)
    );

    const crowdLevel = estimateCrowdLevel();
    const sargassumLevel: SargassumLevel = "low";

    const scored = clubs
      .map((club) => {
        const score = calculateTulumScore({
          sargassumLevel,
          crowdLevel,
          temperature: weather?.current?.temperature_2m,
          windSpeed: weather?.current?.wind_speed_10m,
          uvIndex: weather?.daily?.uv_index_max?.[0],
          weatherCode: weather?.current?.weather_code,
          hasRestrooms: true,
          hasShowers: true,
          hasFood: true,
          hasUmbrellas: true,
          parkingAvailable: true,
        });
        return { name: club.name, score, photo_url: club.photo_url };
      })
      .sort((a, b) => b.score.score - a.score.score);

    const topBeach = scored[0] ?? null;

    const current = weather?.current;
    const uvMax = weather?.daily?.uv_index_max?.[0] ?? 0;
    const uvInfo = getUvLabel(uvMax);
    const waterTemp = marine?.current?.sea_surface_temperature ?? null;
    const sunrise = weather?.daily?.sunrise?.[0] ?? null;
    const sunset = weather?.daily?.sunset?.[0] ?? null;

    return NextResponse.json({
      timeSegment: segment,
      hour,
      weather: current
        ? {
            temp: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            code: current.weather_code,
            label: getWeatherLabel(current.weather_code),
            emoji: getWeatherEmoji(current.weather_code),
            windSpeed: Math.round(current.wind_speed_10m),
            uvIndex: uvMax,
            uvLabel: uvInfo.label,
            uvColor: uvInfo.color,
            waterTemp: waterTemp ? Math.round(waterTemp) : null,
          }
        : null,
      sun: {
        sunrise: sunrise
          ? new Date(sunrise).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: "America/Cancun",
            })
          : null,
        sunset: sunset
          ? new Date(sunset).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: "America/Cancun",
            })
          : null,
        sunsetISO: sunset,
      },
      topBeach: topBeach
        ? {
            name: topBeach.name,
            score: topBeach.score.score,
            rating: topBeach.score.rating,
            emoji: topBeach.score.emoji,
            sargassum: sargassumLevel,
            crowd: crowdLevel,
          }
        : null,
      sargassumLevel,
    });
  } catch (e) {
    console.error("pulse error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load pulse data" },
      { status: 500 }
    );
  }
}
