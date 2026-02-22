export default function FavoritesLoading() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0F1419",
        padding: "24px 16px",
        paddingBottom: 100,
      }}
    >
      {/* Header */}
      <div
        style={{
          width: 140,
          height: 24,
          borderRadius: 8,
          background: "rgba(255,255,255,0.06)",
          marginBottom: 24,
        }}
        className="animate-pulse"
      />

      {/* List skeletons */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              flexShrink: 0,
            }}
            className="animate-pulse"
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: "60%",
                height: 16,
                borderRadius: 4,
                background: "rgba(255,255,255,0.06)",
                marginBottom: 6,
              }}
              className="animate-pulse"
            />
            <div
              style={{
                width: "40%",
                height: 12,
                borderRadius: 4,
                background: "rgba(255,255,255,0.04)",
              }}
              className="animate-pulse"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
