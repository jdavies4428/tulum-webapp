"use client";

import Link from "next/link";
import { useAuthOptional } from "@/contexts/AuthContext";
import { SignInButton } from "@/components/auth/SignInButton";
import { SignedInMenu } from "@/components/auth/SignedInMenu";
import type { Lang } from "@/lib/weather";

interface MapTopBarProps {
  lang: Lang;
}

export function MapTopBar({ lang }: MapTopBarProps) {
  const auth = useAuthOptional();

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "12px 16px",
        background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10001,
      }}
    >
      {/* Left: Back button */}
      <Link
        href="/"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          textDecoration: "none",
          color: "#333",
        }}
        aria-label="Back to Discover Tulum"
      >
        ←
      </Link>

      {/* Right: User avatar or sign-in */}
      {auth?.isAuthenticated && auth.user ? (
        <SignedInMenu user={auth.user} lang={lang} />
      ) : (
        <SignInButton
          lang={lang}
          variant="frosted"
        />
      )}
    </div>
  );
}
