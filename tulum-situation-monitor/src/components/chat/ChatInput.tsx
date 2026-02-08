"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface ChatInputProps {
  onSend: (text: string) => void;
  lang: Lang;
  onSharePlace?: () => void;
  onShareLocation?: () => void;
  onShareImage?: (imageUrl: string) => void;
}

export function ChatInput({
  onSend,
  lang,
  onSharePlace,
  onShareLocation,
  onShareImage,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang] as Record<string, string>;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onShareImage) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("chat-images")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("chat-images")
        .getPublicUrl(data.path);
      onShareImage(urlData.publicUrl);
    } catch {
      // Upload failed
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div
      style={{
        padding: 16,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "2px solid rgba(0, 206, 209, 0.2)",
      }}
    >
      {showActions && (onSharePlace || onShareLocation || onShareImage) && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          {onSharePlace && (
            <button
              type="button"
              onClick={() => {
                onSharePlace();
                setShowActions(false);
              }}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                background: "rgba(0, 206, 209, 0.1)",
                border: "2px solid rgba(0, 206, 209, 0.3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#00CED1",
              }}
            >
              <span style={{ fontSize: 18 }}>📍</span>
              <span>{t.sharePlace ?? "Share Place"}</span>
            </button>
          )}
          {onShareLocation && (
            <button
              type="button"
              onClick={() => {
                onShareLocation();
                setShowActions(false);
              }}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                background: "rgba(0, 206, 209, 0.1)",
                border: "2px solid rgba(0, 206, 209, 0.3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: "#00CED1",
              }}
            >
              <span style={{ fontSize: 18 }}>🗺️</span>
              <span>{t.shareLocation ?? "Location"}</span>
            </button>
          )}
          {onShareImage && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: "rgba(0, 206, 209, 0.1)",
                  border: "2px solid rgba(0, 206, 209, 0.3)",
                  cursor: uploading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#00CED1",
                }}
              >
                <span style={{ fontSize: 18 }}>📷</span>
                <span>{uploading ? (t.loading ?? "…") : (t.photo ?? "Photo")}</span>
              </button>
            </>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {(onSharePlace || onShareLocation || onShareImage) && (
          <button
            type="button"
            onClick={() => setShowActions(!showActions)}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(0, 206, 209, 0.1)",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              transform: showActions ? "rotate(45deg)" : "none",
              transition: "transform 0.3s",
            }}
          >
            +
          </button>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t.typeMessage ?? "Type a message..."}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 24,
            border: "2px solid rgba(0, 206, 209, 0.2)",
            fontSize: 15,
            outline: "none",
          }}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim()}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: value.trim()
              ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
              : "rgba(0, 206, 209, 0.2)",
            border: "none",
            fontSize: 20,
            cursor: value.trim() ? "pointer" : "not-allowed",
            boxShadow: value.trim()
              ? "0 4px 12px rgba(0, 206, 209, 0.3)"
              : "none",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
