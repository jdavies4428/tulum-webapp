"use client";

import Link from "next/link";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import type { Lang } from "@/lib/weather";
import { spacing, radius } from "@/lib/design-tokens";

interface MapTopBarProps {
  lang: Lang;
}

export function MapTopBar({ lang }: MapTopBarProps) {
  const auth = useAuthOptional();

  return (
    <div
      className="spring-slide-up"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: `${spacing.md}px ${spacing.lg}px`,
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10001,
        animation: "spring-slide-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Left: Back button */}
      <Link
        href="/"
        className="hover-lift interactive"
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
          textDecoration: "none",
          color: "#222222",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        aria-label="Back to Discover Tulum"
      >
        ←
      </Link>

      {/* Right: User avatar or sign-in */}
      {auth?.isAuthenticated && auth.user ? (
        <SignedInMenu user={auth.user} lang={lang} />
      ) : (
        <SignInButton lang={lang} />
      )}
    </div>
  );
}
