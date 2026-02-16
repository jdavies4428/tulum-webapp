export interface PlaceBase {
  id?: string;
  place_id?: string;
  name: string;
  lat: number;
  lng: number;
  desc: string;
  descEs?: string;
  descFr?: string;
  whatsapp: string;
  url: string;
  rating?: number | null;
  /** First Google Place photo reference for thumbnail (from DB sync). */
  photo_reference?: string | null;
  /** Cached thumbnail URL (Supabase Storage); preferred over photo_reference to save API cost. */
  photo_url?: string | null;
  /** Cuisine tags for restaurants/cafes: ["mexican", "tacos", "seafood", "italian", etc.] */
  cuisines?: string[];
}

export interface BeachClub extends PlaceBase {
  hasWebcam?: boolean;
}

export type Restaurant = PlaceBase;
export type CulturalPlace = PlaceBase;
export type CafePlace = PlaceBase;
