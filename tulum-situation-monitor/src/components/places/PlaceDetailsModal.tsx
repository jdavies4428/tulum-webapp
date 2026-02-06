"use client";

import { useState } from "react";
import { usePlaceDetails, getPlacePhotoUrl } from "@/hooks/usePlaceDetails";
import { translations } from "@/lib/i18n";
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
      style={{
        padding: "12px",
        borderRadius: "10px",
        background: color,
        color: "white",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        textDecoration: "none",
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
  const { details, loading, error } = usePlaceDetails(placeId);
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
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
        }}
        aria-hidden
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(10, 4, 4, 0.98)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          width: "90%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.6)",
            border: "none",
            color: "#FFF",
            fontSize: "20px",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          ✕
        </button>

        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading...
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
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "20px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                }}
              >
                <h2 style={{ color: "#FFD700", fontSize: "22px", fontWeight: 700, margin: "0 0 8px 0" }}>
                  {details.name ?? placeName}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  {details.rating != null && (
                    <span style={{ color: "#FFF", fontWeight: 600 }}>
                      ★ {details.rating}
                      {details.user_ratings_total != null && (
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginLeft: "4px" }}>
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
                        padding: "4px 10px",
                        borderRadius: "8px",
                        background: details.opening_hours.open_now
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(239, 68, 68, 0.2)",
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
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "0 20px",
                background: "rgba(0, 0, 0, 0.3)",
              }}
            >
              {(["overview", "photos", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "12px 16px",
                    background: "transparent",
                    border: "none",
                    borderBottom: activeTab === tab ? "3px solid #00D4D4" : "3px solid transparent",
                    color: activeTab === tab ? "#FFF" : "rgba(255,255,255,0.6)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {tab === "overview" && (t.placeOverview ?? "Overview")}
                  {tab === "photos" && `${t.placePhotos ?? "Photos"}${details.photos ? ` (${details.photos.length})` : ""}`}
                  {tab === "reviews" && `${t.placeReviews ?? "Reviews"}${details.reviews ? ` (${details.reviews.length})` : ""}`}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {activeTab === "overview" && (
                <div>
                  {details.formatted_address && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px", textTransform: "uppercase" }}>
                        {t.placeAddress ?? "Address"}
                      </div>
                      <div style={{ color: "#FFF", fontSize: "14px" }}>{details.formatted_address}</div>
                    </div>
                  )}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px", textTransform: "uppercase" }}>
                      {t.placeContact ?? "Contact"}
                    </div>
                    {phone && <div style={{ color: "#FFF", fontSize: "14px", marginBottom: "6px" }}>📞 {phone}</div>}
                    {details.website && (
                      <a href={details.website} target="_blank" rel="noopener noreferrer" style={{ color: "#00D4D4", fontSize: "14px" }}>
                        🌐 {t.visitWebsite ?? "Visit Website"} →
                      </a>
                    )}
                  </div>
                  {details.opening_hours?.weekday_text && details.opening_hours.weekday_text.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px", textTransform: "uppercase" }}>
                        {t.placeHours ?? "Hours"}
                      </div>
                      {details.opening_hours.weekday_text.map((day, i) => (
                        <div key={i} style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", marginBottom: "2px" }}>
                          {day}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: "8px", marginTop: "16px" }}>
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
                <div>
                  {!details.photos || details.photos.length === 0 ? (
                    <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "24px" }}>
                      {t.noPhotos ?? "No photos available"}
                    </div>
                  ) : (
                    <>
                      <img
                        src={getPlacePhotoUrl(details.photos[selectedPhotoIndex].photo_reference, 800)}
                        alt=""
                        style={{ width: "100%", height: "240px", objectFit: "cover", borderRadius: "12px" }}
                      />
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px", overflowX: "auto", paddingBottom: "8px" }}>
                        {details.photos.map((photo, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedPhotoIndex(i)}
                            style={{
                              flexShrink: 0,
                              width: "60px",
                              height: "60px",
                              borderRadius: "8px",
                              overflow: "hidden",
                              border: selectedPhotoIndex === i ? "3px solid #00D4D4" : "2px solid transparent",
                              padding: 0,
                              cursor: "pointer",
                            }}
                          >
                            <img
                              src={getPlacePhotoUrl(photo.photo_reference, 150)}
                              alt=""
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
                <div>
                  {!details.reviews || details.reviews.length === 0 ? (
                    <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "24px" }}>
                      {t.noReviews ?? "No reviews yet"}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[...details.reviews].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).map((review, i) => (
                        <div
                          key={i}
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "12px",
                            padding: "14px",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            {review.profile_photo_url && (
                              <img
                                src={review.profile_photo_url}
                                alt=""
                                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: "#FFF", fontSize: "14px" }}>{review.author_name}</div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{review.relative_time_description}</div>
                            </div>
                            <div style={{ display: "flex", gap: "2px" }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} style={{ color: (review.rating ?? 0) >= star ? "#FFD700" : "rgba(255,255,255,0.2)", fontSize: "14px" }}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>
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
