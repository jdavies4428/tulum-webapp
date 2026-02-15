"use client";

import { useState, useEffect } from "react";

export function useInsiderPicks() {
  const [insiderPickIds, setInsiderPickIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch insider picks from API
  useEffect(() => {
    async function fetchInsiderPicks() {
      try {
        const res = await fetch("/api/insider-picks");
        if (res.ok) {
          const data = await res.json();
          setInsiderPickIds(new Set(data.placeIds || []));
        }
      } catch (error) {
        console.error("Error fetching insider picks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInsiderPicks();
  }, []);

  const isInsiderPick = (placeId: string | undefined): boolean => {
    return placeId ? insiderPickIds.has(placeId) : false;
  };

  return { insiderPickIds, isInsiderPick, loading };
}
