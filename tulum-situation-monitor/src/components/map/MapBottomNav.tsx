"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { translations } from "@/lib/i18n";
import type { Lang } from "@/lib/weather";

interface MapBottomNavProps {
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
      style={{
        flex: 1,
        maxWidth: 80,
        padding: 8,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        transition: "all 0.2s",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          fontSize: 24,
          filter: active ? "none" : "grayscale(100%)",
          opacity: active ? 1 : 0.5,
          transition: "all 0.2s",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: active ? "#00CED1" : "#999",
          transition: "all 0.2s",
        }}
      >
        {label}
      </div>
    </Link>
  );
}

export function MapBottomNav({ lang }: MapBottomNavProps) {
  const pathname = usePathname();
  const t = translations[lang] as Record<string, string>;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        background: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(20px)",
        borderTop: "2px solid rgba(0, 206, 209, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 8px",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
        zIndex: 10001,
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
