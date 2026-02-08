"use client";

import { useEffect, useRef } from "react";
import { useAuthOptional } from "@/contexts/AuthContext";

/**
 * When user becomes authenticated, sync their profile (email, display_name, avatar_url)
 * from OAuth to the profiles table. Ensures we capture email from Google/Apple.
 */
export function SyncProfileOnAuth() {
  const auth = useAuthOptional();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!auth?.isAuthenticated || !auth.user) return;
    const userId = auth.user.id;
    if (syncedRef.current === userId) return;
    syncedRef.current = userId;

    fetch("/api/users/sync-profile", { method: "POST" }).catch(() => {
      syncedRef.current = null;
    });
  }, [auth?.isAuthenticated, auth?.user?.id]);

  return null;
}
