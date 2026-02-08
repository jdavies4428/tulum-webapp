"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { usePersistedLang } from "@/hooks/usePersistedLang";
import { translations } from "@/lib/i18n";
import {
  readPhotoGPS,
  clusterPhotosByLocation,
  getAllFilesFromDirHandle,
  supportsDirectoryPicker,
  type PhotoWithGPS,
  type PhotoCluster,
} from "@/lib/photo-map-utils";

const IllustratedPhotoMap = dynamic(
  () => import("@/components/photo-map/IllustratedPhotoMap").then((m) => m.IllustratedPhotoMap),
  { ssr: false, loading: () => <div style={{ padding: 48, textAlign: "center" }}>Loading map…</div> }
);

const PhotoClusterViewer = dynamic(
  () => import("@/components/photo-map/PhotoClusterViewer").then((m) => m.PhotoClusterViewer),
  { ssr: false }
);

function TrustBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#666",
      }}
    >
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function FloatingDecoration({
  emoji,
  delay,
}: {
  emoji: string;
  delay: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        fontSize: "32px",
        opacity: 0.15,
        animation: `photoMapFloat 6s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        top: `${20 + delay * 15}%`,
        left: `${10 + delay * 25}%`,
        pointerEvents: "none",
      }}
    >
      {emoji}
    </div>
  );
}

function ScanningProgress({
  progress,
  photosFound,
  t,
}: {
  progress: number;
  photosFound: number;
  t: Record<string, string>;
}) {
  const statusText =
    photosFound > 0
      ? (t.photoMapFoundPhotos ?? "Found {{count}} Tulum photos!").replace("{{count}}", String(photosFound))
      : (t.photoMapScanningLibrary ?? "Scanning your library...");

  return (
    <div
      style={{
        height: "100dvh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
      }}
    >
      <div style={{ position: "relative", width: "160px", height: "160px", marginBottom: "32px" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "rgba(0, 206, 209, 0.2)",
            animation: "photoMapPulse 2s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "20%",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "64px",
          }}
        >
          🔍
        </div>
      </div>

      <h2
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#333",
          marginBottom: "8px",
          textAlign: "center",
        }}
      >
        {t.photoMapScanningStatus ?? "Finding Your Photos..."}
      </h2>

      <p
        style={{
          fontSize: "16px",
          color: "#666",
          marginBottom: "32px",
          textAlign: "center",
        }}
      >
        {statusText}
      </p>

      <div
        style={{
          width: "100%",
          maxWidth: "320px",
          height: "8px",
          background: "rgba(0, 206, 209, 0.2)",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #00CED1 0%, #00BABA 100%)",
            borderRadius: "8px",
            transition: "width 0.3s ease-out",
          }}
        />
      </div>

      <div
        style={{
          fontSize: "24px",
          fontWeight: "800",
          color: "#00CED1",
          marginBottom: "48px",
        }}
      >
        {progress}%
      </div>

      <div
        style={{
          padding: "16px 24px",
          background: "rgba(255, 255, 255, 0.7)",
          borderRadius: "16px",
          border: "2px solid rgba(0, 206, 209, 0.2)",
          maxWidth: "320px",
        }}
      >
        <div style={{ fontSize: "14px", color: "#666", textAlign: "center" }}>
          {t.photoMapScanningTip ?? "💡 Tip: About 60-80% of phone photos have GPS data"}
        </div>
      </div>
    </div>
  );
}

function NoPhotosFound({ onRetry, t }: { onRetry: () => void; t: Record<string, string> }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "48px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "32px",
          maxWidth: "500px",
          boxShadow: "0 16px 64px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ fontSize: "80px", marginBottom: "24px" }}>📷</div>
        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px", color: "#333" }}>
          {t.photoMapNoPhotos ?? "No Tulum photos found"}
        </h2>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "24px", lineHeight: 1.5 }}>
          {t.photoMapNoPhotosHint ??
            "We didn't find any photos with GPS data in the Tulum area. Make sure your photos have location metadata and try selecting a different folder."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: "16px 32px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            border: "none",
            color: "#FFF",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {t.tryAgain ?? "Try Again"}
        </button>
      </div>
    </div>
  );
}

export default function PhotoMapPage() {
  const searchParams = useSearchParams();
  const [lang] = usePersistedLang(searchParams.get("lang"));
  const t = translations[lang] as Record<string, string>;

  const [phase, setPhase] = useState<"onboarding" | "scanning" | "map" | "empty">("onboarding");
  const [progress, setProgress] = useState(0);
  const [photosFound, setPhotosFound] = useState(0);
  const [clusters, setClusters] = useState<PhotoCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<PhotoCluster | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) {
        setPhase("empty");
        return;
      }

      setPhase("scanning");
      setProgress(0);
      setPhotosFound(0);
      setError(null);

      const tulumPhotos: PhotoWithGPS[] = [];
      let processed = 0;

      for (const file of imageFiles) {
        try {
          const photo = await readPhotoGPS(file);
          if (photo) {
            tulumPhotos.push(photo);
            setPhotosFound(tulumPhotos.length);
          }
        } catch {
          // skip
        }
        processed++;
        setProgress(Math.round((processed / imageFiles.length) * 100));
      }

      if (tulumPhotos.length === 0) {
        setPhase("empty");
        return;
      }

      const clustered = clusterPhotosByLocation(tulumPhotos);
      setClusters(clustered);
      setPhase("map");
    },
    []
  );

  const handleCreateMap = async () => {
    if (supportsDirectoryPicker()) {
      try {
        const dirHandle = await window.showDirectoryPicker!({
          mode: "read",
          startIn: "pictures",
        });
        const files = await getAllFilesFromDirHandle(dirHandle);
        await scanFiles(files);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled
          return;
        }
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    await scanFiles(arr);
    e.target.value = "";
  };

  const handleRetry = () => {
    setPhase("onboarding");
    setError(null);
    fileInputRef.current?.click();
  };

  if (phase === "scanning") {
    return <ScanningProgress progress={progress} photosFound={photosFound} t={t} />;
  }

  if (phase === "empty") {
    return <NoPhotosFound onRetry={handleRetry} t={t} />;
  }

  if (phase === "map") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-primary)",
          zIndex: 0,
        }}
      >
        <header
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 24px",
            paddingTop: "max(16px, env(safe-area-inset-top))",
            borderBottom: "1px solid var(--border-subtle)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, transparent 100%)",
          }}
        >
          <Link
            href={`/discover?lang=${lang}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "var(--button-secondary)",
              border: "1px solid var(--border-emphasis)",
              color: "var(--text-primary)",
              fontSize: "20px",
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
              background: "linear-gradient(135deg, #0099CC 0%, #00CED1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🎨 {t.photoMapTitle ?? "My Tulum Adventures"}
          </h1>
          <span
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              marginLeft: "auto",
              fontWeight: "600",
            }}
          >
            {clusters.reduce((s, c) => s + c.photos.length, 0)} {t.photos ?? "photos"} • {clusters.length} {t.photoMapLocations ?? "locations"}
          </span>
        </header>
        <div style={{ flex: 1, minHeight: 0 }}>
          <IllustratedPhotoMap
            clusters={clusters}
            onClusterSelect={setSelectedCluster}
          />
        </div>
        {selectedCluster && (
          <PhotoClusterViewer
            cluster={selectedCluster}
            onClose={() => setSelectedCluster(null)}
            t={t}
          />
        )}
      </div>
    );
  }

  // onboarding – simplified design
  return (
    <div
      style={{
        height: "100dvh",
        overflowY: "auto",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        paddingTop: "max(32px, env(safe-area-inset-top))",
        paddingBottom: "100px",
        background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
        position: "relative",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        // @ts-expect-error webkitdirectory is valid for folder picker
        webkitdirectory=""
        directory=""
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      <FloatingDecoration emoji="📸" delay={0} />
      <FloatingDecoration emoji="🗺️" delay={1} />
      <FloatingDecoration emoji="🌴" delay={2} />

      <Link
        href={`/discover?lang=${lang}`}
        style={{
          position: "absolute",
          top: "max(24px, env(safe-area-inset-top))",
          left: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.9)",
          border: "2px solid rgba(0, 206, 209, 0.2)",
          color: "var(--tulum-ocean)",
          fontSize: "20px",
          textDecoration: "none",
        }}
      >
        ←
      </Link>

      {/* Map illustration */}
      <div
        style={{
          width: "200px",
          height: "200px",
          marginBottom: "40px",
          flexShrink: 0,
        }}
      >
        <svg width="200" height="200" viewBox="0 0 240 240" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B3E5FC" stopOpacity={1} />
              <stop offset="100%" stopColor="#81D4FA" stopOpacity={1} />
            </linearGradient>
          </defs>
          <rect
            x="20"
            y="40"
            width="200"
            height="160"
            rx="20"
            fill="url(#mapGradient)"
            stroke="#00CED1"
            strokeWidth="4"
          />
          <circle cx="80" cy="100" r="20" fill="#FF6B6B" stroke="#FFF" strokeWidth="3" />
          <circle cx="140" cy="120" r="20" fill="#FFD93D" stroke="#FFF" strokeWidth="3" />
          <circle cx="160" cy="80" r="20" fill="#6BCB77" stroke="#FFF" strokeWidth="3" />
          <text x="120" y="50" fontSize="40" textAnchor="middle">
            📷
          </text>
        </svg>
      </div>

      <h1
        style={{
          fontSize: "clamp(28px, 6vw, 40px)",
          fontWeight: "800",
          margin: "0 0 16px 0",
          textAlign: "center",
          background: "linear-gradient(135deg, #0099CC 0%, #00CED1 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.2,
        }}
      >
        {t.photoMapJourneyTitle ?? "Your Tulum Journey on a Map"}
      </h1>

      <p
        style={{
          fontSize: "18px",
          color: "#666",
          textAlign: "center",
          margin: "0 0 48px 0",
          maxWidth: "320px",
          lineHeight: 1.5,
        }}
      >
        {t.photoMapJourneySubtitle ?? "We'll find your Tulum photos and show where you've been"}
      </p>

      {error && (
        <p
          style={{
            padding: "12px",
            background: "rgba(239,68,68,0.15)",
            borderRadius: "12px",
            color: "#EF4444",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleCreateMap}
        style={{
          width: "100%",
          maxWidth: "320px",
          padding: "20px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
          border: "none",
          color: "#FFF",
          fontSize: "20px",
          fontWeight: "800",
          cursor: "pointer",
          boxShadow: "0 12px 40px rgba(0, 206, 209, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 16px 48px rgba(0, 206, 209, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 206, 209, 0.4)";
        }}
      >
        <span style={{ fontSize: "28px" }}>🚀</span>
        <span>{t.photoMapCreateButton ?? "Create My Map"}</span>
      </button>

      <div
        style={{
          marginTop: "32px",
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <TrustBadge
          icon="🔒"
          text={t.photoMapTrustPrivate ?? "Private"}
        />
        <TrustBadge
          icon="⚡"
          text={t.photoMapTrustInstant ?? "Instant"}
        />
        <TrustBadge
          icon="✨"
          text={t.photoMapTrustFree ?? "Free"}
        />
      </div>

      <Link
        href={`/discover?lang=${lang}`}
        style={{
          marginTop: "24px",
          background: "transparent",
          border: "none",
          color: "#999",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        {t.maybeLater ?? "Maybe Later"}
      </Link>
    </div>
  );
}
