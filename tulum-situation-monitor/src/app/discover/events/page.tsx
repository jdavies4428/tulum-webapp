"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { translations } from "@/lib/i18n";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { useLocalEvents, type LocalEvent } from "@/hooks/useLocalEvents";
import { useAuthOptional } from "@/contexts/AuthContext";
import { CreateEventModal } from "@/components/events/CreateEventModal";
import { EditEventModal } from "@/components/events/EditEventModal";
import { ConfirmDialog } from "@/components/events/ConfirmDialog";
import { formatChatTimestamp } from "@/lib/chat-helpers";

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang] as Record<string, string>;
  const { events, loading, deleteEvent, updateEvent } = useLocalEvents();
  const auth = useAuthOptional();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LocalEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Admin check (same pattern as PlacesModal.tsx line 592-593)
  const isAdmin =
    auth?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    auth?.user?.user_metadata?.role === "admin";

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast.success("Event deleted successfully");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #E0F7FA 0%, #FFF8E7 50%, #FFFFFF 100%)",
        color: "var(--text-primary)",
        paddingTop: "max(24px, env(safe-area-inset-top))",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(255, 248, 231, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0, 206, 209, 0.2)",
          padding: "16px 20px",
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
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(0, 206, 209, 0.12)",
            border: "2px solid rgba(0, 206, 209, 0.2)",
            color: "var(--tulum-ocean)",
            fontSize: "18px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "800",
            margin: 0,
            color: "var(--tulum-ocean)",
            flex: 1,
          }}
        >
          📅 {t.localEvents ?? "Local Events"}
        </h1>

        {/* Admin Create Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
              border: "none",
              borderRadius: "20px",
              color: "#FFF",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 206, 209, 0.3)",
            }}
          >
            <span style={{ fontSize: "16px" }}>✍️</span>
            Post
          </button>
        )}
      </header>

      {/* Feed */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#999" }}
          >
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#999" }}
          >
            No events yet. {isAdmin && "Be the first to post!"}
          </div>
        ) : (
          events.map((event) => (
            <article
              key={event.id}
              style={{
                padding: "16px",
                borderBottom: "1px solid rgba(0, 206, 209, 0.15)",
                display: "flex",
                gap: "12px",
                transition: "background 0.2s",
                position: "relative",
              }}
              onClick={(e) => {
                // Close menu if clicking outside menu area
                const target = e.target as HTMLElement;
                if (!target.closest("button")) {
                  setMenuOpen(null);
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: event.author_avatar?.startsWith("http")
                    ? "#FFF"
                    : "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
                  border: "2px solid rgba(0, 206, 209, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {event.author_avatar?.startsWith("http") ? (
                  <img
                    src={event.author_avatar}
                    alt={event.author_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  event.author_avatar
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "15px",
                      color: "#333",
                    }}
                  >
                    {event.author_name}
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {event.author_handle}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#999",
                    }}
                  >
                    ·{" "}
                    {formatChatTimestamp(
                      new Date(event.created_at).getTime()
                    )}
                  </span>

                  {/* Three-dot menu for event author */}
                  {isAdmin && auth?.user?.id === event.author_id && (
                    <div style={{ marginLeft: "auto", position: "relative" }}>
                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpen(menuOpen === event.id ? null : event.id)
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                          fontSize: "16px",
                          color: "#999",
                          borderRadius: "4px",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(0, 206, 209, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        ⋯
                      </button>

                      {/* Dropdown menu */}
                      {menuOpen === event.id && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            background: "#FFF",
                            borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                            border: "1px solid rgba(0, 206, 209, 0.2)",
                            minWidth: "150px",
                            zIndex: 100,
                            overflow: "hidden",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEvent(event);
                              setMenuOpen(null);
                            }}
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              background: "transparent",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#333",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(0, 206, 209, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirm(event.id);
                              setMenuOpen(null);
                            }}
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              background: "transparent",
                              border: "none",
                              borderTop: "1px solid rgba(0, 0, 0, 0.05)",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#FF6B6B",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(255, 107, 107, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#333",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {event.content}
                </p>
                {event.image_url && (
                  <div
                    style={{
                      marginTop: "12px",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid rgba(0, 206, 209, 0.2)",
                    }}
                  >
                    <img
                      src={event.image_url}
                      alt="Event"
                      style={{
                        width: "100%",
                        maxHeight: "500px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    marginTop: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#999",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    💬 {event.metadata?.replies_count ?? 0}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#999",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    ♥️ {event.metadata?.likes_count ?? 0}
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

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
