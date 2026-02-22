export default function DiscoverLoading() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0F1419",
        padding: "24px 16px",
        paddingBottom: 100,
      }}
    >
      {/* Header skeleton */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 180,
            height: 28,
            borderRadius: 8,
            background: "rgba(255,255,255,0.06)",
            marginBottom: 8,
          }}
          className="animate-pulse"
        />
        <div
          style={{
            width: 240,
            height: 16,
            borderRadius: 6,
            background: "rgba(255,255,255,0.04)",
          }}
          className="animate-pulse"
        />
      </div>

      {/* Card grid skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: "1/1",
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
            }}
            className="animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
