import { NextResponse } from "next/server";

const FORECAST_PAGE =
  "https://sargassummonitoring.com/en/forecast-sargassum-mexico-riviera-maya/";
const FORECAST_BASE = "https://sargassummonitoring.com/wp-content/uploads";

// Simple in-memory cache (24 hour TTL since forecasts update weekly)
let cachedUrl: string | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  try {
    // Check cache first
    if (cachedUrl && Date.now() - cacheTime < CACHE_TTL) {
      console.log("Returning cached forecast URL");
      return NextResponse.json({ url: cachedUrl, cached: true });
    }

    console.log("Fetching latest forecast from source page...");

    // Fetch the forecast page
    const response = await fetch(FORECAST_PAGE, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TulumSituationMonitor/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();

    // Find all forecast image filenames matching the known pattern
    // Pattern: mexico-sargazo-monitoreo-sargassum-monitoring-pronosticos-DD-MM-YYYY.gif
    const pattern =
      /mexico-sargazo-monitoreo-sargassum-monitoring-pronosticos-(\d{2})-(\d{2})-(\d{4})\.gif/g;
    const matches = [...html.matchAll(pattern)];

    if (matches.length === 0) {
      throw new Error("No forecast images found on page");
    }

    // Parse dates from filenames and construct full URLs
    const forecasts = matches.map((match) => {
      const [filename, dd, mm, yyyy] = match;
      const date = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
      const url = `${FORECAST_BASE}/${yyyy}/${mm}/${filename}`;
      return { url, date: date.getTime(), filename };
    });

    // Sort by date descending to get the most recent
    forecasts.sort((a, b) => b.date - a.date);
    const latest = forecasts[0];

    console.log(
      `Found ${forecasts.length} forecasts, latest: ${latest.filename}`
    );

    // Update cache
    cachedUrl = latest.url;
    cacheTime = Date.now();

    return NextResponse.json({
      url: latest.url,
      cached: false,
      date: new Date(latest.date).toISOString(),
      total_found: forecasts.length,
    });
  } catch (error) {
    console.error("Error fetching sargassum forecast:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch latest forecast",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
