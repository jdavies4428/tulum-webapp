"use client";

import { useState } from "react";
import { toast } from "sonner";
import { spacing, colors, radius, shadows } from "@/lib/design-tokens";

interface CreateEventModalProps {
  onClose: () => void;
}

const EMOJI_SUGGESTIONS = [
  "📅",
  "🎉",
  "🏖️",
  "🍽️",
  "🏊",
  "🐢",
  "🌴",
  "🎵",
  "🍹",
  "🌅",
];

export function CreateEventModal({ onClose }: CreateEventModalProps) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorHandle, setAuthorHandle] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("📅");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !authorName.trim() || !authorHandle.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (content.length > 2000) {
      toast.error("Content is too long (max 2000 characters)");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          authorName: authorName.trim(),
          authorHandle: authorHandle.trim().startsWith("@")
            ? authorHandle.trim()
            : `@${authorHandle.trim()}`,
          authorAvatar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      toast.success("Event posted successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to post event"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "500px",
          background: colors.neutral.white,
          borderRadius: radius.lg,
          boxShadow: shadows.lg,
          padding: spacing.xl,
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: spacing.lg,
            fontSize: "24px",
            fontWeight: "800",
            color: colors.primary.base,
          }}
        >
          ✍️ Create Event Post
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Avatar Picker */}
          <div style={{ marginBottom: spacing.lg }}>
            <label
              style={{
                display: "block",
                marginBottom: spacing.sm,
                fontSize: "14px",
                fontWeight: "600",
                color: colors.neutral.gray[700],
              }}
            >
              Avatar
            </label>
            <div
              style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}
            >
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAuthorAvatar(emoji)}
                  style={{
                    width: "48px",
                    height: "48px",
                    border:
                      authorAvatar === emoji
                        ? `3px solid ${colors.primary.base}`
                        : "2px solid rgba(0, 206, 209, 0.2)",
                    borderRadius: "50%",
                    background:
                      authorAvatar === emoji
                        ? "rgba(0, 206, 209, 0.1)"
                        : colors.neutral.white,
                    cursor: "pointer",
                    fontSize: "24px",
                    transition: "all 0.2s",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Author Name */}
          <div style={{ marginBottom: spacing.md }}>
            <label
              style={{
                display: "block",
                marginBottom: spacing.sm,
                fontSize: "14px",
                fontWeight: "600",
                color: colors.neutral.gray[700],
              }}
            >
              Author Name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g., Tulum Beach Club"
              maxLength={100}
              style={{
                width: "100%",
                padding: spacing.md,
                border: `2px solid ${colors.neutral.gray[200]}`,
                borderRadius: radius.md,
                fontSize: "15px",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary.base;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.neutral.gray[200];
              }}
            />
          </div>

          {/* Author Handle */}
          <div style={{ marginBottom: spacing.lg }}>
            <label
              style={{
                display: "block",
                marginBottom: spacing.sm,
                fontSize: "14px",
                fontWeight: "600",
                color: colors.neutral.gray[700],
              }}
            >
              Handle
            </label>
            <input
              type="text"
              value={authorHandle}
              onChange={(e) => setAuthorHandle(e.target.value)}
              placeholder="@tulumbeach"
              maxLength={50}
              style={{
                width: "100%",
                padding: spacing.md,
                border: `2px solid ${colors.neutral.gray[200]}`,
                borderRadius: radius.md,
                fontSize: "15px",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary.base;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.neutral.gray[200];
              }}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: spacing.lg }}>
            <label
              style={{
                display: "block",
                marginBottom: spacing.sm,
                fontSize: "14px",
                fontWeight: "600",
                color: colors.neutral.gray[700],
              }}
            >
              Event Content ({content.length}/2000)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in Tulum?"
              maxLength={2000}
              rows={6}
              style={{
                width: "100%",
                padding: spacing.md,
                border: `2px solid ${colors.neutral.gray[200]}`,
                borderRadius: radius.md,
                fontSize: "15px",
                lineHeight: "1.5",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary.base;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.neutral.gray[200];
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: spacing.md }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: spacing.md,
                background: colors.neutral.gray[100],
                border: "none",
                borderRadius: radius.md,
                fontSize: "15px",
                fontWeight: "600",
                color: colors.neutral.gray[700],
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !content.trim() ||
                !authorName.trim() ||
                !authorHandle.trim()
              }
              style={{
                flex: 1,
                padding: spacing.md,
                background:
                  "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
                border: "none",
                borderRadius: radius.md,
                fontSize: "15px",
                fontWeight: "700",
                color: colors.neutral.white,
                cursor:
                  loading || !content.trim() ? "not-allowed" : "pointer",
                opacity: loading || !content.trim() ? 0.5 : 1,
                boxShadow: shadows.md,
              }}
            >
              {loading ? "Posting..." : "Post Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
