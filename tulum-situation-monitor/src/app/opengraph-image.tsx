import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Discover Tulum - Real-Time Beach Conditions & Local Guide";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: "linear-gradient(135deg, #00CED1 0%, #0099CC 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: 120,
            marginBottom: 20,
          }}
        >
          🏖️
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 20,
            textShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          Discover Tulum
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            textAlign: "center",
            opacity: 0.95,
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Real-Time Beach Conditions, Weather & Local Insider Picks
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            gap: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>☀️</span>
            <span>Weather</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>🌊</span>
            <span>Beach Conditions</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>⭐</span>
            <span>Insider Picks</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
