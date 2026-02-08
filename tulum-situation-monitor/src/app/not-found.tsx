import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <h1 style={{ fontSize: 48, marginBottom: 8 }}>404</h1>
      <p style={{ marginBottom: 24, color: "var(--text-secondary)" }}>Page not found</p>
      <Link
        href="/"
        style={{
          padding: "12px 24px",
          background: "var(--tulum-ocean)",
          color: "#fff",
          borderRadius: 12,
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
