export default function MapLoading() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0F1419",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid rgba(0, 206, 209, 0.2)",
            borderTopColor: "#00CED1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ color: "rgba(232, 236, 239, 0.5)", fontSize: 14 }}>
          Loading map...
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
