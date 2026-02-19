---
description: 
alwaysApply: true
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tulum Discovery — a Next.js 14 PWA for real-time beach conditions, weather, venue discovery, and local recommendations in Tulum, Mexico. Deployed on Vercel at tulum-webapp.vercel.app.

## Repository Structure

The repo root is a wrapper. **All source code lives in `tulum-situation-monitor/`**. Commands must be run from that directory.

## Common Commands

```bash
cd tulum-situation-monitor

# Development (port 3011)
npm run dev

# Dev with Turbopack (faster)
npm run dev:turbo

# Production build + start (port 3003)
npm run build && npm run start

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Data scripts
npm run seed:venues          # Seed venue database
npm run sync:places          # Sync Google Places data
npm run update:sargassum     # Update sargassum satellite images
npm run update:webcam        # Update webcam snapshots
```

If dev returns 404 on macOS, increase file limit first: `ulimit -n 10240`

## Architecture

**Framework**: Next.js 14, App Router, TypeScript strict mode, React 18

**Styling**: Primarily inline CSS-in-JS styles using design tokens from `src/lib/design-tokens.ts`. Tailwind CSS is available but components mostly use inline styles with the token system (`spacing`, `radius`, `colors`, `typography`). The primary brand color is `#00CED1` (turquoise).

**State management**: React Context (`AuthContext`) + custom hooks (`src/hooks/`). No Redux or Zustand. 18 custom hooks handle data fetching (useVenues, useFavorites, useLists, etc.).

**i18n**: Three languages (EN, ES, FR) via `src/lib/i18n.ts` with 1,170+ translation keys. Pattern: `const t = translations[lang] as Record<string, string>`, then `{t.keyName ?? "Fallback"}`. User preference stored via `usePersistedLang` hook.

**Auth**: Supabase Auth with Google & Apple OAuth. Client in `src/lib/supabase/client.ts`, server in `src/lib/supabase/server.ts`. Admin client (service role) in `src/lib/supabase/admin.ts`.

**API routes**: 26 routes in `src/app/api/`. All use `runtime = "nodejs"` and `dynamic = "force-dynamic"`. Key external APIs: Google Places, Google Translate, Gemini (AI concierge/itinerary), Open-Meteo (weather), NOAA (sargassum).

**Maps**: Leaflet 1.9.4 with MarkerCluster (not Mapbox despite .cursorrules reference).

**Database**: Supabase PostgreSQL. No ORM — direct Supabase client queries. Migrations in `supabase/migrations/`. Key tables: venues, profiles, favorites, lists, chat_conversations, chat_messages, itineraries.

**Environment**: Validated at startup via Zod schemas in `src/lib/env.ts`. Required vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_MAPS_API_KEY`, `GOOGLE_TRANSLATE_API_KEY`, `GEMINI_API_KEY`.

## Key Patterns

- Path alias: `@/*` maps to `src/*`
- Server Components by default; `"use client"` only when needed
- Glass morphism UI aesthetic throughout (`glass`, `glass-heavy` CSS utility classes)
- Design tokens enforce a strict spacing grid (4px increments: xs=4, sm=8, md=16, lg=24, xl=32)
- When adding user-visible strings, always add translation keys to all three language blocks in `i18n.ts` and use `t.keyName ?? "English fallback"` pattern
- Git operations must use paths relative to `tulum-situation-monitor/` (the CWD), not the repo root
