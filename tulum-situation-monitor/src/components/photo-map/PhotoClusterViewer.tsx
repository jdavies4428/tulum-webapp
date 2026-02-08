"use client";

import { useState } from "react";
import type { PhotoCluster } from "@/lib/photo-map-utils";

interface PhotoClusterViewerProps {
  cluster: PhotoCluster;
  onClose: () => void;
  t: Record<string, string>;
}

export function PhotoClusterViewer({ cluster, onClose, t }: PhotoClusterViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPhoto = cluster.photos[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cluster.photos.length) % cluster.photos.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cluster.photos.length);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.9)",
          zIndex: 998,
          backdropFilter: "blur(10px)",
        }}
        aria-hidden
      />
      <div
        style={{
          position: "fixed",
          inset: "20px",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#FFF" }}>
            📍 {cluster.photos.length} {t.photos ?? "photos"} {t.photoMapAtLocation ?? "at this location"}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(20px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              color: "#FFF",
              fontSize: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            position: "relative",
            minHeight: 0,
          }}
        >
          {cluster.photos.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              style={{
                position: "absolute",
                left: "20px",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.9)",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                zIndex: 10,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
              }}
            >
              ←
            </button>
          )}

          <img
            src={currentPhoto.imageUrl}
            alt={currentPhoto.filename}
            style={{
              maxWidth: "90%",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: "16px",
              boxShadow: "0 16px 64px rgba(0, 0, 0, 0.5)",
            }}
          />

          {cluster.photos.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              style={{
                position: "absolute",
                right: "20px",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.9)",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                zIndex: 10,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
              }}
            >
              →
            </button>
          )}

          {cluster.photos.length > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "8px 16px",
                borderRadius: "20px",
                background: "rgba(0, 0, 0, 0.7)",
                color: "#FFF",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              {currentIndex + 1} / {cluster.photos.length}
            </div>
          )}
        </div>

        {cluster.photos.length > 1 && (
          <div
            className="hide-scrollbar"
            style={{
              padding: "20px",
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              maxWidth: "100%",
            }}
          >
            {cluster.photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "12px",
                  backgroundImage: `url(${photo.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  cursor: "pointer",
                  border: index === currentIndex ? "3px solid #00CED1" : "3px solid transparent",
                  opacity: index === currentIndex ? 1 : 0.6,
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        )}

        {currentPhoto.timestamp && (
          <div
            style={{
              padding: "16px",
              background: "rgba(0, 0, 0, 0.7)",
              borderRadius: "16px",
              color: "#FFF",
              fontSize: "14px",
              marginTop: "16px",
            }}
          >
            📅 {currentPhoto.timestamp.toLocaleString()}
          </div>
        )}
      </div>
    </>
  );
}
