/**
 * Client-side daily usage tracking for freemium limits.
 * Tracks per-endpoint usage in localStorage with daily reset.
 */

const STORAGE_KEY = "tulum-api-usage";

export interface UsageLimits {
  /** AI concierge messages per day */
  concierge: number;
  /** Itinerary generations per day */
  itinerary: number;
  /** Translation requests per day */
  translation: number;
  /** Place detail views per day */
  placeDetails: number;
}

export const FREE_LIMITS: UsageLimits = {
  concierge: 5,
  itinerary: 1,
  translation: 20,
  placeDetails: 25,
};

interface DailyUsage {
  date: string; // YYYY-MM-DD
  counts: Partial<Record<keyof UsageLimits, number>>;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(): DailyUsage {
  if (typeof window === "undefined") return { date: getToday(), counts: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), counts: {} };
    const usage = JSON.parse(raw) as DailyUsage;
    // Reset if new day
    if (usage.date !== getToday()) {
      return { date: getToday(), counts: {} };
    }
    return usage;
  } catch {
    return { date: getToday(), counts: {} };
  }
}

function saveUsage(usage: DailyUsage) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // ignore
  }
}

/**
 * Check if an endpoint has remaining free usage.
 */
export function checkUsage(endpoint: keyof UsageLimits): {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
} {
  const usage = getUsage();
  const used = usage.counts[endpoint] ?? 0;
  const limit = FREE_LIMITS[endpoint];
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

/**
 * Record a usage of an endpoint. Returns false if the limit was already reached.
 */
export function recordUsage(endpoint: keyof UsageLimits): boolean {
  const usage = getUsage();
  const used = usage.counts[endpoint] ?? 0;
  const limit = FREE_LIMITS[endpoint];

  if (used >= limit) return false;

  usage.counts[endpoint] = used + 1;
  usage.date = getToday();
  saveUsage(usage);
  return true;
}

/**
 * Get all current usage counts.
 */
export function getAllUsage(): Record<keyof UsageLimits, { used: number; limit: number; remaining: number }> {
  const usage = getUsage();
  const result = {} as Record<keyof UsageLimits, { used: number; limit: number; remaining: number }>;
  for (const [key, limit] of Object.entries(FREE_LIMITS)) {
    const k = key as keyof UsageLimits;
    const used = usage.counts[k] ?? 0;
    result[k] = { used, limit, remaining: Math.max(0, limit - used) };
  }
  return result;
}
