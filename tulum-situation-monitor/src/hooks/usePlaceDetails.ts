"use client";

import { useState, useEffect, useCallback } from "react";

export interface PlaceDetailsData {
  name?: string;
  formatted_address?: string;
  geometry?: { location?: { lat: number; lng: number } };
  photos?: { photo_reference: string; width: number; height: number }[];
  reviews?: {
    author_name: string;
    profile_photo_url?: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time?: number;
  }[];
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { open_now?: boolean; weekday_text?: string[] };
  website?: string;
  formatted_phone_number?: string;
  price_level?: number;
  types?: string[];
}

export function usePlaceDetails(placeId: string | null) {
  const [details, setDetails] = useState<PlaceDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(id)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setDetails(data.result ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load details");
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!placeId) {
      setDetails(null);
      setError(null);
      return;
    }
    fetchDetails(placeId);
  }, [placeId, fetchDetails]);

  return { details, loading, error, refetch: () => placeId && fetchDetails(placeId) };
}

export function getPlacePhotoUrl(photoReference: string, maxWidth = 400): string {
  return `/api/places/photo?photo_reference=${encodeURIComponent(photoReference)}&maxwidth=${maxWidth}`;
}
