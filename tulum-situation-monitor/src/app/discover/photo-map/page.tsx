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

function Feature({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "12px",
      }}
    >
      <span style={{ fontSize: "24px" }}>{icon}</span>
      <span style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>{text}</span>
    </div>
  );
}

function ScanningProgress({ progress }: { progress: number }) {
  const t = translations["en"] as Record<string, string>;
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
        <div
          style={{
            fontSize: "80px",
            marginBottom: "24px",
            animation: "bounce 1s ease-in-out infinite",
          }}
        >
          🔍
        </div>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "16px",
            color: "#333",
          }}
        >
          {t.photoMapScanning ?? "Finding Your Tulum Photos..."}
        </h2>
        <div
          style={{
            width: "100%",
            height: "12px",
            background: "rgba(0, 206, 209, 0.1)",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #00CED1 0%, #00BABA 100%)",
              transition: "width 0.3s",
            }}
          />
        </div>
        <div style={{ fontSize: "18px", fontWeight: "700", color: "#00CED1" }}>{progress}%</div>
        <p style={{ fontSize: "14px", color: "#666", marginTop: "16px" }}>
          {t.photoMapScanningHint ?? "Scanning photos for GPS data..."}
        </p>
      </div>
      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
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
      setError(null);

      const tulumPhotos: PhotoWithGPS[] = [];
      let processed = 0;

      for (const file of imageFiles) {
        try {
          const photo = await readPhotoGPS(file);
          if (photo) {
            tulumPhotos.push(photo);
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
    return <ScanningProgress progress={progress} />;
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

  // onboarding
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        paddingTop: "max(24px, env(safe-area-inset-top))",
        background: "linear-gradient(135deg, #E0F7FA 0%, #FFF8E7 100%)",
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

      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
          padding: "48px 32px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "32px",
          border: "3px solid rgba(0, 206, 209, 0.2)",
          boxShadow: "0 16px 64px rgba(0, 0, 0, 0.1)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
            justifyContent: "center",
          }}
        >
          <Link
            href={`/discover?lang=${lang}`}
            style={{
              position: "absolute",
              left: 24,
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
            }}
          >
            ←
          </Link>
        </header>

        <div
          style={{
            fontSize: "120px",
            marginBottom: "24px",
            filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))",
          }}
        >
          🗺️📸
        </div>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: "800",
            marginBottom: "16px",
            background: "linear-gradient(135deg, #0099CC 0%, #00CED1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t.photoMapCreateTitle ?? "Create Your Tulum Map"}
        </h1>

        <p
          style={{
            fontSize: "17px",
            color: "#666",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          {t.photoMapCreateDesc ??
            "We'll scan your photos for Tulum memories and create a beautiful map showing where you've been! 🌴"}
        </p>

        <div
          style={{
            textAlign: "left",
            marginBottom: "32px",
            padding: "24px",
            background: "rgba(0, 206, 209, 0.05)",
            borderRadius: "20px",
          }}
        >
          <Feature icon="🔒" text={t.photoMapPrivate ?? "100% private - photos never leave your device"} />
          <Feature icon="🤖" text={t.photoMapAuto ?? "Automatic - we find your Tulum photos"} />
          <Feature icon="🎨" text={t.photoMapBeautiful ?? "Beautiful illustrated map view"} />
          <Feature icon="📍" text={t.photoMapGrouped ?? "Photos grouped by location"} />
        </div>

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
            padding: "20px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #00CED1 0%, #00BABA 100%)",
            border: "none",
            color: "#FFF",
            fontSize: "18px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0, 206, 209, 0.3)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 48px rgba(0, 206, 209, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 206, 209, 0.3)";
          }}
        >
          🚀 {t.photoMapCreateButton ?? "Create My Map"}
        </button>

        <p style={{ fontSize: "13px", color: "#999", marginTop: "24px" }}>
          {t.photoMapFolderHint ?? "You'll be asked to select your Photos folder"}
        </p>
      </div>
    </div>
  );
}
