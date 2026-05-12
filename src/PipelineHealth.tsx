import { Link } from "react-router-dom"

export default function PipelineHealth() {
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
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#a09bc1" }}>
          Airtable-backed · refresh by re-running <code>airtable_dashboard.py</code>
        </div>
      </div>
      <iframe
        src="/pipeline-health.html"
        title="Pipeline Health & Adoption"
        style={{ flex: 1, border: "none", width: "100%", minHeight: "calc(100vh - 50px)" }}
      />
    </div>
  )
}
