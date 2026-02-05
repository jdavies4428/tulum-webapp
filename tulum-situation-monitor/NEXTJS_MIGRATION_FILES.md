# Next.js 14 Migration — Files to Create

This document lists **every file** you need to create to convert the existing single-page app to a Next.js 14 app with TypeScript and Tailwind, while keeping map and weather functionality.

---

## 1. Project scaffold (root)

| File | Purpose |
|------|--------|
| `package.json` | Next 14, React 18, TypeScript, Tailwind, Leaflet, dev scripts |
| `tsconfig.json` | TypeScript config for Next |
| `next.config.js` or `next.config.mjs` | Next config (images domain if needed) |
| `tailwind.config.ts` | Tailwind + theme (colors matching current CSS vars) |
| `postcss.config.mjs` | PostCSS with Tailwind |
| `.env.local.example` | Example env (e.g. `NEXT_PUBLIC_*` if you add API keys later) |
| `.gitignore` | Extend with `.next/`, `out/`, `.env*.local` |

---

## 2. App Router layout and page

| File | Purpose |
|------|--------|
| `src/app/layout.tsx` | Root layout: `<html>`, `<body>`, metadata, global CSS import |
| `src/app/page.tsx` | Home page: composes `<MapView />` and side panels (client wrapper if needed) |
| `src/app/globals.css` | Tailwind directives + any global custom CSS (e.g. Leaflet overrides) |

---

## 3. Components (structure)

### Layout / shell

| File | Purpose |
|------|--------|
| `src/components/layout/SituationHeader.tsx` | Top bar: title, subtitle, Share / Places / Info buttons |
| `src/components/layout/LayerControls.tsx` | Left collapsible: base map, satellite, radar, clubs, restaurants, cultural toggles |
| `src/components/layout/RightPanels.tsx` | Right column wrapper: Info, Alerts, Weather, Sargassum panels |

### Map

| File | Purpose |
|------|--------|
| `src/components/map/MapContainer.tsx` | Client component that renders the Leaflet map (uses `react-leaflet` or dynamic import of `leaflet` to avoid SSR issues) |
| `src/components/map/MapLayerManager.tsx` | Adds/removes tile layers (Carto, Satellite, Radar) and marker layers based on toggles |
| `src/components/map/useMapStore.ts` | Optional: Zustand/context for map instance and layer state so LayerControls and MapContainer stay in sync |

### Weather & conditions

| File | Purpose |
|------|--------|
| `src/components/weather/WeatherPanel.tsx` | Current temp, icon, description, feels-like, refresh button |
| `src/components/weather/HourlyForecast.tsx` | Next 5 hours: time, icon, temp, rain % |
| `src/components/weather/WeatherGrid.tsx` | Wind, gusts, humidity, pressure |
| `src/components/weather/TideSection.tsx` | High/low tide times and status |
| `src/components/weather/WaterTemp.tsx` | Sea surface temp (Open-Meteo marine API) |
| `src/components/weather/SunTimes.tsx` | Sunrise/sunset |
| `src/components/weather/AlertsPanel.tsx` | Active alerts list (wind, rain, UV, etc.) |

### Sargassum

| File | Purpose |
|------|--------|
| `src/components/sargassum/SargassumPanel.tsx` | Traffic light (red/yellow/green), status text, expand/collapse |
| `src/components/sargassum/SargassumModal.tsx` | Modal for “Current Satellite” image (`/data/sargassum/latest_1day.png`) |
| `src/components/sargassum/SargassumForecastModal.tsx` | Modal for 7-day image (`/data/sargassum/latest_7day.png`) and legend |

### Places & webcam

| File | Purpose |
|------|--------|
| `src/components/places/ListingsModal.tsx` | Side panel or modal listing beach clubs, restaurants, cultural (from data) |
| `src/components/places/PlaceCard.tsx` | Single place card (name, description, links) for list |
| `src/components/webcam/WebcamModal.tsx` | Modal showing `/data/webcam/latest.jpg` and optional tabs |

### Shared / UI

| File | Purpose |
|------|--------|
| `src/components/ui/Collapsible.tsx` | Reusable collapsible header + content (for LayerControls, right panels) |
| `src/components/ui/Modal.tsx` | Overlay + close for Webcam, Sargassum, Listings |
| `src/components/ui/Button.tsx` | Primary button styles (e.g. top-btn, lang-btn, sargassum-btn) |

---

## 4. Data and hooks

| File | Purpose |
|------|--------|
| `src/data/places.ts` | Typed arrays: `beachClubs`, `restaurants`, `culturalPlaces` (from current JS) |
| `src/data/constants.ts` | `TULUM_LAT`, `TULUM_LNG`, `DEFAULT_ZOOM`, asset paths |
| `src/hooks/useWeather.ts` | Fetch Open-Meteo forecast + marine; return `{ data, loading, error, refetch }` |
| `src/hooks/useTides.ts` | Tide calculation or API; return high/low times and rising/falling |
| `src/lib/weather.ts` | `formatTemp`, `formatWind`, `getWeatherDescription`, `getWeatherIcon`, WMO code → icon/desc |
| `src/lib/alerts.ts` | `generateAlerts(weatherData)` → array of alert objects |
| `src/lib/i18n.ts` | `translations` object + `currentLang` state or context; `t(key)` helper |

---

## 5. Types

| File | Purpose |
|------|--------|
| `src/types/weather.ts` | Open-Meteo response types (current, hourly, daily) |
| `src/types/place.ts` | `BeachClub`, `Restaurant`, `CulturalPlace` (name, lat, lng, desc, url, whatsapp, etc.) |
| `src/types/alert.ts` | `Alert { severity, title, desc, meta }` |
| `src/types/i18n.ts` | Translation key type (optional, for type-safe `t(key)`) |

---

## 6. Public static assets

| Path | Purpose |
|------|--------|
| `public/data/sargassum/latest_1day.png` | Copy from current `data/sargassum/` |
| `public/data/sargassum/latest_7day.png` | Copy from current `data/sargassum/` |
| `public/data/webcam/latest.jpg` | Copy from current `data/webcam/` |

Keep the same paths so image URLs in the app stay `/data/sargassum/...` and `/data/webcam/...`.

---

## 7. Map integration (SSR-safe)

Leaflet uses `window`; use one of:

- **Option A:** `react-leaflet` with a **client-only** wrapper:
  - `src/components/map/MapContainer.tsx` uses `'use client'` and dynamic import:
    - `const MapComponent = dynamic(() => import('./MapInner'), { ssr: false });`
  - `MapInner.tsx` renders `<MapContainer>` from `react-leaflet` and tile layers.
- **Option B:** Vanilla Leaflet in `useEffect` inside a client component, with a ref for the map div (similar to current script).

Dependencies to add: `leaflet`, `@types/leaflet`, and optionally `react-leaflet` for a more React-friendly API.

---

## 8. Summary checklist

- [ ] Root: `package.json`, `tsconfig.json`, `next.config.*`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.local.example`, `.gitignore`
- [ ] App: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- [ ] Layout: `SituationHeader`, `LayerControls`, `RightPanels`
- [ ] Map: `MapContainer` (client), `MapLayerManager`, optional `useMapStore`
- [ ] Weather: `WeatherPanel`, `HourlyForecast`, `WeatherGrid`, `TideSection`, `WaterTemp`, `SunTimes`, `AlertsPanel`
- [ ] Sargassum: `SargassumPanel`, `SargassumModal`, `SargassumForecastModal`
- [ ] Places: `ListingsModal`, `PlaceCard`
- [ ] Webcam: `WebcamModal`
- [ ] UI: `Collapsible`, `Modal`, `Button`
- [ ] Data: `places.ts`, `constants.ts`
- [ ] Hooks: `useWeather`, `useTides`
- [ ] Lib: `weather.ts`, `alerts.ts`, `i18n.ts`
- [ ] Types: `weather.ts`, `place.ts`, `alert.ts`, optional `i18n.ts`
- [ ] Public: copy `data/sargassum/*` and `data/webcam/*` into `public/data/`

---

## 9. Suggested implementation order

1. Create Next app with TypeScript + Tailwind and verify build.
2. Add `globals.css` with Tailwind + Leaflet overrides; add `layout.tsx` and a minimal `page.tsx`.
3. Add `constants`, `places` data, and types.
4. Implement `MapContainer` (client) with base tile layer and center/zoom; then add layer toggles and markers.
5. Add `useWeather`, `WeatherPanel`, `HourlyForecast`, `WeatherGrid`, `AlertsPanel`; then `useTides`, `TideSection`, `WaterTemp`, `SunTimes`.
6. Add `SituationHeader`, `LayerControls`, `RightPanels`, `Collapsible`, and wire Info panel (quick actions, lang).
7. Add Sargassum panels and modals; Webcam and Listings modals.
8. Add i18n and hook translations into all components.
9. Copy assets to `public/data/`, test all image and API paths, then remove old `index.html` and any unused scripts.

This keeps the existing map and weather behavior while giving you a clean Next.js 14 + TypeScript + Tailwind structure.
