"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import type { BeachClub, Restaurant, CulturalPlace } from "@/types/place";

type VenueRow = Database["public"]["Tables"]["venues"]["Row"];

type VenuePlace = BeachClub | Restaurant | CulturalPlace;

function parseLocation(location: unknown): { lat: number; lng: number } {
  if (!location || typeof location !== "object") return { lat: 0, lng: 0 };
  const geo = location as { type?: string; coordinates?: [number, number] };
  if (geo.type === "Point" && Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
    const [lng, lat] = geo.coordinates;
    return { lat, lng };
  }
  return { lat: 0, lng: 0 };
}

function venueToPlace(venue: VenueRow): VenuePlace {
  const { lat, lng } = parseLocation(venue.location);
  const base = {
    name: venue.name,
    lat,
    lng,
    desc: venue.description ?? "",
    descEs: venue.description_es ?? undefined,
    descFr: venue.description_fr ?? undefined,
    whatsapp: venue.phone ?? "",
    url: venue.website ?? "",
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

  useEffect(() => {
    const supabase = createClient();

    async function fetchVenues() {
      try {
        const { data, error: fetchError } = await supabase
          .from("venues")
          .select("*")
          .order("name");

        if (fetchError) throw fetchError;

        const rows = (data ?? []) as VenueRow[];
        setClubs(rows.filter((r) => r.category === "club").map(venueToPlace) as BeachClub[]);
        setRestaurants(rows.filter((r) => r.category === "restaurant").map(venueToPlace) as Restaurant[]);
        setCultural(rows.filter((r) => r.category === "cultural").map(venueToPlace) as CulturalPlace[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load venues");
      } finally {
        setIsLoading(false);
      }
    }

    fetchVenues();
  }, []);

  return { clubs, restaurants, cultural, isLoading, error };
}
