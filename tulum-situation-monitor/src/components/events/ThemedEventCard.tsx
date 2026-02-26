"use client";

import type { LocalEvent } from "@/hooks/useLocalEvents";

type CardStyle =
  | "jungle-night"
  | "sunrise-beach"
  | "cenote-night"
  | "tropical-day"
  | "full-moon";

interface ThemeConfig {
  label: string;
  labelEmoji: string;
  bg: string;
  headerBg: string;
  labelBg: string;
  labelColor: string;
  titleColor: string;
  venueColor: string;
  timeColor: string;
  descColor: string;
  divider: string;
  deco: string[];
  decoPositions: Array<{
    top: string;
    left?: string;
    right?: string;
    fontSize: string;
    opacity: number;
    rotate?: string;
  }>;
  glowColor: string;
  thumbnailGradient: string;
  thumbnailEmoji: string;
}

const THEMES: Record<CardStyle, ThemeConfig> = {
  "jungle-night": {
    label: "Night Plans",
    labelEmoji: "🌙",
    bg: "linear-gradient(160deg, #0a1f1a 0%, #0f3028 30%, #1a2a1a 60%, #0d1f2d 100%)",
    headerBg: "rgba(0,0,0,0.35)",
    labelBg: "rgba(255,215,80,0.18)",
    labelColor: "#FFD750",
    titleColor: "#AAFFD0",
    venueColor: "#FFD750",
    timeColor: "#7FFFB0",
    descColor: "rgba(200,255,220,0.75)",
    divider: "rgba(127,255,176,0.15)",
    deco: ["🌿", "✨", "🦋", "🌙", "🍃", "⭐"],
    decoPositions: [
      { top: "8%", right: "6%", fontSize: "52px", opacity: 0.25, rotate: "20deg" },
      { top: "20%", left: "3%", fontSize: "28px", opacity: 0.18 },
      { top: "55%", right: "4%", fontSize: "36px", opacity: 0.15, rotate: "-15deg" },
      { top: "72%", left: "5%", fontSize: "22px", opacity: 0.2 },
      { top: "88%", right: "8%", fontSize: "24px", opacity: 0.12, rotate: "30deg" },
      { top: "40%", left: "2%", fontSize: "18px", opacity: 0.3 },
    ],
    glowColor: "rgba(127,255,176,0.12)",
    thumbnailGradient: "linear-gradient(135deg, #0a1f1a 0%, #0f3028 100%)",
    thumbnailEmoji: "💃🏻",
  },
  "sunrise-beach": {
    label: "Day Plans",
    labelEmoji: "☀️",
    bg: "linear-gradient(160deg, #1a3a4a 0%, #1f5060 25%, #c06830 60%, #e8952a 85%, #f5c842 100%)",
    headerBg: "rgba(0,0,0,0.28)",
    labelBg: "rgba(255,200,60,0.2)",
    labelColor: "#FFDD66",
    titleColor: "#FFF0C0",
    venueColor: "#FFD066",
    timeColor: "#80FFEE",
    descColor: "rgba(255,240,200,0.75)",
    divider: "rgba(255,215,100,0.2)",
    deco: ["🌴", "🌅", "🐚", "🌸", "🦜", "🌿"],
    decoPositions: [
      { top: "5%", right: "5%", fontSize: "58px", opacity: 0.22, rotate: "10deg" },
      { top: "15%", left: "2%", fontSize: "30px", opacity: 0.18, rotate: "-8deg" },
      { top: "50%", right: "3%", fontSize: "28px", opacity: 0.15 },
      { top: "70%", left: "4%", fontSize: "24px", opacity: 0.2, rotate: "15deg" },
      { top: "85%", right: "10%", fontSize: "22px", opacity: 0.15 },
      { top: "35%", left: "1%", fontSize: "20px", opacity: 0.25, rotate: "-20deg" },
    ],
    glowColor: "rgba(245,200,66,0.22)",
    thumbnailGradient: "linear-gradient(160deg, #1a3a4a 0%, #1f5060 30%, #c06830 70%, #f5c842 100%)",
    thumbnailEmoji: "🌴",
  },
  "cenote-night": {
    label: "Night Plans",
    labelEmoji: "🌊",
    bg: "linear-gradient(160deg, #020a18 0%, #051428 30%, #062040 55%, #0a3858 75%, #041830 100%)",
    headerBg: "rgba(0,20,50,0.5)",
    labelBg: "rgba(0,200,220,0.15)",
    labelColor: "#00E5FF",
    titleColor: "#B0EEFF",
    venueColor: "#00DDEE",
    timeColor: "#80FFFF",
    descColor: "rgba(160,230,255,0.72)",
    divider: "rgba(0,200,220,0.18)",
    deco: ["💧", "⭐", "🌊", "✨", "🐠", "🌙"],
    decoPositions: [
      { top: "6%", right: "6%", fontSize: "54px", opacity: 0.2 },
      { top: "18%", left: "3%", fontSize: "26px", opacity: 0.22 },
      { top: "45%", right: "4%", fontSize: "32px", opacity: 0.16 },
      { top: "65%", left: "3%", fontSize: "20px", opacity: 0.2, rotate: "20deg" },
      { top: "82%", right: "7%", fontSize: "22px", opacity: 0.14 },
      { top: "30%", left: "2%", fontSize: "16px", opacity: 0.28 },
    ],
    glowColor: "rgba(0,200,220,0.12)",
    thumbnailGradient: "linear-gradient(135deg, #051428 0%, #0a3858 100%)",
    thumbnailEmoji: "🌊",
  },
  "tropical-day": {
    label: "Day Plans",
    labelEmoji: "🌺",
    bg: "linear-gradient(160deg, #0a3028 0%, #0e5038 30%, #126040 55%, #1a7050 70%, #0a4030 100%)",
    headerBg: "rgba(0,30,20,0.35)",
    labelBg: "rgba(255,100,150,0.18)",
    labelColor: "#FF8EC0",
    titleColor: "#C8FFD4",
    venueColor: "#FF8EC0",
    timeColor: "#60FFB0",
    descColor: "rgba(200,255,215,0.75)",
    divider: "rgba(255,100,150,0.18)",
    deco: ["🌺", "🌴", "🦜", "🌿", "🌸", "🍃"],
    decoPositions: [
      { top: "6%", right: "5%", fontSize: "56px", opacity: 0.25, rotate: "15deg" },
      { top: "20%", left: "2%", fontSize: "28px", opacity: 0.2, rotate: "-10deg" },
      { top: "48%", right: "3%", fontSize: "34px", opacity: 0.18 },
      { top: "68%", left: "4%", fontSize: "22px", opacity: 0.22, rotate: "25deg" },
      { top: "86%", right: "8%", fontSize: "20px", opacity: 0.15 },
      { top: "36%", left: "1%", fontSize: "18px", opacity: 0.3, rotate: "-30deg" },
    ],
    glowColor: "rgba(255,100,150,0.15)",
    thumbnailGradient: "linear-gradient(135deg, #0e5038 0%, #1a7050 100%)",
    thumbnailEmoji: "🏖️",
  },
  "full-moon": {
    label: "Full Moon",
    labelEmoji: "🌕",
    bg: "linear-gradient(160deg, #050a20 0%, #0a1535 25%, #14224a 50%, #1a1a3a 75%, #080f28 100%)",
    headerBg: "rgba(0,0,20,0.45)",
    labelBg: "rgba(220,200,100,0.15)",
    labelColor: "#F0D860",
    titleColor: "#E8E0FF",
    venueColor: "#F0D860",
    timeColor: "#C0C8FF",
    descColor: "rgba(220,218,255,0.72)",
    divider: "rgba(220,200,100,0.18)",
    deco: ["🌕", "🌊", "⭐", "🌿", "🌸", "✨"],
    decoPositions: [
      { top: "4%", right: "4%", fontSize: "64px", opacity: 0.28 },
      { top: "22%", left: "2%", fontSize: "24px", opacity: 0.18 },
      { top: "42%", right: "5%", fontSize: "30px", opacity: 0.14 },
      { top: "65%", left: "4%", fontSize: "20px", opacity: 0.2, rotate: "18deg" },
      { top: "84%", right: "9%", fontSize: "22px", opacity: 0.14 },
      { top: "55%", left: "1%", fontSize: "16px", opacity: 0.3 },
    ],
    glowColor: "rgba(240,216,96,0.2)",
    thumbnailGradient: "linear-gradient(135deg, #0a1535 0%, #14224a 100%)",
    thumbnailEmoji: "⛱️",
  },
};

function formatCardDate(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  return {
    weekday: days[d.getUTCDay()],
    date: String(d.getUTCDate()),
    month: months[d.getUTCMonth()],
  };
}

/** Returns gradient + emoji for the compact list thumbnail in EnhancedSidebar */
export function getThemeThumbnail(cardStyle: string): { gradient: string; emoji: string } {
  const theme = THEMES[cardStyle as CardStyle];
  if (!theme) return { gradient: "linear-gradient(135deg, #E0F7F7 0%, #F0FAFA 100%)", emoji: "🌴" };
  return { gradient: theme.thumbnailGradient, emoji: theme.thumbnailEmoji };
}

export function ThemedEventCard({ event }: { event: LocalEvent }) {
  const cardStyle = event.metadata?.card_style as CardStyle | undefined;
  const theme = cardStyle ? THEMES[cardStyle] : null;
  if (!theme) return null;

  const venues = (event.metadata?.venues ?? []) as Array<{ name: string; time: string; desc: string }>;
  const { weekday, date, month } = formatCardDate(event.created_at);

  return (
    <div
      style={{
        width: "100%",
        borderRadius: "20px",
        overflow: "hidden",
        position: "relative",
        background: theme.bg,
        boxShadow: "0 16px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
        fontFamily: "'Georgia', 'Palatino', serif",
      }}
    >
      {/* Decorative background emojis */}
      {theme.deco.map((emoji, i) => {
        const pos = theme.decoPositions[i];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              right: pos.right,
              fontSize: pos.fontSize,
              opacity: pos.opacity,
              transform: pos.rotate ? `rotate(${pos.rotate})` : undefined,
              pointerEvents: "none",
              userSelect: "none",
              lineHeight: 1,
            }}
          >
            {emoji}
          </div>
        );
      })}

      {/* Glow orb */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          background: theme.headerBg,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          padding: "18px 18px 14px",
          borderBottom: `1px solid ${theme.divider}`,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Label pill */}
        <div style={{ marginBottom: "10px" }}>
          <span
            style={{
              background: theme.labelBg,
              color: theme.labelColor,
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "20px",
              border: `1px solid ${theme.labelColor}40`,
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
            }}
          >
            {theme.labelEmoji} {theme.label}
          </span>
        </div>

        {/* Date */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 900,
              color: theme.titleColor,
              lineHeight: 1,
              letterSpacing: "-2px",
              fontFamily: "'Georgia', serif",
            }}
          >
            {date}
          </span>
          <div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: theme.venueColor,
                lineHeight: 1,
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              {month}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: theme.timeColor,
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                letterSpacing: "3px",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {weekday}
            </div>
          </div>
        </div>

        {/* Subtitle (event.content) */}
        <div
          style={{
            fontSize: "16px",
            color: theme.titleColor,
            fontStyle: "italic",
            marginTop: "5px",
            letterSpacing: "0.3px",
            opacity: 0.9,
          }}
        >
          {event.content}
        </div>
      </div>

      {/* Venues list */}
      <div style={{ padding: "12px 18px 36px", position: "relative", zIndex: 1 }}>
        {venues.map((item, i) => (
          <div
            key={i}
            style={{
              paddingBottom: i < venues.length - 1 ? "10px" : 0,
              marginBottom: i < venues.length - 1 ? "10px" : 0,
              borderBottom: i < venues.length - 1 ? `1px solid ${theme.divider}` : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: theme.venueColor,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: "0.3px",
                }}
              >
                {item.name}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: theme.timeColor,
                  fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  flexShrink: 0,
                  marginLeft: "8px",
                }}
              >
                {item.time}
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: theme.descColor,
                lineHeight: 1.4,
                fontFamily: "'Georgia', serif",
                fontStyle: "italic",
              }}
            >
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "14px",
          fontSize: "9px",
          color: "rgba(255,255,255,0.22)",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        tulum · 2026
      </div>
    </div>
  );
}
