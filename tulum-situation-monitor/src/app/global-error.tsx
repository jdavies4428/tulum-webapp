"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 24, fontFamily: "sans-serif", background: "#0a0404", color: "#fff" }}>
        <h2 style={{ marginBottom: 16 }}>Something went wrong</h2>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "12px 24px",
            background: "#00CED1",
            color: "#000",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
