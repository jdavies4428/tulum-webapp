"use client";

import Link from "next/link";
import { useState } from "react";
import { formatMessageTime } from "@/lib/chat-helpers";
import { proxyImageUrl } from "@/lib/image-proxy";
import type { ChatMessage } from "@/hooks/useChatMessages";

interface OtherUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  otherUser: OtherUser;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
  otherUser,
}: MessageBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      {!isOwn && (
        <div style={{ width: 32, height: 32, flexShrink: 0 }}>
          {showAvatar ? (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #00CED1",
                background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#FFF",
                fontWeight: 700,
              }}
            >
              {otherUser.avatar_url ? (
                <img
                  src={proxyImageUrl(otherUser.avatar_url, 64) ?? otherUser.avatar_url}
                  alt={otherUser.display_name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                otherUser.display_name[0]?.toUpperCase() ?? "👤"
              )}
            </div>
          ) : null}
        </div>
      )}

      <div
        style={{
          maxWidth: "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
        }}
      >
        {message.type === "text" && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 18,
              background: isOwn
                ? "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)"
                : "rgba(20, 30, 45, 0.85)",
              color: isOwn ? "#FFF" : "#E8ECEF",
              fontSize: 15,
              lineHeight: 1.4,
              wordWrap: "break-word",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            {message.content}
          </div>
        )}

        {message.type === "place" && message.metadata && (
          <PlaceMessage
            place={message.metadata as { place_id?: string; place_name?: string; category?: string; image_url?: string; rating?: number }}
            isOwn={isOwn}
          />
        )}

        {message.type === "image" && message.metadata?.imageUrl ? (
          <>
            <img
              src={proxyImageUrl(String(message.metadata.imageUrl), 384) ?? String(message.metadata.imageUrl)}
              alt="Shared"
              onClick={() => setLightboxOpen(true)}
              style={{
                maxWidth: 260,
                maxHeight: 260,
                borderRadius: 16,
                cursor: "pointer",
                border: isOwn
                  ? "2px solid rgba(255, 255, 255, 0.3)"
                  : "2px solid rgba(0, 206, 209, 0.2)",
              }}
            />
            {lightboxOpen && (
              <div
                onClick={() => setLightboxOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.9)",
                  zIndex: 10000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={String(message.metadata.imageUrl)}
                  alt="Shared"
                  style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </>
        ) : null}

        {message.type === "location" && message.metadata && (
          <LocationMessage
            lat={Number(message.metadata.latitude)}
            lng={Number(message.metadata.longitude)}
            isOwn={isOwn}
          />
        )}

        <div
          style={{
            fontSize: 11,
            color: "#999",
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {formatMessageTime(message.created_at)}
          {isOwn && message.read_at && (
            <span style={{ color: "#00CED1" }}>✓✓</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PlaceMessage({
  place,
  isOwn,
}: {
  place: {
    place_id?: string;
    place_name?: string;
    category?: string;
    image_url?: string;
    rating?: number;
  };
  isOwn: boolean;
}) {
  const href = place.place_id
    ? `/map?place=${encodeURIComponent(place.place_id)}`
    : "#";

  return (
    <Link
      href={href}
      style={{
        width: 260,
        borderRadius: 16,
        overflow: "hidden",
        background: isOwn
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(20, 30, 45, 0.85)",
        border: isOwn
          ? "2px solid rgba(255, 255, 255, 0.3)"
          : "2px solid rgba(0, 206, 209, 0.2)",
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
        display: "block",
      }}
    >
      {place.image_url && (
        <img
          src={place.image_url}
          alt={place.place_name ?? "Place"}
          style={{
            width: "100%",
            height: 140,
            objectFit: "cover",
          }}
        />
      )}
      <div style={{ padding: 12 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: isOwn ? "#FFF" : "#E8ECEF",
            marginBottom: 4,
          }}
        >
          📍 {place.place_name ?? "Place"}
        </div>
        <div
          style={{
            fontSize: 13,
            color: isOwn ? "rgba(255,255,255,0.8)" : "rgba(232, 236, 239, 0.6)",
          }}
        >
          {place.category ?? ""}
          {place.rating != null && (
            <span style={{ marginLeft: 8 }}>
              ⭐ {place.rating}/10
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function LocationMessage({
  lat,
  lng,
  isOwn,
}: {
  lat: number;
  lng: number;
  isOwn: boolean;
}) {
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        width: 260,
        padding: 16,
        borderRadius: 16,
        background: isOwn
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(20, 30, 45, 0.85)",
        border: isOwn
          ? "2px solid rgba(255, 255, 255, 0.3)"
          : "2px solid rgba(0, 206, 209, 0.2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span style={{ fontSize: 28 }}>📍</span>
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: isOwn ? "#FFF" : "#E8ECEF",
          }}
        >
          Shared location
        </div>
        <div
          style={{
            fontSize: 12,
            color: isOwn ? "rgba(255,255,255,0.8)" : "rgba(232, 236, 239, 0.6)",
          }}
        >
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>
    </a>
  );
}
