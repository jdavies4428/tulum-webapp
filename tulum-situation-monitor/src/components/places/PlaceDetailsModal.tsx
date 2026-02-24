"use client";

import { useState } from "react";
import { usePlaceDetails, getPlacePhotoUrl } from "@/hooks/usePlaceDetails";
import { translations } from "@/lib/i18n";
import { spacing, radius } from "@/lib/design-tokens";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lang } from "@/lib/weather";

interface PlaceDetailsModalProps {
  placeId: string | null;
  placeName: string;
  lang: Lang;
  onClose: () => void;
}

function ActionButton({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover-lift interactive"
      style={{
        padding: `${spacing.md}px`,
        borderRadius: radius.md,
        background: color,
        color: "white",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: `${spacing.xs}px`,
        textDecoration: "none",
        boxShadow: `0 4px 12px ${color}40`,
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span style={{ fontSize: "11px" }}>{label}</span>
    </a>
  );
}

export function PlaceDetailsModal({ placeId, placeName, lang, onClose }: PlaceDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "photos" | "reviews">("overview");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const { details, loading, error } = usePlaceDetails(placeId, lang);
  const t = translations[lang] as Record<string, string>;

  const loc = details?.geometry?.location;
  const isIOS =
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1));
  const mapsUrl =
    loc && (isIOS ? `https://maps.apple.com/?daddr=${loc.lat},${loc.lng}&q=${encodeURIComponent(placeName)}` : `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`);
  const phone = details?.formatted_phone_number ?? "";

  return (
    <>
      <div
        onClick={onClose}
        className="spring-slide-up"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 10998,
          animation: "fadeIn 0.3s ease-out",
        }}
        aria-hidden
      />

      <div
        className="spring-slide-up"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: radius.lg,
          border: "1px solid rgba(0, 206, 209, 0.2)",
          width: "90%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 206, 209, 0.3)",
          zIndex: 10999,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="glass hover-scale interactive"
          style={{
            position: "absolute",
            top: spacing.md,
            right: spacing.md,
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "2px solid rgba(255, 255, 255, 0.25)",
            color: "#FFFFFF",
            fontSize: "20px",
            cursor: "pointer",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
          }}
        >
          ✕
        </button>

        {loading ? (
          <div style={{ padding: "24px" }}>
            <div style={{ marginBottom: "16px" }}>
              <Skeleton height={200} />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <Skeleton variant="text" width="60%" height={32} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Skeleton variant="text" width="40%" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="85%" />
              <Skeleton variant="text" width="75%" />
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
              <Skeleton width={100} height={40} />
              <Skeleton width={100} height={40} />
              <Skeleton width={100} height={40} />
            </div>
          </div>
        ) : error ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--accent-red)" }}>
            {error}
          </div>
        ) : !details ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            No details available
          </div>
        ) : (
          <>
            {/* Header with cover photo */}
            <div
              style={{
                position: "relative",
                height: "200px",
                background: details.photos?.[0]
                  ? `url(${getPlacePhotoUrl(details.photos[0].photo_reference, 800)})`
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className="glass-heavy"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: spacing.lg,
                  border: "none",
                  borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <h2 style={{ color: "var(--tulum-ocean)", fontSize: "22px", fontWeight: 700, margin: `0 0 ${spacing.sm}px 0` }}>
                  {details.name ?? placeName}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.md, flexWrap: "wrap" }}>
                  {details.rating != null && (
                    <span style={{ color: "#333", fontWeight: 600 }}>
                      ★ {details.rating}
                      {details.user_ratings_total != null && (
                        <span style={{ color: "#666", fontSize: "13px", marginLeft: spacing.xs }}>
                          ({details.user_ratings_total})
                        </span>
                      )}
                    </span>
                  )}
                  {details.price_level != null && (
                    <span style={{ color: "#50C878", fontWeight: 600 }}>
                      {"$".repeat(Math.min(details.price_level, 4))}
                    </span>
                  )}
                  {details.opening_hours && (
                    <span
                      style={{
                        padding: `${spacing.xs}px ${spacing.sm}px`,
                        borderRadius: radius.sm,
                        background: details.opening_hours.open_now
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                        color: details.opening_hours.open_now ? "#10B981" : "#EF4444",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {details.opening_hours.open_now ? (t.openNow ?? "Open Now") : (t.closed ?? "Closed")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="glass"
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(0, 206, 209, 0.15)",
                padding: `0 ${spacing.lg}px`,
                border: "none",
              }}
            >
              {(["overview", "photos", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="interactive"
                  style={{
                    padding: `${spacing.md}px ${spacing.md}px`,
                    background: "transparent",
                    border: "none",
                    borderBottom: activeTab === tab ? "3px solid #00CED1" : "3px solid transparent",
                    color: activeTab === tab ? "var(--tulum-ocean)" : "#666",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  {tab === "overview" && (t.placeOverview ?? "Overview")}
                  {tab === "photos" && `${t.placePhotos ?? "Photos"}${details.photos ? ` (${details.photos.length})` : ""}`}
                  {tab === "reviews" && `${t.placeReviews ?? "Reviews"}${details.reviews ? ` (${details.reviews.length})` : ""}`}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: spacing.lg }}>
              {activeTab === "overview" && (
                <div className="spring-slide-up">
                  {details.formatted_address && (
                    <div style={{ marginBottom: spacing.md }}>
                      <div style={{ fontSize: "11px", color: "#666", marginBottom: spacing.xs, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                        {t.placeAddress ?? "Address"}
                      </div>
                      <div style={{ color: "#333", fontSize: "14px" }}>{details.formatted_address}</div>
                    </div>
                  )}
                  <div style={{ marginBottom: spacing.md }}>
                    <div style={{ fontSize: "11px", color: "#666", marginBottom: spacing.xs, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                      {t.placeContact ?? "Contact"}
                    </div>
                    {phone && <div style={{ color: "#333", fontSize: "14px", marginBottom: spacing.sm }}>📞 {phone}</div>}
                    {details.website && (
                      <a href={details.website} target="_blank" rel="noopener noreferrer" className="interactive" style={{ color: "var(--tulum-ocean)", fontSize: "14px", transition: "all 0.2s" }}>
                        🌐 {t.visitWebsite ?? "Visit Website"} →
                      </a>
                    )}
                  </div>
                  {details.opening_hours?.weekday_text && details.opening_hours.weekday_text.length > 0 && (
                    <div style={{ marginBottom: spacing.lg }}>
                      <div style={{ fontSize: "11px", color: "#666", marginBottom: spacing.xs, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                        {t.placeHours ?? "Hours"}
                      </div>
                      {details.opening_hours.weekday_text.map((day, i) => (
                        <div key={i} style={{ color: "#555", fontSize: "13px", marginBottom: spacing.xs }}>
                          {day}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: spacing.sm, marginTop: spacing.md }}>
                    {details.website && <ActionButton href={details.website} icon="🌐" label={t.website ?? "Website"} color="#00D4D4" />}
                    {phone && <ActionButton href={`tel:${phone.replace(/\D/g, "")}`} icon="📞" label="Call" color="#4A90E2" />}
                    {phone && (
                      <ActionButton
                        href={`https://wa.me/${phone.replace(/\D/g, "")}`}
                        icon="💬"
                        label="Chat"
                        color="#25D366"
                      />
                    )}
                    {mapsUrl && <ActionButton href={mapsUrl} icon="🗺️" label={t.navigate ?? "Go"} color="#FF9500" />}
                  </div>
                </div>
              )}

              {activeTab === "photos" && (
                <div className="spring-slide-up">
                  {!details.photos || details.photos.length === 0 ? (
                    <div style={{ color: "#666", textAlign: "center", padding: spacing.lg }}>
                      {t.noPhotos ?? "No photos available"}
                    </div>
                  ) : (
                    <>
                      <img
                        src={getPlacePhotoUrl(details.photos[selectedPhotoIndex].photo_reference, 800)}
                        alt={`Photo ${selectedPhotoIndex + 1} of ${details.name ?? "venue"}`}
                        className="hover-scale"
                        style={{
                          width: "100%",
                          height: "240px",
                          objectFit: "cover",
                          borderRadius: radius.md,
                          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      />
                      <div style={{ display: "flex", gap: spacing.sm, marginTop: spacing.md, overflowX: "auto", paddingBottom: spacing.sm }}>
                        {details.photos.map((photo, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedPhotoIndex(i)}
                            className="hover-scale interactive"
                            style={{
                              flexShrink: 0,
                              width: "60px",
                              height: "60px",
                              borderRadius: radius.sm,
                              overflow: "hidden",
                              border: selectedPhotoIndex === i ? "3px solid #00CED1" : "2px solid rgba(0, 206, 209, 0.2)",
                              padding: 0,
                              cursor: "pointer",
                              boxShadow: selectedPhotoIndex === i ? "0 4px 12px rgba(0, 206, 209, 0.3)" : "none",
                            }}
                          >
                            <img
                              src={getPlacePhotoUrl(photo.photo_reference, 150)}
                              alt={`Thumbnail ${i + 1} of ${details.name ?? "venue"}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="spring-slide-up">
                  {!details.reviews || details.reviews.length === 0 ? (
                    <div style={{ color: "#666", textAlign: "center", padding: spacing.lg }}>
                      {t.noReviews ?? "No reviews yet"}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                      {[...details.reviews].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).map((review, i) => (
                        <div
                          key={i}
                          className="glass-heavy hover-lift"
                          style={{
                            borderRadius: radius.md,
                            padding: spacing.md,
                            border: "1px solid rgba(0, 206, 209, 0.15)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
                            {review.profile_photo_url && (
                              <img
                                src={review.profile_photo_url}
                                alt={`${review.author_name ?? "Reviewer"} profile photo`}
                                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0, 206, 209, 0.2)" }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>{review.author_name}</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>{review.relative_time_description}</div>
                            </div>
                            <div style={{ display: "flex", gap: "2px" }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} style={{ color: (review.rating ?? 0) >= star ? "#FFD700" : "rgba(0, 0, 0, 0.15)", fontSize: "14px" }}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p style={{ color: "#555", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>
                            {review.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
