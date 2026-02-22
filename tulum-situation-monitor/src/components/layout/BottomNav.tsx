"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { spacing, radius } from "@/lib/design-tokens";

interface BottomNavProps {
  lang: Lang;
  unreadMessages?: number;
}

type NavItem = {
  id: string;
  labelKey: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", labelKey: "navHome", href: "/" },
  { id: "discover", labelKey: "discover", href: "/discover" },
  { id: "map", labelKey: "map", href: "/map" },
  { id: "messages", labelKey: "messages", href: "/messages" },
  { id: "saved", labelKey: "navSaved", href: "/favorites" },
];

function NavIcon({ id, color }: { id: string; color: string }) {
  const props = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (id) {
    case "home":
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "discover":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="none" />
        </svg>
      );
    case "map":
      return (
        <svg {...props}>
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      );
    case "messages":
      return (
        <svg {...props}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "saved":
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    default:
      return null;
  }
}

function NavButton({
  id,
  label,
  active,
  href,
  badge,
}: {
  id: string;
  label: string;
  active: boolean;
  href: string;
  badge?: number;
}) {
  const handleClick = () => {
    // Haptic feedback on mobile
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={active ? "" : "interactive hover-scale"}
      style={{
        flex: 1,
        maxWidth: 80,
        minHeight: 48,
        padding: spacing.sm,
        background: active ? "linear-gradient(135deg, rgba(0, 206, 209, 0.15) 0%, rgba(0, 206, 209, 0.05) 100%)" : "transparent",
        border: active ? "1px solid rgba(0, 206, 209, 0.2)" : "1px solid transparent",
        borderRadius: radius.md,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: spacing.xs,
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        textDecoration: "none",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          opacity: active ? 1 : 0.6,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: active ? "scale(1.1)" : "scale(1)",
        }}
      >
        <NavIcon id={id} color={active ? "#00CED1" : "#7C8490"} />
        {/* Unread badge */}
        {badge !== undefined && badge > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -8,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: "#FF3B30",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              boxShadow: "0 2px 6px rgba(255, 59, 48, 0.4)",
              animation: "badgePulse 2s ease-in-out infinite",
            }}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: active ? "#00CED1" : "#7C8490",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          textTransform: "uppercase",
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </div>
      {active && (
        <div
          className="shadow-glow"
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: 2,
            background: "#00CED1",
            borderRadius: "2px 2px 0 0",
            boxShadow: "0 0 8px rgba(0, 206, 209, 0.5)",
          }}
        />
      )}

      <style>{`
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </Link>
  );
}

export function BottomNav({ lang, fixed = false, unreadMessages = 0 }: BottomNavProps & { fixed?: boolean }) {
  const pathname = usePathname();
  const t = translations[lang] as Record<string, string>;

  return (
    <div
      className="glass-heavy"
      style={{
        position: fixed ? "fixed" : "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: "rgba(15, 20, 25, 0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "2px solid rgba(0, 206, 209, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: `0 ${spacing.sm}px`,
        paddingBottom: "env(safe-area-inset-bottom, 0)",
        zIndex: 10001,
        boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.4)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isMap = item.href === "/map";
        const isHome = item.href === "/";
        const active = isMap ? pathname === "/map" : isHome ? pathname === "/" : pathname.startsWith(item.href);
        const displayLabel = (t as Record<string, string>)[item.labelKey] ?? (item.labelKey === "navHome" ? "Home" : item.labelKey === "navSaved" ? "Saved" : item.id);
        const badge = item.id === "messages" ? unreadMessages : undefined;
        return (
          <NavButton
            key={item.id}
            id={item.id}
            label={displayLabel}
            active={active}
            href={item.href}
            badge={badge}
          />
        );
      })}
    </div>
  );
}
