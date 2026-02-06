"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BeachClub, Restaurant, CulturalPlace } from "@/types/place";

type VenueRow = {
  id: string;
  place_id: string;
  name: string;
  category: "club" | "restaurant" | "cultural";
  lat: number;
  lng: number;
  description: string | null;
  description_es: string | null;
  description_fr: string | null;
  phone: string | null;
  website: string | null;
  has_webcam: boolean;
  rating?: number | null;
};

type VenuePlace = BeachClub | Restaurant | CulturalPlace;

function venueToPlace(venue: VenueRow): VenuePlace {
  const base = {
    id: venue.id,
    name: venue.name,
    lat: venue.lat ?? 0,
    lng: venue.lng ?? 0,
    desc: venue.description ?? "",
    descEs: venue.description_es ?? undefined,
    descFr: venue.description_fr ?? undefined,
    whatsapp: venue.phone ?? "",
    url: venue.website ?? "",
    rating: venue.rating ?? undefined,
  };
  if (venue.category === "club") {
    return { ...base, hasWebcam: venue.has_webcam } as BeachClub;
  }
  return base as Restaurant | CulturalPlace;
}

export function useVenues() {
  const [clubs, setClubs] = useState<BeachClub[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cultural, setCultural] = useState<CulturalPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"supabase" | null>(null);

  useEffect(() => {
    async function fetchVenues() {
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase.rpc("get_venues");

        if (fetchError) throw fetchError;

        const rows = (data ?? []) as VenueRow[];
        setClubs(rows.filter((r) => r.category === "club").map(venueToPlace) as BeachClub[]);
        setRestaurants(rows.filter((r) => r.category === "restaurant").map(venueToPlace) as Restaurant[]);
        setCultural(rows.filter((r) => r.category === "cultural").map(venueToPlace) as CulturalPlace[]);
        setSource("supabase");
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load venues");
        setSource(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVenues();
  }, []);

  return { clubs, restaurants, cultural, isLoading, error, source };
}
