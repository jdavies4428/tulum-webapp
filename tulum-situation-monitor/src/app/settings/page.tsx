"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { spacing, radius, shadows } from "@/lib/design-tokens";

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

  const avatarUrl = user.user_metadata?.avatar_url
    ? `${user.user_metadata.avatar_url}?v=${cacheBuster}`
    : null;

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`Image is too large (${fileSizeMB}MB). Max size is 5MB`);
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(uploadData.path);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      toast.success("Profile photo updated!");

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
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      if (error) throw error;

      toast.success("Profile photo removed");

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
        background: "#0A0F14",
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
          background: "rgba(15, 20, 25, 0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 206, 209, 0.12)",
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
            background: "rgba(0, 206, 209, 0.1)",
            border: "1px solid rgba(0, 206, 209, 0.2)",
            color: "#00CED1",
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
            color: "#E8ECEF",
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
            background: "rgba(20, 30, 45, 0.8)",
            borderRadius: radius.lg,
            padding: spacing.xl,
            boxShadow: shadows.md,
            border: "1px solid rgba(0, 206, 209, 0.12)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              margin: `0 0 ${spacing.lg}px 0`,
              color: "#00CED1",
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
                border: "3px solid rgba(0, 206, 209, 0.4)",
                overflow: "hidden",
                background: avatarUrl
                  ? "rgba(20, 30, 45, 0.5)"
                  : "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
                boxShadow: "0 8px 32px rgba(0, 206, 209, 0.2)",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${displayName} profile photo`}
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
                  color: "#E8ECEF",
                  marginBottom: spacing.xs,
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "rgba(232, 236, 239, 0.5)",
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
                  color: "#FFF",
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                  boxShadow: "0 4px 16px rgba(0, 206, 209, 0.3)",
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
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: radius.md,
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#E8ECEF",
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
                color: "rgba(232, 236, 239, 0.4)",
                textAlign: "center",
                margin: 0,
              }}
            >
              Max 5MB • JPG, PNG, or GIF
            </p>
          </div>
        </div>

        {/* Account Info Section */}
        <div
          style={{
            background: "rgba(20, 30, 45, 0.8)",
            borderRadius: radius.lg,
            padding: spacing.xl,
            boxShadow: shadows.md,
            border: "1px solid rgba(0, 206, 209, 0.12)",
            marginTop: spacing.lg,
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "700",
              margin: `0 0 ${spacing.lg}px 0`,
              color: "#00CED1",
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
                  color: "rgba(232, 236, 239, 0.5)",
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
                  color: "#E8ECEF",
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
                  color: "rgba(232, 236, 239, 0.5)",
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
                  color: "rgba(232, 236, 239, 0.4)",
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
