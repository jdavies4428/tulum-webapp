"use client";

import Link from "next/link";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import type { Lang } from "@/lib/weather";
import { spacing, radius, shadows } from "@/lib/design-tokens";

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
        background: "linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
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
        className="glass hover-lift interactive"
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          background: "rgba(20, 30, 45, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(232, 236, 239, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          cursor: "pointer",
          boxShadow: shadows.lg,
          textDecoration: "none",
          color: "#E8ECEF",
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
        <SignInButton lang={lang} variant="frosted" />
      )}
    </div>
  );
}
