interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<unknown>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function invalidateCache(key: string) {
  memoryCache.delete(key);
  try {
    localStorage.removeItem(`sb_cache_${key}`);
  } catch {}
}

export function invalidateCachePrefix(prefix: string) {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) memoryCache.delete(key);
  }
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(`sb_cache_${prefix}`)) localStorage.removeItem(k);
    }
  } catch {}
}

async function fetchAndCache<T>(key: string, queryFn: () => Promise<{ data: T; error: unknown }>, ttlMs: number): Promise<T> {
  const { data, error } = await queryFn();
  if (error) throw error;

  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);

  try {
    localStorage.setItem(`sb_cache_${key}`, JSON.stringify(entry));
  } catch {}

  return data;
}

/**
 * Cached + deduplicated Supabase query wrapper.
 * Prevents redundant network requests by:
 * 1. Returning memory-cached data if within TTL
 * 2. Falling back to localStorage cache
 * 3. Deduplicating in-flight requests (multiple callers share one fetch)
 */
export async function cachedQuery<T = unknown>(
  key: string,
  queryFn: () => Promise<{ data: T; error: unknown }>,
  ttlMs: number = DEFAULT_TTL
): Promise<T> {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  try {
    const stored = localStorage.getItem(`sb_cache_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored) as CacheEntry<T>;
      if (Date.now() - parsed.timestamp < ttlMs) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch {}

  if (inflightRequests.has(key)) {
    return inflightRequests.get(key) as Promise<T>;
  }

  const promise = fetchAndCache<T>(key, queryFn, ttlMs);
  inflightRequests.set(key, promise);

  try {
    return await promise;
  } finally {
    inflightRequests.delete(key);
  }
}
