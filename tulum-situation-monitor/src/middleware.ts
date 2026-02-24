import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * Determine which rate limit tier an API path belongs to.
 * Returns null for paths that shouldn't be rate-limited.
 */
function getRateLimitTier(pathname: string) {
  if (
    pathname.startsWith("/api/concierge") ||
    pathname.startsWith("/api/itinerary")
  ) {
    return RATE_LIMITS.ai;
  }
  if (pathname.startsWith("/api/translate")) {
    return RATE_LIMITS.translation;
  }
  if (pathname.startsWith("/api/places")) {
    return RATE_LIMITS.places;
  }
  if (pathname.startsWith("/api/chat")) {
    return RATE_LIMITS.chat;
  }
  // Other mutation endpoints
  if (
    pathname.startsWith("/api/events") ||
    pathname.startsWith("/api/insider-picks") ||
    pathname.startsWith("/api/daily-updates") ||
    pathname.startsWith("/api/users")
  ) {
    return RATE_LIMITS.mutation;
  }
  return null;
}

/**
 * Validate Origin/Referer for CSRF protection on mutation requests.
 */
function isValidOrigin(request: NextRequest): boolean {
  const method = request.method;
  // Only check mutations
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // Allow requests with no origin (e.g. server-to-server, curl in dev)
  if (!origin && !referer) return true;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const allowedOrigins = [
    `https://${host}`,
    `http://${host}`,
    appUrl,
    // Allow Vercel preview deployments
    "https://tulum-webapp.vercel.app",
  ].filter(Boolean);

  if (origin && allowedOrigins.some((o) => origin.startsWith(o))) {
    return true;
  }
  if (referer && allowedOrigins.some((o) => referer.startsWith(o))) {
    return true;
  }

  return false;
}

// Content Security Policy – whitelist only what we actually use
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' unpkg.com",
  "style-src 'self' 'unsafe-inline' unpkg.com fonts.googleapis.com",
  "font-src 'self' fonts.googleapis.com fonts.gstatic.com",
  [
    "img-src 'self' data: blob:",
    "maps.googleapis.com",
    "lh3.googleusercontent.com",
    "optics.marine.usf.edu",
    "*.ipcamlive.com",
    "*.supabase.co",
    "cdn.prod.website-files.com",
    "images.squarespace-cdn.com",
    "photos.hotelbeds.com",
    "i2.wp.com",
    "vagalume-tulum.mx",
    "mezcaleriamamazul.com",
    "*.basemaps.cartocdn.com",
    "server.arcgisonline.com",
    "*.tile.openstreetmap.org",
    "tilecache.rainviewer.com",
  ].join(" "),
  [
    "connect-src 'self'",
    "maps.googleapis.com",
    "translation.googleapis.com",
    "generativelanguage.googleapis.com",
    "api.open-meteo.com",
    "marine-api.open-meteo.com",
    "optics.marine.usf.edu",
    "sargassummonitoring.com",
    "api.frankfurter.app",
    "*.supabase.co",
    "*.tile.openstreetmap.org",
    "*.basemaps.cartocdn.com",
    "server.arcgisonline.com",
    "tilecache.rainviewer.com",
  ].join(" "),
  "frame-src 'self' g1.ipcamlive.com g3.ipcamlive.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply CSP headers to all responses
  if (!pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", CSP_DIRECTIVES);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-Frame-Options", "DENY");
    return response;
  }

  // --- CSRF protection ---
  if (!isValidOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden", message: "Invalid request origin" },
      { status: 403 }
    );
  }

  // --- Rate limiting ---
  const tier = getRateLimitTier(pathname);
  if (tier) {
    // Use user ID from cookie if available, otherwise fall back to IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Try to extract user ID from Supabase auth cookie for more accurate limiting
    const authCookie = request.cookies.get("sb-access-token")?.value;
    const key = authCookie
      ? `user:${authCookie.slice(-16)}:${pathname.split("/").slice(0, 3).join("/")}`
      : `ip:${ip}:${pathname.split("/").slice(0, 3).join("/")}`;

    const result = checkRateLimit(key, tier.limit, tier.windowMs);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: result.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfterSeconds),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static assets and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|images/).*)",
  ],
};
