"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "tulum-favorites";

function loadFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function saveFavorites(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

async function syncInsiderPick(placeId: string, action: "add" | "remove") {
  try {
    await fetch("/api/insider-picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, action }),
    });
  } catch (error) {
    console.error("Error syncing insider pick:", error);
  }
}

export function useFavorites(isAdmin = false) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());

  // Hydrate from localStorage after mount (SSR-safe; initial state is empty)
  useEffect(() => {
    setFavoriteIds(loadFavorites());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue != null) {
        try {
          const arr = JSON.parse(e.newValue) as unknown;
          setFavoriteIds(
            new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [])
          );
        } catch {
          setFavoriteIds(new Set());
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleFavorite = useCallback((id: string | undefined) => {
    if (!id) return;
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      const wasInSet = next.has(id);
      if (wasInSet) next.delete(id);
      else next.add(id);
      saveFavorites(next);

      // If admin, sync to backend as insider pick
      if (isAdmin) {
        syncInsiderPick(id, wasInSet ? "remove" : "add");
      }

      return next;
    });
  }, [isAdmin]);

  const isFavorite = useCallback(
    (id: string | undefined) => (id ? favoriteIds.has(id) : false),
    [favoriteIds]
  );

  return { favoriteIds, toggleFavorite, isFavorite };
}
