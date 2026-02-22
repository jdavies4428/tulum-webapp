/**
 * In-memory rate limiter for API routes.
 * Uses a sliding window approach with automatic cleanup.
 * Works on Vercel serverless (per-instance), providing best-effort limiting.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number;
}

/**
 * Check and consume a rate limit token.
 * @param key   Unique identifier (e.g. `userId:endpoint` or `ip:endpoint`)
 * @param limit Max requests allowed in the window
 * @param windowMs Time window in milliseconds (default: 1 hour)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60 * 60 * 1000
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      limit,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    limit,
    retryAfterSeconds: 0,
  };
}

/** Rate limit presets for different endpoint tiers */
export const RATE_LIMITS = {
  /** AI endpoints: concierge chat, itinerary generation */
  ai: { limit: 10, windowMs: 60 * 60 * 1000 },
  /** Translation */
  translation: { limit: 50, windowMs: 60 * 60 * 1000 },
  /** Places search/details */
  places: { limit: 100, windowMs: 60 * 60 * 1000 },
  /** Chat messages */
  chat: { limit: 60, windowMs: 60 * 60 * 1000 },
  /** General mutations */
  mutation: { limit: 30, windowMs: 60 * 60 * 1000 },
} as const;
