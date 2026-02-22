import { ImageResponse } from "next/og";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

export const alt = "Discover Tulum - Real-Time Beach Conditions & Local Guide";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function getWebcamBase64(): string | null {
  try {
    const filePath = join(process.cwd(), "public", "data", "webcam", "latest.jpg");
    if (!existsSync(filePath)) return null;
    const buf = readFileSync(filePath);
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image() {
  const webcamSrc = getWebcamBase64();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: webcamSrc
            ? "#000"
            : "linear-gradient(135deg, #00CED1 0%, #0099CC 100%)",
          fontFamily: "system-ui, sans-serif",
          color: "white",
        }}
      >
        {/* Webcam background */}
        {webcamSrc && (
          <img
            src={webcamSrc}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Dark gradient overlay for text readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: webcamSrc
              ? "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.1) 100%)"
              : "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            width: "100%",
            height: "100%",
            padding: "40px 60px 50px",
          }}
        >
          {/* Top badge */}
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 40,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              background: "rgba(0, 206, 209, 0.9)",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {webcamSrc ? "LIVE FROM TULUM" : "DISCOVER TULUM"}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: "bold",
              textAlign: "center",
              textShadow: "0 4px 16px rgba(0,0,0,0.5)",
              marginBottom: 12,
            }}
          >
            Discover Tulum
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 26,
              textAlign: "center",
              opacity: 0.95,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              marginBottom: 24,
            }}
          >
            Real-Time Beach Conditions, Weather & Local Insider Picks
          </div>

          {/* Bottom feature pills */}
          <div
            style={{
              display: "flex",
              gap: 16,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {["Beach Conditions", "Weather", "Insider Picks", "AI Concierge"].map((label) => (
              <div
                key={label}
                style={{
                  padding: "8px 20px",
                  background: "rgba(0, 206, 209, 0.85)",
                  borderRadius: 20,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
