"use client";

import { useState, useEffect, useMemo } from "react";

const LUNAR_CYCLE_MS = 12.42 * 60 * 60 * 1000;
const REF_DATE = new Date("2026-01-01T06:00:00Z");

export interface TideState {
  nextHighTime: Date;
  nextLowTime: Date;
  isRising: boolean;
  highHeight: string;
  lowHeight: string;
}

export function useTides(): TideState {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const msSinceRef = now.getTime() - REF_DATE.getTime();
    const cyclePosition = (msSinceRef % LUNAR_CYCLE_MS) / LUNAR_CYCLE_MS;
    const msToNextHigh = (1 - cyclePosition) * LUNAR_CYCLE_MS;
    const msToNextLow = ((0.5 - cyclePosition + 1) % 1) * LUNAR_CYCLE_MS;
    const nextHighTime = new Date(now.getTime() + msToNextHigh);
    const nextLowTime = new Date(now.getTime() + msToNextLow);
    const isRising = cyclePosition < 0.5;
    return {
      nextHighTime,
      nextLowTime,
      isRising,
      highHeight: "~0.3m",
      lowHeight: "~0.1m",
    };
  }, [now]);
}
