/** Shared config for Places sync (API route + CLI). */

export const TULUM_CENTER = { lat: 20.2114, lng: -87.4654 };
export const TULUM_RADIUS = 10000; // 10km

/** Expanded per complete-google-places-categories.md; all map to our 4 categories. */
export const TULUM_SEARCHES: { keyword?: string; type?: string }[] = [
  { keyword: "beach club" },
  { keyword: "beach bar" },
  { type: "restaurant" },
  { type: "cafe" },
  { type: "coffee_shop" },
  { type: "bar" },
  { type: "night_club" },
  { keyword: "cenote" },
  { type: "tourist_attraction" },
  { type: "museum" },
  { type: "art_gallery" },
  { type: "park" },
  { type: "natural_feature" },
  { type: "spa" },
  { type: "lodging" },
];
