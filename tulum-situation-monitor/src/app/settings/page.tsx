"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { spacing, colors, radius, shadows } from "@/lib/design-tokens";

export default function SettingsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    router.push("/signin");
    return null;
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  // Use user metadata directly, with cache buster for images
  const avatarUrl = user.user_metadata?.avatar_url
    ? `${user.user_metadata.avatar_url}?v=${cacheBuster}`
    : null;

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB for profile photos)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploading(true);
    try {
      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(uploadData.path);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      toast.success("Profile photo updated!");

      // Refresh user data in auth context and update cache buster
      if (refreshUser) {
        await refreshUser();
      }
      setCacheBuster(Date.now());
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload profile photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      // Update user metadata to remove avatar
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      if (error) throw error;

      toast.success("Profile photo removed");

      // Refresh user data and update cache buster
      if (refreshUser) {
        await refreshUser();
      }
      setCacheBuster(Date.now());
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error("Failed to remove profile photo");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        height: "100%",
        background:
          "linear-gradient(180deg, #E0F7FA 0%, #FFF8E7 50%, #FFFFFF 100%)",
        paddingTop: "max(24px, env(safe-area-inset-top))",
        paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255, 248, 231, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 206, 209, 0.2)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(0, 206, 209, 0.12)",
            border: "2px solid rgba(0, 206, 209, 0.2)",
            color: "var(--tulum-ocean)",
            fontSize: "18px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "800",
            margin: 0,
            color: "var(--tulum-ocean)",
            flex: 1,
          }}
        >
          ⚙️ Settings
        </h1>
      </header>

      {/* Content */}
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: spacing.xl,
        }}
      >
        {/* Profile Photo Section */}
        <div
          style={{
            background: colors.neutral.white,
            borderRadius: radius.lg,
            padding: spacing.xl,
            boxShadow: shadows.md,
            border: "1px solid rgba(0, 206, 209, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              margin: `0 0 ${spacing.lg}px 0`,
              color: colors.primary.base,
            }}
          >
            Profile Photo
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: spacing.lg,
            }}
          >
            {/* Current Photo Display */}
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: "4px solid #00CED1",
                overflow: "hidden",
                background: avatarUrl
                  ? colors.neutral.white
                  : "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
                boxShadow: shadows.lg,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    fontWeight: "700",
                    color: "#FFF",
                  }}
                >
                  {displayName[0]?.toUpperCase() ?? "👤"}
                </div>
              )}
            </div>

            {/* User Info */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: colors.neutral.gray[800],
                  marginBottom: spacing.xs,
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: colors.neutral.gray[600],
                }}
              >
                {user.email}
              </div>
            </div>

            {/* Upload Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: spacing.md,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  padding: `${spacing.md}px ${spacing.lg}px`,
                  background:
                    "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
                  border: "none",
                  borderRadius: radius.md,
                  fontSize: "15px",
                  fontWeight: "700",
                  color: colors.neutral.white,
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                  boxShadow: shadows.md,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                {uploading ? "⏳" : "📸"} {uploading ? "Uploading..." : avatarUrl ? "Change Photo" : "Upload Photo"}
              </button>

              {avatarUrl && !uploading && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    padding: `${spacing.md}px ${spacing.lg}px`,
                    background: colors.neutral.gray[100],
                    border: "none",
                    borderRadius: radius.md,
                    fontSize: "15px",
                    fontWeight: "600",
                    color: colors.neutral.gray[700],
                    cursor: "pointer",
                  }}
                >
                  🗑️ Remove Photo
                </button>
              )}
            </div>

            {/* Help Text */}
            <p
              style={{
                fontSize: "12px",
                color: colors.neutral.gray[500],
                textAlign: "center",
                margin: 0,
              }}
            >
              Max 2MB • JPG, PNG, or GIF
            </p>
          </div>
        </div>

        {/* Account Info Section */}
        <div
          style={{
            background: colors.neutral.white,
            borderRadius: radius.lg,
            padding: spacing.xl,
            boxShadow: shadows.md,
            border: "1px solid rgba(0, 206, 209, 0.1)",
            marginTop: spacing.lg,
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              margin: `0 0 ${spacing.lg}px 0`,
              color: colors.primary.base,
            }}
          >
            Account Information
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: colors.neutral.gray[600],
                  marginBottom: spacing.xs,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Email
              </label>
              <div
                style={{
                  fontSize: "15px",
                  color: colors.neutral.gray[800],
                }}
              >
                {user.email}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: colors.neutral.gray[600],
                  marginBottom: spacing.xs,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                User ID
              </label>
              <div
                style={{
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: colors.neutral.gray[600],
                }}
              >
                {user.id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
