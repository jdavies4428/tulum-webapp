"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { spacing, radius } from "@/lib/design-tokens";
import { Card, CardContent } from "@/components/ui/Card";

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

interface AuthScreenProps {
  onSignInComplete: (user: { id: string; email?: string; name?: string; photo?: string } | null) => void;
}

export function AuthScreen({ onSignInComplete }: AuthScreenProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const err = searchParams.get("error");
    const msg = searchParams.get("message");
    if (err) {
      setError(getErrorMessage(err, msg ? decodeURIComponent(msg) : undefined));
    }
  }, [searchParams]);

  const signInWithProvider = async (provider: "google" | "apple") => {
    setLoading(provider);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(
                  window.location.pathname === "/signin"
                    ? "/"
                    : window.location.pathname + window.location.search
                )}`
              : undefined,
          scopes: provider === "google" ? "email profile" : undefined,
        },
      });
      if (err) {
        setError(getErrorMessage(err.message) ?? err.message);
        setLoading(null);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(null);
    }
  };

  const handleGuest = () => {
    onSignInComplete(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
        background: "linear-gradient(135deg, rgba(20, 30, 45, 0.98) 0%, rgba(25, 38, 55, 0.95) 50%, rgba(30, 45, 60, 0.95) 100%)",
        backgroundSize: "200% 200%",
        animation: "gradient-shift 15s ease infinite",
      }}
    >
      <div
        className="spring-slide-up"
        style={{
          textAlign: "center",
          marginBottom: spacing.xxxl,
        }}
      >
        <div style={{ fontSize: "64px", marginBottom: spacing.md, animation: "spring-bounce 1s ease-out" }}>🌴</div>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "800",
            margin: `0 0 ${spacing.md}px 0`,
            background: "linear-gradient(135deg, #0099CC 0%, #00CED1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Tulum Discovery
        </h1>
        <p style={{ fontSize: "16px", color: "rgba(232, 236, 239, 0.6)", margin: 0 }}>
          Your real-time guide to paradise
        </p>
      </div>

      <Card
        variant="glass"
        className="spring-slide-up"
        style={{
          width: "100%",
          maxWidth: "400px",
          animation: "spring-slide-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
          border: "2px solid rgba(0, 206, 209, 0.2)",
        }}
      >
        <CardContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
            }}
          >
        <button
          type="button"
          onClick={() => signInWithProvider("google")}
          disabled={!!loading}
          className={loading ? "" : "hover-lift interactive"}
          style={{
            width: "100%",
            padding: `${spacing.md}px ${spacing.lg}px`,
            borderRadius: radius.md,
            background: "rgba(20, 30, 45, 0.85)",
            border: "2px solid rgba(0, 206, 209, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.md,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
            color: "#E8ECEF",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            opacity: loading ? 0.6 : 1,
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
          className={loading ? "" : "hover-lift interactive"}
          style={{
            width: "100%",
            padding: `${spacing.md}px ${spacing.lg}px`,
            borderRadius: radius.md,
            background: "#000000",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.md,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
            color: "#FFFFFF",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            opacity: loading ? 0.6 : 1,
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
            <path d="M16.93 11.73c-.03 3.29 2.91 4.38 2.94 4.39-.02.08-.46 1.58-1.52 3.13-.91 1.34-1.86 2.68-3.36 2.71-1.47.03-1.95-.87-3.63-.87s-2.22.84-3.62.9c-1.45.05-2.55-1.46-3.47-2.79-1.89-2.73-3.33-7.71-1.39-11.08.96-1.68 2.68-2.74 4.55-2.77 1.42-.03 2.76.95 3.63.95.87 0 2.5-1.18 4.22-1 .72.03 2.73.29 4.02 2.18-.1.06-2.4 1.4-2.37 4.19M13.36 3.43c.76-.92 1.27-2.19 1.13-3.46-1.09.04-2.41.73-3.19 1.64-.7.81-1.31 2.1-1.15 3.34 1.22.09 2.46-.62 3.21-1.52" />
          </svg>
          {loading === "apple" ? "Signing in…" : "Continue with Apple"}
        </button>

        {error && (
          <div
            className="spring-slide-up"
            style={{
              padding: `${spacing.md}px ${spacing.md}px`,
              background: "rgba(255, 107, 107, 0.1)",
              border: "2px solid rgba(255, 107, 107, 0.3)",
              borderRadius: radius.md,
              color: "#FF6B6B",
              fontSize: "14px",
              fontWeight: "600",
              textAlign: "center",
              animation: "spring-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {error}
          </div>
        )}
          </div>
        </CardContent>
      </Card>

      <p
        style={{
          marginTop: spacing.xl,
          fontSize: "13px",
          color: "rgba(232, 236, 239, 0.5)",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>

      <button
        type="button"
        onClick={handleGuest}
        className="interactive"
        style={{
          marginTop: spacing.md,
          padding: spacing.md,
          background: "transparent",
          border: "none",
          color: "rgba(232, 236, 239, 0.5)",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          textDecoration: "underline",
          transition: "all 0.2s",
        }}
      >
        Continue as guest
      </button>
    </div>
  );
}
