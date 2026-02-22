export default function ConciergeLoading() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0F1419",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        paddingBottom: 100,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0, 206, 209, 0.1)",
          }}
          className="animate-pulse"
        />
        <div>
          <div
            style={{
              width: 120,
              height: 18,
              borderRadius: 6,
              background: "rgba(255,255,255,0.06)",
              marginBottom: 4,
            }}
            className="animate-pulse"
          />
          <div
            style={{
              width: 80,
              height: 12,
              borderRadius: 4,
              background: "rgba(255,255,255,0.04)",
            }}
            className="animate-pulse"
          />
        </div>
      </div>

      {/* Message skeletons */}
      <div style={{ flex: 1 }}>
        {[0.7, 0.5, 0.8].map((w, i) => (
          <div
            key={i}
            style={{
              maxWidth: `${w * 100}%`,
              height: 48,
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              marginBottom: 12,
              marginLeft: i % 2 === 1 ? "auto" : 0,
            }}
            className="animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
