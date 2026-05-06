import { Link } from "react-router-dom"

export default function MerchantAdoptionLive() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fafaff" }}>
      <div
        style={{
          padding: "12px 24px",
          background: "#fff",
          borderBottom: "1px solid #ece7f5",
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 13,
        }}
      >
        <Link to="/" style={{ color: "#5a36a6", textDecoration: "none", fontWeight: 600 }}>
          ← All dashboards
        </Link>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          <Link
            to="/merchant-adoption/closed-won"
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 12,
              textDecoration: "none",
              background: "#f4f1fa",
              color: "#5a36a6",
              border: "1px solid #ece7f5",
            }}
          >
            Closed Won/Activation
          </Link>
          <Link
            to="/merchant-adoption/live"
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 12,
              textDecoration: "none",
              background: "linear-gradient(135deg,#3a216e 0%,#6f4ec7 100%)",
              color: "#fff",
            }}
          >
            Live
          </Link>
        </div>
      </div>
      <iframe
        src="/merchant-adoption-live.html"
        title="Live Stage Dashboard"
        style={{ flex: 1, border: "none", width: "100%", minHeight: "calc(100vh - 50px)" }}
      />
    </div>
  )
}
