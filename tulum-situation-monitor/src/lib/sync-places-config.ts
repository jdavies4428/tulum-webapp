/** Shared config for Places sync (API route + CLI). */

export const TULUM_CENTER = { lat: 20.2114, lng: -87.4654 };
export const TULUM_RADIUS = 10000; // 10km

/** Expanded per complete-google-places-categories.md; all map to our 4 categories. */
export const TULUM_SEARCHES: { keyword?: string; type?: string }[] = [
  // Beach Clubs & Nightlife
  { keyword: "beach club" },
  { keyword: "beach bar" },
  { type: "bar" },
  { type: "night_club" },

  // Restaurants - General
  { type: "restaurant" },

  // Restaurants - Mexican/Local Cuisine (most likely to be missing)
  { keyword: "tacos" },
  { keyword: "taqueria" },
  { keyword: "mexican food" },
  { keyword: "cocina economica" },
  { keyword: "comida corrida" },
  { keyword: "antojitos mexicanos" },

  // Restaurants - Seafood (Tulum coastal specialty)
  { keyword: "seafood" },
  { keyword: "mariscos" },
  { keyword: "ceviche" },

  // Restaurants - International Cuisines
  { keyword: "pizza" },
  { keyword: "italian restaurant" },
  { keyword: "sushi" },
  { keyword: "asian restaurant" },
  { keyword: "thai food" },

  // Restaurants - Dietary/Specialty
  { keyword: "vegan" },
  { keyword: "vegetarian restaurant" },
  { keyword: "health food" },
  { keyword: "organic restaurant" },

  // Restaurants - Meal Types
  { keyword: "breakfast" },
  { keyword: "brunch" },
  { keyword: "desayuno" },

  // Restaurants - Casual/Street Food
  { keyword: "food truck" },
  { keyword: "street food" },
  { keyword: "tortas" },

  // Cafes & Coffee
  { type: "cafe" },
  { type: "coffee_shop" },
  { keyword: "coffee" },
  { keyword: "bakery" },

  // Cultural & Attractions
  { keyword: "cenote" },
  { type: "tourist_attraction" },
  { type: "museum" },
  { type: "art_gallery" },
  { type: "park" },
  { type: "natural_feature" },
  { type: "spa" },
  { type: "lodging" },
];
