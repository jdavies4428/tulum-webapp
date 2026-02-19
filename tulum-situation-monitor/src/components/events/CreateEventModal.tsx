"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
  const supabase = createClient();

  // Pre-fill with user's profile info
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState(
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || ""
  );
  const [authorHandle, setAuthorHandle] = useState(
    user?.email?.split("@")[0] ? `@${user.email.split("@")[0]}` : ""
  );
  const [authorAvatar, setAuthorAvatar] = useState(
    user?.user_metadata?.avatar_url || "📅"
  );
  const [useProfilePhoto, setUseProfilePhoto] = useState(
    !!user?.user_metadata?.avatar_url
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const path = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("event-images")
        .upload(path, file, { contentType: file.type });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(data.path);

      setImageUrl(publicUrl);
      toast.success("Image uploaded!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
  };

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
          imageUrl,
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
          maxHeight: "90vh",
          background: "rgba(20, 30, 45, 0.85)",
          borderRadius: radius.lg,
          boxShadow: shadows.lg,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: spacing.xl, flex: "1 1 auto", overflow: "auto" }}>
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
                color: "#E8ECEF",
              }}
            >
              Avatar
            </label>
            <div
              style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}
            >
              {/* Profile Photo Option (if available) */}
              {user?.user_metadata?.avatar_url && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthorAvatar(user.user_metadata.avatar_url);
                    setUseProfilePhoto(true);
                  }}
                  style={{
                    width: "48px",
                    height: "48px",
                    border:
                      useProfilePhoto
                        ? `3px solid ${colors.primary.base}`
                        : "2px solid rgba(0, 206, 209, 0.2)",
                    borderRadius: "50%",
                    background: "rgba(20, 30, 45, 0.85)",
                    cursor: "pointer",
                    padding: 0,
                    overflow: "hidden",
                    transition: "all 0.2s",
                  }}
                >
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Your photo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </button>
              )}

              {/* Emoji Options */}
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setAuthorAvatar(emoji);
                    setUseProfilePhoto(false);
                  }}
                  style={{
                    width: "48px",
                    height: "48px",
                    border:
                      !useProfilePhoto && authorAvatar === emoji
                        ? `3px solid ${colors.primary.base}`
                        : "2px solid rgba(0, 206, 209, 0.2)",
                    borderRadius: "50%",
                    background:
                      !useProfilePhoto && authorAvatar === emoji
                        ? "rgba(0, 206, 209, 0.1)"
                        : "rgba(20, 30, 45, 0.85)",
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
                color: "#E8ECEF",
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
                border: "2px solid rgba(0, 206, 209, 0.12)",
                borderRadius: radius.md,
                fontSize: "15px",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary.base;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 206, 209, 0.12)";
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
                color: "#E8ECEF",
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
                border: "2px solid rgba(0, 206, 209, 0.12)",
                borderRadius: radius.md,
                fontSize: "15px",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary.base;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 206, 209, 0.12)";
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
                color: "#E8ECEF",
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
                border: "2px solid rgba(0, 206, 209, 0.12)",
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
                e.target.style.borderColor = "rgba(0, 206, 209, 0.12)";
              }}
            />
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: spacing.lg }}>
            <label
              style={{
                display: "block",
                marginBottom: spacing.sm,
                fontSize: "14px",
                fontWeight: "600",
                color: "#E8ECEF",
              }}
            >
              Event Image (Optional)
            </label>

            {imageUrl ? (
              <div
                style={{
                  position: "relative",
                  borderRadius: radius.md,
                  overflow: "hidden",
                  border: "2px solid rgba(0, 206, 209, 0.12)",
                }}
              >
                <img
                  src={imageUrl}
                  alt="Event preview"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    position: "absolute",
                    top: spacing.sm,
                    right: spacing.sm,
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.7)",
                    border: "none",
                    color: "#FFF",
                    fontSize: "18px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{
                    width: "100%",
                    padding: spacing.lg,
                    border: "2px dashed rgba(0, 206, 209, 0.12)",
                    borderRadius: radius.md,
                    background: "rgba(20, 30, 45, 0.5)",
                    cursor: uploading ? "not-allowed" : "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: spacing.sm,
                    color: "rgba(232, 236, 239, 0.6)",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ fontSize: "32px" }}>
                    {uploading ? "⏳" : "📸"}
                  </span>
                  <span>
                    {uploading ? "Uploading..." : "Click to upload image"}
                  </span>
                  <span style={{ fontSize: "12px", color: "rgba(232, 236, 239, 0.6)" }}>
                    Max 5MB • JPG, PNG, GIF
                  </span>
                </button>
              </div>
            )}
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
                background: "rgba(255, 255, 255, 0.05)",
                border: "none",
                borderRadius: radius.md,
                fontSize: "15px",
                fontWeight: "600",
                color: "#E8ECEF",
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
                color: "#FFF",
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
    </div>
  );
}
