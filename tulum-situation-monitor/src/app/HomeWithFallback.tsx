"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const DashboardClient = dynamic(() => import("./DashboardClient").then((m) => ({ default: m.DashboardClient })), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0404",
        color: "#00CED1",
        fontFamily: "sans-serif",
        fontSize: 18,
      }}
    >
      Loading Tulum Discovery…
    </div>
  ),
});

export function HomeWithFallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      setError(e.message || "Script error");
      return true;
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: 24,
          background: "#1a1a1a",
          color: "#ff6b6b",
          fontFamily: "monospace",
          fontSize: 14,
        }}
      >
        <h1>Error</h1>
        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{error}</pre>
      </div>
    );
  }

  return <DashboardClient />;
}
