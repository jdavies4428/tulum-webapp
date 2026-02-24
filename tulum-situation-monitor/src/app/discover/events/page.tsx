"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { useLocalEvents, type LocalEvent } from "@/hooks/useLocalEvents";
import { useAuthOptional } from "@/contexts/AuthContext";
import { isAdmin as checkIsAdmin } from "@/lib/auth-helpers";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { EditEventModal } from "@/components/events/EditEventModal";
import { ConfirmDialog } from "@/components/events/ConfirmDialog";
import { BottomNav } from "@/components/layout/BottomNav";
import { formatChatTimestamp } from "@/lib/chat-helpers";

const SAMPLE_EVENTS: LocalEvent[] = [
  {
    id: "sample-1",
    author_id: "sample",
    author_name: "Arena & Ikal",
    author_handle: "@arenatulum",
    author_avatar: "\u{1F9D8}",
    content: "Morning Yoga & Wellness \u2014 Path to Nirvana 9am, Kundalini Yoga 10:30am at Arena. Hatha Yoga 8:30am & Yoga Flow 10:30am at Ikal. Start your day aligned.",
    image_url: "https://cdn.prod.website-files.com/649b2bff2df9b454e452d2fd/68ddd65863a64c05b47b5fab_0T9A6219.webp",
    metadata: { likes_count: 24, replies_count: 3 },
    created_at: "2026-02-18T08:30:00Z",
    updated_at: "2026-02-18T08:30:00Z",
  },
  {
    id: "sample-2",
    author_id: "sample",
    author_name: "Ikal Tulum",
    author_handle: "@ikaltulum",
    author_avatar: "\u{1F64F}",
    content: "LOSAR \u2014 Celebra el Tibetan New Year. Cantando mantras x Ani Zofia 3:30pm. A sacred ceremony of meditation, mantras & community. All are welcome.",
    image_url: "https://photos.hotelbeds.com/giata/original/81/810579/810579a_hb_w_052.jpg",
    metadata: { likes_count: 41, replies_count: 7 },
    created_at: "2026-02-18T15:30:00Z",
    updated_at: "2026-02-18T15:30:00Z",
  },
  {
    id: "sample-3",
    author_id: "sample",
    author_name: "Panamera Tulum",
    author_handle: "@panameratulum",
    author_avatar: "\u{1F305}",
    content: "Sunset & Tarot on the Rooftop \u2014 Sunset & tarot 6pm. Movie night: Match Point 7pm. Golden hour vibes at Panamera rooftop.",
    image_url: "https://images.squarespace-cdn.com/content/v1/66e9f9f5a2ee6441631be8b4/6fae467c-5f02-4ae6-b0ab-b7936717ebda/rooftop.png?format=1500w",
    metadata: { likes_count: 56, replies_count: 12 },
    created_at: "2026-02-18T18:00:00Z",
    updated_at: "2026-02-18T18:00:00Z",
  },
  {
    id: "sample-4",
    author_id: "sample",
    author_name: "Tulum Live",
    author_handle: "@tulumnights",
    author_avatar: "\u{1F3B6}",
    content: "Live Music Night \u2014 Vagalume: Rythmia X Los Cabra 7pm. Ziggy Beach: Sax & Jazz 7:15pm. Veleta Market: Blues 8pm. Ciao Belli: Tango y pasta 8pm.",
    image_url: "https://vagalume-tulum.mx/assets/img/3.jpg",
    metadata: { likes_count: 89, replies_count: 15 },
    created_at: "2026-02-18T19:00:00Z",
    updated_at: "2026-02-18T19:00:00Z",
  },
  {
    id: "sample-5",
    author_id: "sample",
    author_name: "Nomade Tulum",
    author_handle: "@nomadetulum",
    author_avatar: "\u{1F52E}",
    content: "Breathwork & Sound Journey \u2014 Biodinamic breathwork 11:30am & sound journey 6pm at Nomade. La magia del tarot workshop 5pm at Crudo. Heal, breathe, transform.",
    image_url: "https://i2.wp.com/bellaworldtravels.com/wp-content/uploads/2021/01/DSC3350.jpg?ssl=1",
    metadata: { likes_count: 37, replies_count: 5 },
    created_at: "2026-02-19T11:30:00Z",
    updated_at: "2026-02-19T11:30:00Z",
  },
  {
    id: "sample-6",
    author_id: "sample",
    author_name: "Mamazul",
    author_handle: "@mamazultulum",
    author_avatar: "\u{1F3B5}",
    content: "Musica en Vivo & Mezcal \u2014 Live music at Mamazul 8pm. Mezcal, good vibes, and the best live sounds in Tulum. Come as you are.",
    image_url: "https://mezcaleriamamazul.com/wp-content/uploads/2025/03/mezcaleria.jpg",
    metadata: { likes_count: 63, replies_count: 9 },
    created_at: "2026-02-19T20:00:00Z",
    updated_at: "2026-02-19T20:00:00Z",
  },
];

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function EventCard({
  event,
  isAdmin,
  isAuthor,
  onEdit,
  onDelete,
}: {
  event: LocalEvent;
  isAdmin: boolean;
  isAuthor: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasImage = !!event.image_url;

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        minHeight: hasImage ? "220px" : "140px",
        background: hasImage
          ? "transparent"
          : "linear-gradient(135deg, rgba(0, 206, 209, 0.08) 0%, rgba(20, 30, 45, 0.9) 100%)",
        border: "1px solid rgba(0, 206, 209, 0.12)",
      }}
    >
      {/* Background image */}
      {hasImage && (
        <img
          src={event.image_url!}
          alt="Event"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}

      {/* Dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hasImage
            ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)"
            : "none",
        }}
      />

      {/* Admin menu */}
      {isAdmin && isAuthor && (
        <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 2 }}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              padding: "4px 10px",
              cursor: "pointer",
              color: "#E8ECEF",
              fontSize: "16px",
              backdropFilter: "blur(8px)",
            }}
          >
            ⋯
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "4px",
                background: "rgba(20, 30, 45, 0.95)",
                backdropFilter: "blur(16px)",
                borderRadius: "10px",
                border: "1px solid rgba(0, 206, 209, 0.2)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                minWidth: "140px",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => { onEdit(); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#E8ECEF",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                onClick={() => { onDelete(); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#FF6B6B",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Date / Timestamp badge */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          zIndex: 1,
          padding: "4px 10px",
          borderRadius: "6px",
          background: "rgba(0, 206, 209, 0.9)",
          fontSize: "10px",
          fontWeight: "700",
          color: "#FFF",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {event.id.startsWith("sample-")
          ? formatEventDate(event.created_at)
          : formatChatTimestamp(new Date(event.created_at).getTime())}
      </div>

      {/* Overlaid content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: hasImage ? "220px" : "140px",
          padding: "20px",
        }}
      >
        {/* Author */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: event.author_avatar?.startsWith("http")
                ? "transparent"
                : "linear-gradient(135deg, #1A2332 0%, #0F1419 100%)",
              border: "1.5px solid rgba(0, 206, 209, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {event.author_avatar?.startsWith("http") ? (
              <img
                src={event.author_avatar}
                alt={event.author_name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              event.author_avatar
            )}
          </div>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.7)" }}>
            {event.author_name}
          </span>
        </div>

        {/* Event content */}
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: "700",
            lineHeight: 1.3,
            color: "#FFFFFF",
            marginBottom: "14px",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.content}
        </p>

        {/* Actions row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => {
              if (event.image_url) window.open(event.image_url, "_blank");
            }}
            style={{
              padding: "7px 18px",
              borderRadius: "9999px",
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#FFFFFF",
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
            }}
          >
            Details
          </button>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: "4px" }}>
              💬 {event.metadata?.replies_count ?? 0}
            </span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: "4px" }}>
              ♥️ {event.metadata?.likes_count ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang] as Record<string, string>;
  const { events, loading, deleteEvent, updateEvent } = useLocalEvents();
  const auth = useAuthOptional();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAdmin = checkIsAdmin(auth?.user);

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast.success("Event deleted successfully");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete event");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0F1419",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <header
        style={{
          flexShrink: 0,
          background: "rgba(15, 20, 25, 0.95)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(0, 206, 209, 0.1)",
          padding: "16px 20px",
          paddingTop: "max(16px, env(safe-area-inset-top))",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(0, 206, 209, 0.08)",
            border: "1px solid rgba(0, 206, 209, 0.15)",
            color: "#9BA3AF",
            fontSize: "16px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "20px",
            fontWeight: "700",
            margin: 0,
            color: "#E8ECEF",
            flex: 1,
          }}
        >
          {t.localEvents ?? "Local Events"}
        </h1>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
              border: "none",
              borderRadius: "9999px",
              color: "#FFF",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 206, 209, 0.3)",
            }}
          >
            + Post
          </button>
        )}
      </header>

      {/* Event Feed */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "16px",
          paddingBottom: "96px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#7C8490" }}>
            Loading events...
          </div>
        ) : (
          <>
            {[...SAMPLE_EVENTS, ...events].map((event) => {
              const isSample = event.id.startsWith("sample-");
              return (
                <div key={event.id} style={{ position: "relative" }}>
                  {isSample && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "12px",
                        zIndex: 5,
                        background: "rgba(255, 193, 7, 0.2)",
                        color: "#FFC107",
                        fontSize: "9px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      SAMPLE
                    </span>
                  )}
                  <EventCard
                    event={event}
                    isAdmin={isAdmin}
                    isAuthor={!isSample && auth?.user?.id === event.author_id}
                    onEdit={() => { if (!isSample) setEditingEvent(event); }}
                    onDelete={() => { if (!isSample) setDeleteConfirm(event.id); }}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <BottomNav lang={lang} fixed />

      {/* Create Modal */}
      {isAdmin && createModalOpen && (
        <CreateEventModal onClose={() => setCreateModalOpen(false)} />
      )}

      {/* Edit Modal */}
      {isAdmin && editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onUpdate={updateEvent}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Event?"
          message="Are you sure you want to delete this event? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          danger
        />
      )}
    </div>
  );
}
