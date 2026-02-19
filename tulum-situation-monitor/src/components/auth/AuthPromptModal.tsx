"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

const PENDING_FAVORITE_KEY = "tulum-pending-favorite";

export type AuthPromptReason = "save" | "create_list" | "review" | "generic";

const REASON_CONFIG: Record<
  AuthPromptReason,
  { titleKey: string; messageKey: string }
> = {
  save: {
    titleKey: "authPromptSaveTitle",
    messageKey: "authPromptSaveMessage",
  },
  create_list: {
    titleKey: "authPromptListTitle",
    messageKey: "authPromptListMessage",
  },
  review: {
    titleKey: "authPromptReviewTitle",
    messageKey: "authPromptReviewMessage",
  },
  generic: {
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

function getErrorMessage(code: string, message?: string): string {
  if (message) return message;
  const messages: Record<string, string> = {
    "auth/popup-closed-by-user": "Sign-in cancelled",
    "auth/popup-blocked": "Please enable popups for this site",
    "auth/cancelled-popup-request": "Sign-in cancelled",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email",
    auth_oauth_error: "Google sign-in was declined or failed.",
    auth_callback_no_code: "Sign-in incomplete. Please try again.",
    auth_exchange_failed:
      "Session exchange failed. Try again or clear cookies and retry.",
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
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const t = translations[lang] as Record<string, string>;
  const config = REASON_CONFIG[reason];
  const title = t[config.titleKey] ?? "Welcome to Tulum";
  const message =
    t[config.messageKey] ?? "Sign in to save your favorites and unlock features.";

  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

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
          scopes: provider === "google" ? "email profile" : undefined,
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

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 0,
        animation: open ? "fadeIn 0.2s ease-out" : "fadeOut 0.2s ease-out",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
        aria-hidden
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "100vw",
          background: "rgba(20, 30, 45, 0.85)",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          paddingTop: "max(20px, env(safe-area-inset-top))",
          paddingBottom: "max(32px, env(safe-area-inset-bottom))",
          paddingLeft: "20px",
          paddingRight: "20px",
          boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.1)",
          animation: open
            ? "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            : "slideDown 0.3s ease-in",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div
          style={{
            width: "36px",
            height: "5px",
            background: "rgba(0, 206, 209, 0.12)",
            borderRadius: "100px",
            margin: "0 auto 24px",
          }}
        />

        {/* Content */}
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              textAlign: "center",
              marginBottom: "8px",
              color: "#E8ECEF",
              letterSpacing: "-0.5px",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: "rgba(232, 236, 239, 0.6)",
              textAlign: "center",
              marginBottom: "32px",
              lineHeight: 1.5,
              fontWeight: "400",
            }}
          >
            {message}
          </p>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Google Button */}
            <button
              type="button"
              onClick={() => signInWithProvider("google")}
              disabled={!!loading}
              style={{
                width: "100%",
                padding: "15px 20px",
                borderRadius: "12px",
                background: "rgba(20, 30, 45, 0.85)",
                border: "1px solid rgba(0, 206, 209, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "500",
                color: "#E8ECEF",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                transition: "all 0.2s ease",
                opacity: loading ? 0.6 : 1,
              }}
              onMouseDown={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "scale(0.98)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0, 0, 0, 0.05)";
                }
              }}
              onMouseUp={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0, 0, 0, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0, 0, 0, 0.05)";
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
              <span>{loading === "google" ? "Signing in…" : "Continue with Google"}</span>
            </button>

            {/* Apple Button */}
            <button
              type="button"
              onClick={() => signInWithProvider("apple")}
              disabled={!!loading}
              style={{
                width: "100%",
                padding: "15px 20px",
                borderRadius: "12px",
                background: "#000000",
                border: "1px solid #000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "500",
                color: "#FFFFFF",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                transition: "all 0.2s ease",
                opacity: loading ? 0.6 : 1,
              }}
              onMouseDown={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "scale(0.98)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(0, 0, 0, 0.15)";
                }
              }}
              onMouseUp={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0, 0, 0, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0, 0, 0, 0.15)";
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
                <path d="M15.237 10.557c-.027 2.961 2.619 3.942 2.646 3.951-.022.071-.414 1.422-1.368 2.817-.819 1.206-1.674 2.412-3.024 2.438-1.323.027-1.755-.785-3.267-.785-1.512 0-1.998.757-3.258.81-1.305.045-2.295-1.314-3.123-2.511-1.701-2.457-3-6.94-1.251-9.972.864-1.512 2.412-2.466 4.095-2.493 1.278-.027 2.484.855 3.267.855.783 0 2.25-1.062 3.798-.906.648.027 2.457.261 3.618 1.962-.093.054-2.16 1.26-2.133 3.768M11.952 3.087c.684-.828 1.143-1.971.999-3.114-.981.036-2.169.657-2.871 1.476-.63.729-1.179 1.89-1.035 3.006 1.098.081 2.214-.558 2.907-1.368" />
              </svg>
              <span>{loading === "apple" ? "Signing in…" : "Continue with Apple"}</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                background: "rgba(255, 59, 48, 0.08)",
                border: "1px solid rgba(255, 59, 48, 0.15)",
                borderRadius: "10px",
                color: "#FF3B30",
                fontSize: "13px",
                fontWeight: "500",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}

          {/* Maybe Later */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              background: "transparent",
              border: "none",
              color: "rgba(232, 236, 239, 0.5)",
              fontSize: "15px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(232, 236, 239, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(232, 236, 239, 0.5)";
            }}
          >
            {t.authPromptMaybeLater ?? "Maybe later"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0.8;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
