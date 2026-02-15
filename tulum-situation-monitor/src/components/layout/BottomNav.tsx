"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";
import { spacing, radius, shadows } from "@/lib/design-tokens";

interface BottomNavProps {
  lang: Lang;
}

type NavItem = {
  id: string;
  icon: string;
  labelKey: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", icon: "🏠", labelKey: "navHome", href: "/" },
  { id: "discover", icon: "✨", labelKey: "discover", href: "/discover" },
  { id: "map", icon: "🗺️", labelKey: "map", href: "/map" },
  { id: "messages", icon: "💬", labelKey: "messages", href: "/messages" },
  { id: "saved", icon: "⭐", labelKey: "navSaved", href: "/favorites" },
];

function NavButton({
  icon,
  label,
  active,
  href,
}: {
  icon: string;
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={active ? "" : "interactive hover-scale"}
      style={{
        flex: 1,
        maxWidth: 80,
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
          fontSize: "24px",
          filter: active ? "none" : "grayscale(80%)",
          opacity: active ? 1 : 0.6,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: active ? "scale(1.1)" : "scale(1)",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: active ? "#00CED1" : "#666",
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
    </Link>
  );
}

export function BottomNav({ lang, fixed = false }: BottomNavProps & { fixed?: boolean }) {
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
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "2px solid rgba(0, 206, 209, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: `0 ${spacing.sm}px`,
        paddingBottom: "env(safe-area-inset-bottom, 0)",
        zIndex: 10001,
        boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.08)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isMap = item.href === "/map";
        const isHome = item.href === "/";
        const active = isMap ? pathname === "/map" : isHome ? pathname === "/" : pathname.startsWith(item.href);
        const displayLabel = (t as Record<string, string>)[item.labelKey] ?? (item.labelKey === "navHome" ? "Home" : item.labelKey === "navSaved" ? "Saved" : item.id);
        return (
          <NavButton
            key={item.id}
            icon={item.icon}
            label={displayLabel}
            active={active}
            href={item.href}
          />
        );
      })}
    </div>
  );
}
