"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "tulum-guest-actions";
const FREE_ACTION_LIMIT = 3;

interface GuestActionState {
  count: number;
  lastReset: string; // ISO date string for the day
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getState(): GuestActionState {
  if (typeof window === "undefined") return { count: 0, lastReset: getTodayKey() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lastReset: getTodayKey() };
    const state = JSON.parse(raw) as GuestActionState;
    // Reset if it's a new day
    if (state.lastReset !== getTodayKey()) {
      return { count: 0, lastReset: getTodayKey() };
    }
    return state;
  } catch {
    return { count: 0, lastReset: getTodayKey() };
  }
}

function saveState(state: GuestActionState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

/**
 * Tracks guest (unauthenticated) user actions.
 * After FREE_ACTION_LIMIT actions per day, returns gated=true
 * so the UI can prompt sign-up.
 */
export function useGuestActions() {
  const [state, setState] = useState<GuestActionState>(getState);

  /** Record one action. Returns true if the action is allowed, false if gated. */
  const recordAction = useCallback((): boolean => {
    const current = getState();
    if (current.count >= FREE_ACTION_LIMIT) {
      return false; // gated
    }
    const next = { count: current.count + 1, lastReset: current.lastReset };
    saveState(next);
    setState(next);
    return true; // allowed
  }, []);

  /** Check if the user is gated without consuming an action */
  const isGated = useCallback((): boolean => {
    return getState().count >= FREE_ACTION_LIMIT;
  }, []);

  /** Reset action count (call after successful sign-in) */
  const reset = useCallback(() => {
    const next = { count: 0, lastReset: getTodayKey() };
    saveState(next);
    setState(next);
  }, []);

  return {
    actionsUsed: state.count,
    actionsRemaining: Math.max(0, FREE_ACTION_LIMIT - state.count),
    limit: FREE_ACTION_LIMIT,
    recordAction,
    isGated,
    reset,
  };
}
