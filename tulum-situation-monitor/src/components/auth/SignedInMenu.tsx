"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import type { User } from "@supabase/supabase-js";

interface SignedInMenuProps {
  user: User;
  lang?: Lang;
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "12px 20px",
        background: "transparent",
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: 600,
        color: danger ? "#FF6B6B" : "#333",
        textAlign: "left",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "rgba(255, 107, 107, 0.1)"
          : "rgba(0, 206, 209, 0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function SignedInMenu({ user, lang = "en" }: SignedInMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { signOut } = useAuth();
  const t = translations[lang] as Record<string, string>;

  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ?? null;
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleToggle = () => {
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 320;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const showBelow = spaceBelow >= menuHeight || spaceBelow >= spaceAbove;
      const menuWidth = 280;
      let left = rect.left;
      if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
      if (left < 8) left = 8;
      setMenuPosition({
        top: showBelow ? rect.bottom + 8 : Math.max(8, rect.top - menuHeight - 8),
        left,
      });
    }
    setShowMenu(!showMenu);
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "3px solid #00CED1",
          padding: 0,
          cursor: "pointer",
          overflow: "hidden",
          background: "#FFF",
          boxShadow: "0 4px 12px rgba(0, 206, 209, 0.3)",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
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
              background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 700,
              color: "#FFF",
            }}
          >
            {displayName[0]?.toUpperCase() ?? "👤"}
          </div>
        )}
      </button>

      {showMenu && (
        <>
          <div
            onClick={() => setShowMenu(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 998,
            }}
            aria-hidden
          />
          <div
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: "280px",
              maxHeight: "calc(100vh - 24px)",
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
              border: "2px solid rgba(0, 206, 209, 0.2)",
              zIndex: 999,
              overflow: "auto",
            }}
          >
            <div
              style={{
                padding: "20px",
                background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
                borderBottom: "2px solid rgba(0, 206, 209, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#333",
                  marginBottom: "4px",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                {user.email}
              </div>
            </div>

            <div style={{ padding: "8px 0" }}>
              <MenuItem
                icon="👤"
                label={t.myProfile ?? "My Profile"}
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/users/${user.id}?lang=${lang}`);
                }}
              />
              <MenuItem
                icon="⭐"
                label={t.savedPlaces ?? "Saved Places"}
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/favorites?lang=${lang}`);
                }}
              />
              <MenuItem
                icon="📋"
                label={t.myLists ?? "My Lists"}
                onClick={() => {
                  setShowMenu(false);
                  router.push(`/favorites?lang=${lang}`);
                }}
              />
              <MenuItem
                icon="🎯"
                label={t.myItineraries ?? "My Itineraries"}
                onClick={() => setShowMenu(false)}
              />
              <div
                style={{
                  height: "1px",
                  background: "rgba(0, 0, 0, 0.1)",
                  margin: "8px 0",
                }}
              />
              <MenuItem
                icon="🚪"
                label={t.signOut ?? "Sign Out"}
                onClick={() => {
                  setShowMenu(false);
                  signOut();
                }}
                danger
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
