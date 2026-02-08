"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const PENDING_FAVORITE_KEY = "tulum-pending-favorite";

export type AuthPromptReason = "save" | "create_list" | "review" | "generic";

const REASON_CONFIG: Record<
  AuthPromptReason,
  { icon: string; titleKey: string; messageKey: string }
> = {
  save: {
    icon: "💾",
    titleKey: "authPromptSaveTitle",
    messageKey: "authPromptSaveMessage",
  },
  create_list: {
    icon: "📋",
    titleKey: "authPromptListTitle",
    messageKey: "authPromptListMessage",
  },
  review: {
    icon: "✍️",
    titleKey: "authPromptReviewTitle",
    messageKey: "authPromptReviewMessage",
  },
  generic: {
    icon: "🔐",
    titleKey: "authPromptGenericTitle",
    messageKey: "authPromptGenericMessage",
  },
};

export function getPendingFavoriteId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(PENDING_FAVORITE_KEY);
  } catch {
    return null;
  }
}

export function clearPendingFavorite(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_FAVORITE_KEY);
  } catch {
    // ignore
  }
}

export function setPendingFavorite(placeId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_FAVORITE_KEY, placeId);
  } catch {
    // ignore
  }
}

interface AuthPromptModalProps {
  open: boolean;
  onClose: () => void;
  reason?: AuthPromptReason;
  pendingPlaceId?: string;
  lang?: Lang;
}

function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    "auth/popup-closed-by-user": "Sign-in cancelled",
    "auth/popup-blocked": "Please enable popups for this site",
    "auth/cancelled-popup-request": "Sign-in cancelled",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email",
  };
  return messages[code] ?? "Sign-in failed. Please try again.";
}

export function AuthPromptModal({
  open,
  onClose,
  reason = "generic",
  pendingPlaceId,
  lang = "en",
}: AuthPromptModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const t = translations[lang] as Record<string, string>;
  const config = REASON_CONFIG[reason];
  const title = t[config.titleKey] ?? (reason === "save" ? "Save Your Favorites" : "Sign in to continue");
  const message =
    t[config.messageKey] ??
    (reason === "save"
      ? "Sign in to save places and access them on any device."
      : "Sign in to unlock this feature.");

  const signInWithProvider = async (provider: "google" | "apple") => {
    setLoading(provider);
    setError(null);
    if (pendingPlaceId) {
      setPendingFavorite(pendingPlaceId);
    }
    try {
      const next =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/";
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
              : undefined,
        },
      });
      if (err) {
        setError(getErrorMessage(err.message) || err.message);
        setLoading(null);
        if (pendingPlaceId) clearPendingFavorite();
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(null);
      if (pendingPlaceId) clearPendingFavorite();
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
        }}
        aria-hidden
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
          borderRadius: "24px",
          padding: "32px",
          border: "3px solid rgba(0, 206, 209, 0.3)",
          boxShadow: "0 24px 80px rgba(0, 206, 209, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            boxShadow: "0 8px 24px rgba(0, 206, 209, 0.4)",
          }}
        >
          {config.icon}
        </div>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "800",
            textAlign: "center",
            marginBottom: "12px",
            color: "#333",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: "#666",
            textAlign: "center",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => signInWithProvider("google")}
            disabled={!!loading}
            style={{
              width: "100%",
              padding: "16px 24px",
              borderRadius: "12px",
              background: "#FFFFFF",
              border: "2px solid rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" />
              <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" />
              <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" />
              <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" />
            </svg>
            {loading === "google" ? "Signing in…" : "Continue with Google"}
          </button>
          <button
            type="button"
            onClick={() => signInWithProvider("apple")}
            disabled={!!loading}
            style={{
              width: "100%",
              padding: "16px 24px",
              borderRadius: "12px",
              background: "#000000",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
              color: "#FFFFFF",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M16.93 11.73c-.03 3.29 2.91 4.38 2.94 4.39-.02.08-.46 1.58-1.52 3.13-.91 1.34-1.86 2.68-3.36 2.71-1.47.03-1.95-.87-3.63-.87s-2.22.84-3.62.9c-1.45.05-2.55-1.46-3.47-2.79-1.89-2.73-3.33-7.71-1.39-11.08.96-1.68 2.68-2.74 4.55-2.77 1.42-.03 2.76.95 3.63.95.87 0 2.5-1.18 4.22-1 .72.03 2.73.29 4.02 2.18-.1.06-2.4 1.4-2.37 4.19M13.36 3.43c.76-.92 1.27-2.19 1.13-3.46-1.09.04-2.41.73-3.19 1.64-.7.81-1.31 2.1-1.15 3.34 1.22.09 2.46-.62 3.21-1.52" />
            </svg>
            {loading === "apple" ? "Signing in…" : "Continue with Apple"}
          </button>
        </div>
        {error && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              background: "rgba(255, 107, 107, 0.1)",
              border: "2px solid rgba(255, 107, 107, 0.3)",
              borderRadius: "12px",
              color: "#FF6B6B",
              fontSize: "14px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "12px",
            background: "transparent",
            border: "none",
            color: "#999",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {t.authPromptMaybeLater ?? "Maybe later"}
        </button>
      </div>
    </div>
  );
}
