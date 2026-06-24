"""
Airtable snapshot push -- append-only history into base "Pipeline Health Snapshots".

Each refresh appends:
  - 1 row to Snapshots      (KPI totals for the cohort)
  - N rows to Deal Snapshots (one per deal)

Never updates or deletes -- history is the whole point (drives "what changed" +
the last-updated timestamp on the Lovable dashboard). typecast=True lets Airtable
accept new single-select values gracefully.
"""

import datetime as dt
import requests

import config as C

_BASE = f"https://api.airtable.com/v0/{C.AIRTABLE_BASE}"
_HEADERS = {"Authorization": f"Bearer {C.AIRTABLE_PAT}", "Content-Type": "application/json"}
_TIMEOUT = 60

# Map the 4-lane journey to the "Adoption Diagnosis" select values.
_DIAGNOSIS = {
    "KYB rejected": "KYB rejected",
    "KYB not submitted": "KYB not submitted",
    "No adoption": "No adoption",
    "Transacting": "Transacting",
}


def _now_iso() -> str:
    return dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")


def _create(table: str, records: list[dict]) -> int:
    """Batch-create records (10 per request). Returns count created."""
    created = 0
    for i in range(0, len(records), 10):
        chunk = records[i:i + 10]
        r = requests.post(
            f"{_BASE}/{table}",
            headers=_HEADERS,
            json={"records": [{"fields": f} for f in chunk], "typecast": True},
            timeout=_TIMEOUT,
        )
        if not r.ok:
            raise RuntimeError(f"Airtable {table} create failed: {r.status_code} {r.text[:300]}")
        created += len(r.json().get("records", []))
    return created


def push_snapshot(data: dict) -> int:
    """Append one Snapshots row + all Deal Snapshots rows for a cohort. Returns deal rows."""
    cohort = data["cohort"]
    refreshed = _now_iso()
    snap_key = f"{cohort} · {refreshed}"
    deals = data["deals"]
    s = data["summary"]

    transacting = sum(1 for d in deals if d["txn_count"] > 0)
    kyb_rejected = sum(1 for d in deals if d["kyb_status"] == "REJECTED")
    kyb_not_sub = sum(1 for d in deals if d["kyb_status"] in ("NOT_STARTED", "STARTED"))
    no_adopt = sum(1 for d in deals if d["journey_lane"] == "No adoption")
    offboarded_mrr = sum(d["forecast_mrr"] for d in deals if d["offboarding_status"] != "Active")

    _create(C.AT_SNAPSHOTS, [{
        "Snapshot Key": snap_key,
        "Cohort": cohort,
        "Refreshed At": refreshed,
        "Total Deals": s["deals"],
        "Booked MRR USD": s["booked_mrr"],
        "Forecast MRR USD": s["booked_mrr"],
        "Realized Revenue USD": s["revenue_realized"],
        "Not Transacting Count": s["not_transacting"],
        "Transacting Count": transacting,
        "Blocked Offboarded Count": s["blocked_off"],
        "KYB Rejected Count": kyb_rejected,
        "KYB Not Submitted Count": kyb_not_sub,
        "No Adoption Count": no_adopt,
        "Offboarded MRR USD": round(offboarded_mrr, 2),
        "Revenue Loss USD": s["projected_loss"],
    }])

    deal_rows = []
    for d in deals:
        deal_rows.append({
            "Snapshot Key": snap_key,
            "Cohort": cohort,
            "Refreshed At": refreshed,
            "Deal ID": d["deal_id"],
            "Deal Name": d["deal_name"],
            "Deal URL": d["hubspot_url"],
            "AE Name": d["ae_name"],
            "HubSpot Owner ID": d["owner_id"],
            "Effective Org ID": d["org_id"],
            "Amount USD": d["amount"],
            "Close Date": d["close_date"] or None,
            "Country": d["country"],
            "KYB Status Raw": d["kyb_status"],
            "KYB Bucket": d["kyb_status"],
            "Activity Bucket": d["activity_bucket"],
            "Health Status": d["activity_bucket"],
            "Offboarding Status": d["offboarding_status"],
            "Adoption Diagnosis": _DIAGNOSIS.get(d["journey_lane"]),
            "Revenue Net USD": d["net_revenue_usd"],
            "Best Month Revenue USD": d["best_month_usd"],
            "Avg Monthly Revenue USD": d["avg_active_month_usd"],
            "Current Month Revenue USD": d["current_month_rev_usd"],
            "Active Months Count": d["active_months"],
            "First Txn": d["first_txn"],
            "Last Txn": d["last_txn"],
            "Total Events": d["txn_count"],
            "Attainment Pct": d["attainment_pct"],
            "Revenue Loss USD": d["revenue_loss_usd"],
            "Linked Org Count": 1 + d["children_count"],
        })
    return _create(C.AT_DEAL_SNAPSHOTS, deal_rows)
