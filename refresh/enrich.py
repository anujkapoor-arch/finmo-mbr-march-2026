"""
Enrichment: join HubSpot deals to Metabase (revenue, activity, KYB, partner
children) and classify each deal into the buckets the dashboards render.

Output per cohort: a list of enriched deal dicts + a roll-up summary, written to
refresh/data/<cohort>.json and consumed by render.py and lib_airtable.py.
"""

import datetime as dt

import config as C
import lib_hubspot as hs
import lib_metabase as mb

TODAY = dt.date.today()


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------
def _months_between(start: dt.date, end: dt.date) -> float:
    if not start:
        return 0.0
    return max(0.0, (end - start).days / 30.4375)


def activity_bucket(kyb: str, txn_count: int, net_rev: float, last_txn) -> str:
    has_rev = net_rev > 1.0
    dormant = (last_txn is None) or ((TODAY - last_txn).days > C.DORMANCY_DAYS)
    if txn_count == 0:
        return "Activated, No Txn" if kyb in C.KYB_APPROVED else "No Txn"
    if has_rev and not dormant:
        return "Revenue Generating"
    if has_rev and dormant:
        return "Revenue, Gone Dormant"
    return "Transacting, No Revenue"


def journey_lane(kyb: str, txn_count: int) -> str:
    """The 4-lane customer-journey pipeline classification."""
    if kyb == "REJECTED":
        return "KYB rejected"
    if kyb in ("NOT_STARTED", "STARTED"):
        return "KYB not submitted"
    if txn_count > 0:
        return "Transacting"
    return "No adoption"   # KYB approved/submitted but no transactions


def offboarding_status(stage_id: str, kyb: str) -> str:
    if stage_id == "3482930895":           # Offboarded stage
        return "Offboarded"
    if kyb == "REJECTED":
        return "Compliance Blocked"
    return "Active"


def _monthly_stats(monthly: dict[str, float]) -> dict:
    """best month, avg per active month, active month count, trend (last 12)."""
    months_sorted = sorted(monthly.items())
    active = [(m, v) for m, v in months_sorted if v > 1.0]
    best = max((v for _, v in months_sorted), default=0.0)
    avg_active = (sum(v for _, v in active) / len(active)) if active else 0.0
    trend = [round(v, 2) for _, v in months_sorted[-12:]]
    cur_ym = TODAY.strftime("%Y-%m")
    return {
        "best_month": round(best, 2),
        "avg_active_month": round(avg_active, 2),
        "active_months": len(active),
        "trend": trend,
        "current_month_rev": round(monthly.get(cur_ym, 0.0), 2),
    }


# ---------------------------------------------------------------------------
# Build one cohort
# ---------------------------------------------------------------------------
def build_cohort(cohort_key: str) -> dict:
    stage_ids = C.COHORT_STAGES[cohort_key]
    deals = hs.deals_in_stages(stage_ids)

    org_ids = sorted({d["org_id"] for d in deals if d["org_id"]})

    # Metabase joins (batched)
    net_rev = mb.net_revenue_by_org(org_ids)
    monthly = mb.monthly_revenue_by_org(org_ids)
    activity = mb.txn_activity_by_org(org_ids)
    kyb = mb.kyb_status_by_org(org_ids)
    self_partner = mb.org_partner_ids(org_ids)

    # Partner children (only for orgs that are partners)
    partner_ids = sorted({pid for pid in self_partner.values() if pid})
    children_map = mb.partner_children(partner_ids) if partner_ids else {}

    enriched = []
    for d in deals:
        oid = d["org_id"]
        kyb_status = kyb.get(oid, "NOT_STARTED") if oid else "NOT_STARTED"
        act = activity.get(oid, {"count": 0, "first": None, "last": None})
        net = net_rev.get(oid, 0.0)
        mstats = _monthly_stats(monthly.get(oid, {}))

        close = _date(d["close_date"])
        months_elapsed = round(_months_between(close, TODAY), 1)
        partner_id = self_partner.get(oid, "")
        children = children_map.get(partner_id, []) if partner_id else []

        lane = journey_lane(kyb_status, act["count"])
        rec = {
            **d,
            "kyb_status": kyb_status,
            "txn_count": act["count"],
            "first_txn": act["first"].isoformat() if act["first"] else None,
            "last_txn": act["last"].isoformat() if act["last"] else None,
            "net_revenue_usd": round(net, 2),
            "best_month_usd": mstats["best_month"],
            "avg_active_month_usd": mstats["avg_active_month"],
            "active_months": mstats["active_months"],
            "trend": mstats["trend"],
            "current_month_rev_usd": mstats["current_month_rev"],
            "months_elapsed": months_elapsed,
            "journey_lane": lane,
            "activity_bucket": activity_bucket(kyb_status, act["count"], net, act["last"]),
            "offboarding_status": offboarding_status(d["stage_id"], kyb_status),
            "is_partner": bool(partner_id),
            "partner_id": partner_id,
            "children_count": len(children),
            "children": children,
            # revenue loss only meaningful for approved + zero-txn deals
            "revenue_loss_usd": round(d["forecast_mrr"] * months_elapsed, 2)
            if (kyb_status in C.KYB_APPROVED and act["count"] == 0) else 0.0,
            "attainment_pct": round(100 * mstats["avg_active_month"] / d["forecast_mrr"], 1)
            if d["forecast_mrr"] else 0.0,
        }
        enriched.append(rec)

    return {
        "cohort": cohort_key,
        "generated_at": dt.datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "deals": enriched,
        "summary": _summarise(enriched),
    }


def _summarise(deals: list[dict]) -> dict:
    n = len(deals)
    booked_mrr = sum(d["forecast_mrr"] for d in deals)
    realized = sum(d["net_revenue_usd"] for d in deals if d["net_revenue_usd"] > 0)
    not_transacting = [d for d in deals if d["txn_count"] == 0]
    blocked = [d for d in deals if d["offboarding_status"] != "Active"]
    rev_generating = [d for d in deals if d["activity_bucket"] == "Revenue Generating"]
    dormant = [d for d in deals if d["activity_bucket"] == "Revenue, Gone Dormant"]
    approved_zero = [d for d in deals if d["kyb_status"] in C.KYB_APPROVED and d["txn_count"] == 0]
    return {
        "deals": n,
        "booked_mrr": round(booked_mrr, 2),
        "revenue_realized": round(realized, 2),
        "current_month_runrate": round(sum(d["current_month_rev_usd"] for d in deals), 2),
        "not_transacting": len(not_transacting),
        "not_transacting_pct": round(100 * len(not_transacting) / n) if n else 0,
        "blocked_off": len(blocked),
        "blocked_off_pct": round(100 * len(blocked) / n) if n else 0,
        "revenue_generating": len(rev_generating),
        "dormant": len(dormant),
        "projected_loss": round(sum(d["revenue_loss_usd"] for d in approved_zero), 2),
        "approved_zero_txn": len(approved_zero),
    }


def _date(s: str):
    try:
        return dt.date.fromisoformat(s[:10])
    except (ValueError, TypeError):
        return None
