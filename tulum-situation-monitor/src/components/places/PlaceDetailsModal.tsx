"use client";

import { useState } from "react";
import { usePlaceDetails, getPlacePhotoUrl } from "@/hooks/usePlaceDetails";
import { translations } from "@/lib/i18n";
import { spacing, radius } from "@/lib/design-tokens";
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
      style={{
        padding: "12px 8px",
        borderRadius: "12px",
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
        boxShadow: `0 4px 12px ${color}40`,
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
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 10998,
          animation: "fadeIn 0.25s ease-out",
        }}
        aria-hidden
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#FFFFFF",
          borderRadius: "20px",
          border: "1px solid #EEEEEE",
          width: "90%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.14)",
          zIndex: 10999,
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div style={{ padding: "24px" }}>
            {/* Back button placeholder */}
            <div style={{ marginBottom: "16px" }}>
              <Skeleton height={44} width={44} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Skeleton height={180} />
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
          <div style={{ padding: "48px", textAlign: "center", color: "#EF4444" }}>
            {error}
          </div>
        ) : !details ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#717171" }}>
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
                  : "linear-gradient(135deg, #00CED1 0%, #009aaa 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                flexShrink: 0,
              }}
            >
              {/* Back button overlaid on photo */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.92)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  color: "#222222",
                  fontSize: "20px",
                  cursor: "pointer",
                  zIndex: 10,
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ←
              </button>

              {/* Dark gradient + name overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "20px 20px 16px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)",
                }}
              >
                <h2 style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                  {details.name ?? placeName}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  {details.rating != null && (
                    <span style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "14px" }}>
                      ★ {details.rating}
                      {details.user_ratings_total != null && (
                        <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", marginLeft: "4px" }}>
                          ({details.user_ratings_total})
                        </span>
                      )}
                    </span>
                  )}
                  {details.price_level != null && (
                    <span style={{ color: "#FFFFFF", fontWeight: 600, fontSize: "14px" }}>
                      {"$".repeat(Math.min(details.price_level, 4))}
                    </span>
                  )}
                  {details.opening_hours && (
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: details.opening_hours.open_now
                          ? "rgba(16, 185, 129, 0.9)"
                          : "rgba(239, 68, 68, 0.85)",
                        color: "#FFFFFF",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.3px",
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
                borderBottom: "1px solid #EEEEEE",
                background: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              {(["overview", "photos", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "14px 8px",
                    background: "transparent",
                    border: "none",
                    borderBottom: activeTab === tab ? "2px solid #00CED1" : "2px solid transparent",
                    color: activeTab === tab ? "#00CED1" : "#717171",
                    fontSize: "13px",
                    fontWeight: activeTab === tab ? 700 : 500,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.2s",
                  }}
                >
                  {tab === "overview" && (t.placeOverview ?? "Overview")}
                  {tab === "photos" && `${t.placePhotos ?? "Photos"}${details.photos ? ` (${details.photos.length})` : ""}`}
                  {tab === "reviews" && `${t.placeReviews ?? "Reviews"}${details.reviews ? ` (${details.reviews.length})` : ""}`}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#FFFFFF" }}>
              {activeTab === "overview" && (
                <div>
                  {details.formatted_address && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "11px", color: "#717171", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                        {t.placeAddress ?? "Address"}
                      </div>
                      <div style={{ color: "#222222", fontSize: "14px", lineHeight: 1.5 }}>{details.formatted_address}</div>
                    </div>
                  )}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "11px", color: "#717171", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                      {t.placeContact ?? "Contact"}
                    </div>
                    {phone && <div style={{ color: "#222222", fontSize: "14px", marginBottom: "8px" }}>📞 {phone}</div>}
                    {details.website && (
                      <a href={details.website} target="_blank" rel="noopener noreferrer" style={{ color: "#00CED1", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                        🌐 {t.visitWebsite ?? "Visit Website"} →
                      </a>
                    )}
                  </div>
                  {details.opening_hours?.weekday_text && details.opening_hours.weekday_text.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontSize: "11px", color: "#717171", marginBottom: "6px", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                        {t.placeHours ?? "Hours"}
                      </div>
                      {details.opening_hours.weekday_text.map((day, i) => (
                        <div key={i} style={{ color: "#444444", fontSize: "13px", marginBottom: "4px", lineHeight: 1.5 }}>
                          {day}
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: "8px", marginTop: "8px" }}>
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
                    <div style={{ color: "#717171", textAlign: "center", padding: "32px" }}>
                      {t.noPhotos ?? "No photos available"}
                    </div>
                  ) : (
                    <>
                      <img
                        src={getPlacePhotoUrl(details.photos[selectedPhotoIndex].photo_reference, 800)}
                        alt={`Photo ${selectedPhotoIndex + 1} of ${details.name ?? "venue"}`}
                        style={{
                          width: "100%",
                          height: "240px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          border: "1px solid #EEEEEE",
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px", overflowX: "auto", paddingBottom: "4px" }}>
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
                              border: selectedPhotoIndex === i ? "3px solid #00CED1" : "2px solid #EEEEEE",
                              padding: 0,
                              cursor: "pointer",
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
                <div>
                  {!details.reviews || details.reviews.length === 0 ? (
                    <div style={{ color: "#717171", textAlign: "center", padding: "32px" }}>
                      {t.noReviews ?? "No reviews yet"}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[...details.reviews].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).map((review, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#FFFFFF",
                            borderRadius: "12px",
                            padding: "14px",
                            border: "1px solid #EEEEEE",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                            {review.profile_photo_url && (
                              <img
                                src={review.profile_photo_url}
                                alt={`${review.author_name ?? "Reviewer"} profile photo`}
                                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid #EEEEEE" }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: "#222222", fontSize: "14px" }}>{review.author_name}</div>
                              <div style={{ fontSize: "12px", color: "#717171" }}>{review.relative_time_description}</div>
                            </div>
                            <div style={{ display: "flex", gap: "2px" }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} style={{ color: (review.rating ?? 0) >= star ? "#FFD700" : "#EEEEEE", fontSize: "14px" }}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p style={{ color: "#444444", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
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
