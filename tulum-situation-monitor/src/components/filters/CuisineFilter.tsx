"use client";

import { useState } from "react";

export type CuisineTag =
  | "all"
  | "mexican"
  | "italian"
  | "asian"
  | "cafe"
  | "breakfast"
  | "seafood"
  | "vegan"
  | "healthy"
  | "american";

interface CuisineFilterProps {
  selectedCuisine: CuisineTag;
  onCuisineChange: (cuisine: CuisineTag) => void;
  counts?: Record<string, number>;
}

const CUISINE_OPTIONS: { id: CuisineTag; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "mexican", label: "Mexican", emoji: "🌮" },
  { id: "italian", label: "Italian", emoji: "🍕" },
  { id: "asian", label: "Asian", emoji: "🍱" },
  { id: "cafe", label: "Cafe", emoji: "☕" },
  { id: "breakfast", label: "Breakfast", emoji: "🍳" },
  { id: "seafood", label: "Seafood", emoji: "🦞" },
  { id: "vegan", label: "Vegan", emoji: "🥗" },
  { id: "healthy", label: "Healthy", emoji: "🌱" },
  { id: "american", label: "American", emoji: "🍔" },
];

export function CuisineFilter({ selectedCuisine, onCuisineChange, counts }: CuisineFilterProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        overflowY: "hidden",
        padding: "12px 16px",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      className="cuisine-filter-scroll"
    >
      <style jsx>{`
        .cuisine-filter-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {CUISINE_OPTIONS.map((option) => {
        const isSelected = selectedCuisine === option.id;
        const count = counts?.[option.id];

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onCuisineChange(option.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "20px",
              border: "2px solid",
              borderColor: isSelected ? "#00CED1" : "rgba(0, 0, 0, 0.1)",
              background: isSelected
                ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                : "rgba(20, 30, 45, 0.85)",
              color: isSelected ? "#FFFFFF" : "#E8ECEF",
              fontSize: "14px",
              fontWeight: isSelected ? 700 : 600,
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              boxShadow: isSelected
                ? "0 4px 12px rgba(0, 206, 209, 0.3)"
                : "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "#00CED1";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = "rgba(232, 236, 239, 0.2)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
              }
            }}
          >
            <span style={{ fontSize: "18px" }}>{option.emoji}</span>
            <span>{option.label}</span>
            {count !== undefined && count > 0 && (
              <span
                style={{
                  fontSize: "12px",
                  opacity: 0.8,
                  fontWeight: 600,
                }}
              >
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Helper function to filter restaurants by cuisine
 */
export function filterByCuisine<T extends { cuisines?: string[] }>(
  items: T[],
  cuisine: CuisineTag
): T[] {
  if (cuisine === "all") return items;

  return items.filter((item) => {
    if (!item.cuisines || item.cuisines.length === 0) return false;

    // Match any cuisine tag that contains the selected cuisine
    return item.cuisines.some((c) => c.includes(cuisine));
  });
}

/**
 * Calculate counts for each cuisine from a list of items
 */
export function calculateCuisineCounts<T extends { cuisines?: string[] }>(
  items: T[]
): Record<string, number> {
  const counts: Record<string, number> = { all: items.length };

  CUISINE_OPTIONS.forEach((option) => {
    if (option.id === "all") return;

    counts[option.id] = items.filter((item) =>
      item.cuisines?.some((c) => c.includes(option.id))
    ).length;
  });

  return counts;
}
