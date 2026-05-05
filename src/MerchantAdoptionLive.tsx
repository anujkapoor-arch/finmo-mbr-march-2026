import { Link } from "react-router-dom"

export default function MerchantAdoptionLive() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafaff" }}>
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

      <div
        style={{
          maxWidth: 720,
          margin: "60px auto",
          padding: "32px",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 1px 3px rgba(58,33,110,0.06)",
          border: "1px solid #ece7f5",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "5px 12px",
            background: "#fdf3df",
            color: "#a86a07",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          Coming soon
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: 24, color: "#1a1635", fontWeight: 800 }}>
          Live merchants — adoption analysis
        </h1>
        <p style={{ color: "#3d3866", lineHeight: 1.6, fontSize: 14, margin: "0 0 18px" }}>
          The same lifecycle pipeline (KYB → adoption → revenue) applied to the <b>67 deals</b> sitting in the
          "Live" stage of HubSpot's Sales Deals pipeline. We'll populate this after we close out actions on
          the Closed Won/Activation cohort.
        </p>
        <p style={{ color: "#6f6a91", fontSize: 12.5, margin: 0 }}>
          Want to know what's coming?{" "}
          <Link to="/merchant-adoption/closed-won" style={{ color: "#5a36a6", fontWeight: 600 }}>
            See the Closed Won/Activation tab
          </Link>{" "}
          for the structure.
        </p>
      </div>
    </div>
  )
}
