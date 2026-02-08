"use client";

import { useState } from "react";
import type { SavedList } from "@/hooks/useLists";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface AddToListModalProps {
  placeId: string;
  placeName: string;
  lists: SavedList[];
  onClose: () => void;
  onSave: (listIds: string[]) => void;
  addPlaceToLists: (placeId: string, listIds: string[]) => void;
  removePlaceFromList: (listId: string, placeId: string) => void;
  lang?: Lang;
}

export function AddToListModal({
  placeId,
  placeName,
  lists,
  onClose,
  onSave,
  addPlaceToLists,
  removePlaceFromList,
  lang = "en",
}: AddToListModalProps) {
  const [selectedLists, setSelectedLists] = useState<string[]>(() =>
    lists.filter((l) => l.placeIds.includes(placeId)).map((l) => l.id)
  );
  const t = translations[lang] as Record<string, string>;

  const toggleList = (listId: string) => {
    setSelectedLists((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  const handleSave = () => {
    const currentInLists = lists.filter((l) => l.placeIds.includes(placeId)).map((l) => l.id);
    currentInLists.forEach((listId) => {
      if (!selectedLists.includes(listId)) {
        removePlaceFromList(listId, placeId);
      }
    });
    addPlaceToLists(placeId, selectedLists);
    onSave(selectedLists);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFF",
          borderRadius: "24px 24px 0 0",
          padding: "24px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "8px",
            color: "#333",
          }}
        >
          {t.addToList ?? "Add to List"}
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "#666",
            marginBottom: "16px",
          }}
        >
          {placeName}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {lists.map((list) => (
            <button
              key={list.id}
              type="button"
              onClick={() => toggleList(list.id)}
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: selectedLists.includes(list.id)
                  ? "rgba(0, 206, 209, 0.1)"
                  : "rgba(0, 0, 0, 0.03)",
                border: selectedLists.includes(list.id)
                  ? "2px solid #00CED1"
                  : "2px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: "24px" }}>{list.icon}</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#333",
                  }}
                >
                  {list.name}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  {list.placeIds.length} {t.places ?? "places"}
                </div>
              </div>
              {selectedLists.includes(list.id) && (
                <div style={{ fontSize: "20px", color: "#00CED1" }}>✓</div>
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSave}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            border: "none",
            fontSize: "16px",
            fontWeight: 700,
            color: "#FFF",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0, 206, 209, 0.3)",
          }}
        >
          {t.saveToLists ?? "Save to Lists"}
        </button>
      </div>
    </div>
  );
}
