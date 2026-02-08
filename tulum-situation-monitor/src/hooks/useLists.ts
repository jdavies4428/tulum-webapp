"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "tulum-lists";

export interface SavedList {
  id: string;
  name: string;
  icon: string;
  placeIds: string[];
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_LISTS: Omit<SavedList, "id" | "createdAt" | "updatedAt">[] = [
  { name: "Must Visit", icon: "❤️", placeIds: [] },
  { name: "Food Spots", icon: "🍽️", placeIds: [] },
  { name: "Date Night", icon: "💑", placeIds: [] },
];

function loadLists(): SavedList[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (x): x is SavedList =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as SavedList).id === "string" &&
        typeof (x as SavedList).name === "string" &&
        typeof (x as SavedList).icon === "string" &&
        Array.isArray((x as SavedList).placeIds)
    );
  } catch {
    return [];
  }
}

function saveLists(lists: SavedList[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch {
    // ignore
  }
}

export function useLists() {
  const [lists, setLists] = useState<SavedList[]>([]);

  useEffect(() => {
    const loaded = loadLists();
    if (loaded.length === 0) {
      const defaults: SavedList[] = DEFAULT_LISTS.map((d, i) => ({
        ...d,
        id: `list-${i + 1}`,
        placeIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setLists(defaults);
      saveLists(defaults);
    } else {
      setLists(loaded);
    }
  }, []);

  const addList = useCallback((name: string, icon: string) => {
    const now = new Date().toISOString();
    const newList: SavedList = {
      id: `list-${Date.now()}`,
      name,
      icon,
      placeIds: [],
      createdAt: now,
      updatedAt: now,
    };
    setLists((prev) => {
      const next = [...prev, newList];
      saveLists(next);
      return next;
    });
  }, []);

  const deleteList = useCallback((listId: string) => {
    setLists((prev) => {
      const next = prev.filter((l) => l.id !== listId);
      saveLists(next);
      return next;
    });
  }, []);

  const addPlaceToList = useCallback((listId: string, placeId: string) => {
    setLists((prev) => {
      const next = prev.map((list) => {
        if (list.id !== listId) return list;
        if (list.placeIds.includes(placeId)) return list;
        return {
          ...list,
          placeIds: [...list.placeIds, placeId],
          updatedAt: new Date().toISOString(),
        };
      });
      saveLists(next);
      return next;
    });
  }, []);

  const removePlaceFromList = useCallback((listId: string, placeId: string) => {
    setLists((prev) => {
      const next = prev.map((list) => {
        if (list.id !== listId) return list;
        return {
          ...list,
          placeIds: list.placeIds.filter((id) => id !== placeId),
          updatedAt: new Date().toISOString(),
        };
      });
      saveLists(next);
      return next;
    });
  }, []);

  const addPlaceToLists = useCallback((placeId: string, listIds: string[]) => {
    setLists((prev) => {
      const next = prev.map((list) => {
        if (!listIds.includes(list.id)) return list;
        if (list.placeIds.includes(placeId)) return list;
        return {
          ...list,
          placeIds: [...list.placeIds, placeId],
          updatedAt: new Date().toISOString(),
        };
      });
      saveLists(next);
      return next;
    });
  }, []);

  const updateListPlaceIds = useCallback((listId: string, placeIds: string[]) => {
    setLists((prev) => {
      const next = prev.map((list) =>
        list.id === listId
          ? { ...list, placeIds, updatedAt: new Date().toISOString() }
          : list
      );
      saveLists(next);
      return next;
    });
  }, []);

  const updateListName = useCallback((listId: string, name: string) => {
    setLists((prev) => {
      const next = prev.map((list) =>
        list.id === listId
          ? { ...list, name, updatedAt: new Date().toISOString() }
          : list
      );
      saveLists(next);
      return next;
    });
  }, []);

  const updateListIcon = useCallback((listId: string, icon: string) => {
    setLists((prev) => {
      const next = prev.map((list) =>
        list.id === listId
          ? { ...list, icon, updatedAt: new Date().toISOString() }
          : list
      );
      saveLists(next);
      return next;
    });
  }, []);

  return {
    lists,
    addList,
    deleteList,
    addPlaceToList,
    removePlaceFromList,
    addPlaceToLists,
    updateListPlaceIds,
    updateListName,
    updateListIcon,
  };
}
