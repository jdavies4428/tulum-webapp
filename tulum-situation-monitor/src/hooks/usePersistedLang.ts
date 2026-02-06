"use client";

import { useState, useEffect, useCallback } from "react";
import type { Lang } from "@/lib/weather";

const STORAGE_KEY = "tulum-lang";
const LANGS: Lang[] = ["en", "es", "fr"];

function getStored(): Lang | null {
  if (typeof window === "undefined") return null;
  const s = localStorage.getItem(STORAGE_KEY);
  return (s === "en" || s === "es" || s === "fr") ? s : null;
}

function setStored(lang: Lang): void {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, lang);
}

/**
 * Persists language selection in localStorage. URL param overrides stored value.
 * @param urlLang - lang from search params, or null
 * @returns [lang, setLang]
 */
export function usePersistedLang(urlLang: string | null): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const fromUrl = urlLang && LANGS.includes(urlLang as Lang) ? (urlLang as Lang) : null;
    if (fromUrl) {
      setLangState(fromUrl);
      setStored(fromUrl);
    } else {
      const stored = getStored();
      if (stored) setLangState(stored);
    }
  }, [urlLang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setStored(l);
  }, []);

  return [lang, setLang];
}
