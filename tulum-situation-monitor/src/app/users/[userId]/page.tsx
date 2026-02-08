"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useAuthOptional } from "@/contexts/AuthContext";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface ProfileData {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  user_type: string | null;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_own_profile: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const auth = useAuthOptional();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang] as Record<string, string>;

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}/profile`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Not found"))))
      .then(setProfile)
      .catch(() => setError("Profile not found"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleToggleFollow = async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: profile.is_following ? "DELETE" : "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setProfile((p) =>
          p
            ? {
                ...p,
                is_following: data.following,
                followers_count: p.followers_count + (data.following ? 1 : -1),
              }
            : null
        );
      }
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
          padding: "24px",
        }}
      >
        <div style={{ color: "#00CED1", fontSize: "18px" }}>
          {t.loading ?? "Loading…"}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
          padding: "24px",
        }}
      >
        <p style={{ color: "#666", fontSize: "18px" }}>
          {t.profileNotFound ?? "Profile not found"}
        </p>
        <Link
          href={`/?lang=${lang}`}
          style={{
            padding: "14px 28px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            color: "#FFF",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {t.back ?? "Back"}
        </Link>
      </div>
    );
  }

  const displayName = profile.display_name || "Traveler";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
        padding: "24px",
        paddingTop: "max(24px, env(safe-area-inset-top))",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <Link
          href={`/?lang=${lang}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "rgba(0, 206, 209, 0.12)",
            border: "2px solid rgba(0, 206, 209, 0.2)",
            color: "var(--tulum-ocean)",
            fontSize: "20px",
            textDecoration: "none",
          }}
        >
          ←
        </Link>
        <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#333" }}>
          {t.profile ?? "Profile"}
        </h1>
      </header>

      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          padding: "100px 24px 24px",
          marginBottom: "24px",
          border: "2px solid rgba(0, 206, 209, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: "6px solid #FFF",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
            color: "#FFF",
            fontWeight: 700,
          }}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            displayName[0]?.toUpperCase() ?? "👤"
          )}
        </div>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 800,
              margin: "0 0 8px 0",
              color: "#333",
            }}
          >
            {displayName}
          </h2>
          {profile.bio && (
            <p
              style={{
                fontSize: "15px",
                color: "#666",
                margin: "0 0 16px 0",
                lineHeight: 1.5,
              }}
            >
              {profile.bio}
            </p>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              padding: "12px",
              background: "rgba(0, 206, 209, 0.05)",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#00CED1",
                marginBottom: "4px",
              }}
            >
              —
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#666" }}>
              {t.favorites ?? "Favorites"}
            </div>
          </div>
          <div
            style={{
              padding: "12px",
              background: "rgba(0, 206, 209, 0.05)",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#00CED1",
                marginBottom: "4px",
              }}
            >
              {profile.followers_count}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#666" }}>
              {t.followers ?? "Followers"}
            </div>
          </div>
          <div
            style={{
              padding: "12px",
              background: "rgba(0, 206, 209, 0.05)",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#00CED1",
                marginBottom: "4px",
              }}
            >
              {profile.following_count}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#666" }}>
              {t.following ?? "Following"}
            </div>
          </div>
        </div>

        {!profile.is_own_profile && auth?.isAuthenticated && (
          <button
            type="button"
            onClick={handleToggleFollow}
            disabled={followLoading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: profile.is_following
                ? "transparent"
                : "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
              border: profile.is_following
                ? "2px solid rgba(0, 0, 0, 0.1)"
                : "none",
              color: profile.is_following ? "#333" : "#FFF",
              fontSize: "15px",
              fontWeight: 700,
              cursor: followLoading ? "not-allowed" : "pointer",
              boxShadow: profile.is_following
                ? "none"
                : "0 4px 16px rgba(0, 206, 209, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {followLoading
              ? "…"
              : profile.is_following
                ? `✓ ${t.following ?? "Following"}`
                : `+ ${t.follow ?? "Follow"}`}
          </button>
        )}

        {profile.is_own_profile && (
          <Link
            href={`/favorites?lang=${lang}`}
            style={{
              display: "block",
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: "rgba(0, 206, 209, 0.1)",
              border: "2px solid #00CED1",
              color: "#00CED1",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            ⭐ {t.savedPlaces ?? "Saved Places"}
          </Link>
        )}
      </div>
    </div>
  );
}
