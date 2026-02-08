"use client";

import { useEffect, useRef } from "react";
import { useAuthOptional } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { getPendingFavoriteId, clearPendingFavorite } from "./AuthPromptModal";

/**
 * After OAuth redirect, if user signed in and had a pending favorite action,
 * add the place to favorites and clear the pending state.
 */
export function PendingFavoriteHandler() {
  const auth = useAuthOptional();
  const { toggleFavorite, isFavorite } = useFavorites();
  const processedRef = useRef(false);

  useEffect(() => {
    if (!auth?.isAuthenticated || processedRef.current) return;
    const pendingId = getPendingFavoriteId();
    if (!pendingId) return;
    processedRef.current = true;
    clearPendingFavorite();
    if (!isFavorite(pendingId)) {
      toggleFavorite(pendingId);
    }
  }, [auth?.isAuthenticated, toggleFavorite, isFavorite]);

  return null;
}
