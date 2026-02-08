/**
 * Tulum Score Algorithm - ranks beaches 0-10 based on conditions
 * Weights: sargassum 40%, weather 20%, crowding 20%, facilities 10%, accessibility 10%
 */

export type SargassumLevel =
  | "none"
  | "minimal"
  | "low"
  | "moderate"
  | "medium"
  | "high"
  | "severe";

export type CrowdLevel =
  | "empty"
  | "quiet"
  | "moderate"
  | "busy"
  | "crowded"
  | "packed";

export interface BeachConditionsInput {
  sargassumLevel: SargassumLevel;
  temperature?: number;
  precipitation?: number;
  windSpeed?: number;
  uvIndex?: number;
  cloudCover?: number;
  weatherCode?: number;
  crowdLevel: CrowdLevel;
  hasRestrooms?: boolean;
  hasShowers?: boolean;
  hasFood?: boolean;
  hasUmbrellas?: boolean;
  hasLifeguard?: boolean;
  distanceFromUser?: number;
  parkingAvailable?: boolean;
  publicTransportNearby?: boolean;
  walkable?: boolean;
}

export interface TulumScoreResult {
  score: number;
  rating: string;
  emoji: string;
  factors: {
    sargassum: number;
    weather: number;
    crowding: number;
    facilities: number;
    accessibility: number;
  };
}

const SARGASSUM_SCORE: Record<SargassumLevel, number> = {
  none: 10,
  minimal: 9,
  low: 8,
  moderate: 6,
  medium: 4,
  high: 2,
  severe: 0,
};

const CROWDING_SCORE: Record<CrowdLevel, number> = {
  empty: 10,
  quiet: 9,
  moderate: 7,
  busy: 5,
  crowded: 3,
  packed: 1,
};

const WEIGHTS = {
  sargassum: 0.4,
  weather: 0.2,
  crowding: 0.2,
  facilities: 0.1,
  accessibility: 0.1,
};

function calculateWeatherScore(input: {
  temperature?: number;
  precipitation?: number;
  windSpeed?: number;
  uvIndex?: number;
  cloudCover?: number;
  weatherCode?: number;
}): number {
  let score = 8; // baseline
  const { temperature, precipitation, windSpeed, uvIndex, weatherCode } = input;

  // Weather code: 0-3 = clear/cloudy (good), 45+ = fog/rain (bad)
  if (weatherCode !== undefined) {
    if (weatherCode <= 2) score += 2; // clear, mostly clear, partly cloudy
    else if (weatherCode <= 3) score += 0; // overcast
    else if (weatherCode >= 51 && weatherCode <= 65) score -= 4; // rain
    else if (weatherCode >= 95) score -= 6; // thunderstorm
  }

  if (precipitation !== undefined && precipitation > 50) score -= 3;
  if (windSpeed !== undefined && windSpeed > 30) score -= 2;
  if (uvIndex !== undefined && uvIndex > 10) score -= 1;

  return Math.max(0, Math.min(10, score));
}

function calculateFacilitiesScore(input: {
  hasRestrooms?: boolean;
  hasShowers?: boolean;
  hasFood?: boolean;
  hasUmbrellas?: boolean;
  hasLifeguard?: boolean;
}): number {
  let score = 5; // baseline for beach clubs
  if (input.hasRestrooms !== false) score += 1;
  if (input.hasShowers) score += 1;
  if (input.hasFood !== false) score += 2; // beach clubs usually have food
  if (input.hasUmbrellas !== false) score += 1;
  if (input.hasLifeguard) score += 1;
  return Math.min(10, score);
}

function calculateAccessScore(input: {
  distance?: number;
  parking?: boolean;
  publicTransport?: boolean;
  walkable?: boolean;
}): number {
  let score = 7; // baseline
  const { distance } = input;
  if (distance !== undefined) {
    if (distance <= 2) score += 3;
    else if (distance <= 5) score += 2;
    else if (distance <= 10) score += 0;
    else if (distance <= 20) score -= 2;
    else score -= 3;
  }
  if (input.parking !== false) score += 0.5;
  return Math.max(0, Math.min(10, score));
}

function getScoreRating(score: number): string {
  if (score >= 9.0) return "Perfect";
  if (score >= 8.0) return "Excellent";
  if (score >= 7.0) return "Great";
  if (score >= 6.0) return "Good";
  if (score >= 5.0) return "Fair";
  return "Skip Today";
}

function getScoreEmoji(score: number): string {
  if (score >= 9.0) return "🌟";
  if (score >= 8.0) return "⭐";
  if (score >= 7.0) return "✨";
  if (score >= 6.0) return "💫";
  return "⚠️";
}

export function calculateTulumScore(beach: BeachConditionsInput): TulumScoreResult {
  const sargassumScore = SARGASSUM_SCORE[beach.sargassumLevel] ?? 6;
  const weatherScore = calculateWeatherScore({
    temperature: beach.temperature,
    precipitation: beach.precipitation,
    windSpeed: beach.windSpeed,
    uvIndex: beach.uvIndex,
    cloudCover: beach.cloudCover,
    weatherCode: beach.weatherCode,
  });
  const crowdingScore = CROWDING_SCORE[beach.crowdLevel] ?? 7;
  const facilitiesScore = calculateFacilitiesScore({
    hasRestrooms: beach.hasRestrooms,
    hasShowers: beach.hasShowers,
    hasFood: beach.hasFood,
    hasUmbrellas: beach.hasUmbrellas,
    hasLifeguard: beach.hasLifeguard,
  });
  const accessibilityScore = calculateAccessScore({
    distance: beach.distanceFromUser,
    parking: beach.parkingAvailable,
    publicTransport: beach.publicTransportNearby,
    walkable: beach.walkable,
  });

  const totalScore =
    sargassumScore * WEIGHTS.sargassum +
    weatherScore * WEIGHTS.weather +
    crowdingScore * WEIGHTS.crowding +
    facilitiesScore * WEIGHTS.facilities +
    accessibilityScore * WEIGHTS.accessibility;

  return {
    score: Math.round(totalScore * 10) / 10,
    rating: getScoreRating(totalScore),
    emoji: getScoreEmoji(totalScore),
    factors: {
      sargassum: sargassumScore,
      weather: weatherScore,
      crowding: crowdingScore,
      facilities: facilitiesScore,
      accessibility: accessibilityScore,
    },
  };
}

/** Time-based crowding estimate */
export function estimateCrowdLevel(): CrowdLevel {
  const d = new Date();
  const day = d.getDay();
  const hour = d.getHours();
  const isWeekend = day === 0 || day === 6;
  const isPeakHours = hour >= 11 && hour <= 16;

  if (isWeekend && isPeakHours) return "busy";
  if (isWeekend || isPeakHours) return "moderate";
  if (hour < 10 || hour > 18) return "quiet";
  return "moderate";
}
