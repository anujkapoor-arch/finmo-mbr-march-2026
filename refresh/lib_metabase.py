"""
Metabase data access (read-only).

Hard rules (see metabase-safety-rules in MEMORY.md):
- POST /api/dataset only. Never PUT/DELETE. Never edit saved questions.
- Aggregated MBQL with breakouts; never full table scans. Always cap results.
- Batch org_ids into a single query (never one query per org).
- Requires the Finmo VPN.
"""

import datetime as dt
import requests

import config as C

_TIMEOUT = 120


def query(database: int, mbql: dict) -> list[list]:
    """Run one MBQL query, return rows (list of lists). Raises on HTTP error."""
    payload = {"database": database, "type": "query", "query": mbql}
    r = requests.post(
        C.METABASE_DATASET,
        headers={"x-api-key": C.METABASE_API_KEY, "Content-Type": "application/json"},
        json=payload,
        timeout=_TIMEOUT,
    )
    r.raise_for_status()
    data = r.json()
    if data.get("status") == "failed":
        raise RuntimeError(f"Metabase query failed: {data.get('error')}")
    return data["data"]["rows"]


def _field(fid: int):
    return ["field", fid, None]


def _in(fid: int, values: list[str]):
    """Build an MBQL `=` / `in` filter for a field across many values."""
    if not values:
        return ["=", _field(fid), "__none__"]
    return ["=", _field(fid), *values]


# ---------------------------------------------------------------------------
# Revenue (DB 14, table 242) -- net USD = sum(CREDIT) - sum(DEBIT)
# ---------------------------------------------------------------------------
def net_revenue_by_org(org_ids: list[str]) -> dict[str, float]:
    """Lifetime net USD revenue per org (CREDIT positive, DEBIT negative)."""
    out: dict[str, float] = {o: 0.0 for o in org_ids}
    if not org_ids:
        return out
    rows = query(
        C.REVENUE_DB,
        {
            "source-table": C.REVENUE_TABLE,
            "aggregation": [["sum", _field(C.F_REV_USD)]],
            "breakout": [_field(C.F_REV_ORG), _field(C.F_REV_TYPE)],
            "filter": [
                "and",
                ["=", _field(C.F_REV_DELETED), False],
                _in(C.F_REV_ORG, org_ids),
            ],
            "limit": 5000,
        },
    )
    for org, rtype, amt in rows:
        amt = float(amt or 0)
        sign = -1.0 if str(rtype).upper() == "DEBIT" else 1.0
        out[org] = out.get(org, 0.0) + sign * amt
    return out


def monthly_revenue_by_org(org_ids: list[str]) -> dict[str, dict[str, float]]:
    """
    Net USD revenue per org per calendar month.
    Returns {org_id: {"YYYY-MM": net_usd, ...}}.
    Drives best-month, avg/active-month, current-month run-rate and the sparkline.
    """
    out: dict[str, dict[str, float]] = {o: {} for o in org_ids}
    if not org_ids:
        return out
    rows = query(
        C.REVENUE_DB,
        {
            "source-table": C.REVENUE_TABLE,
            "aggregation": [["sum", _field(C.F_REV_USD)]],
            "breakout": [
                _field(C.F_REV_ORG),
                _field(C.F_REV_TYPE),
                ["field", C.F_REV_DATE, {"temporal-unit": "month"}],
            ],
            "filter": [
                "and",
                ["=", _field(C.F_REV_DELETED), False],
                _in(C.F_REV_ORG, org_ids),
            ],
            "limit": 50000,
        },
    )
    for org, rtype, month_raw, amt in rows:
        if not month_raw:
            continue
        ym = str(month_raw)[:7]
        sign = -1.0 if str(rtype).upper() == "DEBIT" else 1.0
        bucket = out.setdefault(org, {})
        bucket[ym] = bucket.get(ym, 0.0) + sign * float(amt or 0)
    return out


# ---------------------------------------------------------------------------
# Transaction activity (org_analytics, DB 2, table 12)
# ---------------------------------------------------------------------------
def txn_activity_by_org(org_ids: list[str]) -> dict[str, dict]:
    """
    Per-org: total txn count, first txn date, last txn date.
    {org_id: {"count": int, "first": date|None, "last": date|None}}
    """
    out: dict[str, dict] = {o: {"count": 0, "first": None, "last": None} for o in org_ids}
    if not org_ids:
        return out
    rows = query(
        C.ANALYTICS_DB,
        {
            "source-table": C.ANALYTICS_TABLE,
            "aggregation": [
                ["sum", _field(C.F_AN_COUNT)],
                ["min", _field(C.F_AN_START)],
                ["max", _field(C.F_AN_START)],
            ],
            "breakout": [_field(C.F_AN_ORG)],
            "filter": [
                "and",
                ["=", _field(C.F_AN_DELETED), False],
                ["=", _field(C.F_AN_TIME_UNIT), "day"],
                _in(C.F_AN_ORG, org_ids),
            ],
            "limit": 5000,
        },
    )
    for org, cnt, first, last in rows:
        out[org] = {
            "count": int(cnt or 0),
            "first": _parse_date(first),
            "last": _parse_date(last),
        }
    return out


# ---------------------------------------------------------------------------
# KYB status (organization_kyb, DB 5, table 98)
# ---------------------------------------------------------------------------
def kyb_status_by_org(org_ids: list[str]) -> dict[str, str]:
    """Latest KYB status per org. Orgs with no row default to NOT_STARTED."""
    out: dict[str, str] = {o: "NOT_STARTED" for o in org_ids}
    if not org_ids:
        return out
    # status is single-valued per org row; aggregate by max(updated_at) is implicit
    # since each org has one active kyb row. We breakout by org + status.
    rows = query(
        C.KYB_DB,
        {
            "source-table": C.KYB_TABLE,
            "aggregation": [["max", _field(C.F_KYB_UPDATED)]],
            "breakout": [_field(C.F_KYB_ORG), _field(C.F_KYB_STATUS)],
            "filter": [
                "and",
                ["=", _field(C.F_KYB_DELETED), 0],
                _in(C.F_KYB_ORG, org_ids),
            ],
            "limit": 5000,
        },
    )
    # keep the status with the most recent updated_at per org
    latest: dict[str, tuple] = {}
    for org, status, updated in rows:
        key = updated or ""
        if org not in latest or str(key) > str(latest[org][1]):
            latest[org] = (status, key)
    for org, (status, _) in latest.items():
        out[org] = status or "NOT_STARTED"
    return out


# ---------------------------------------------------------------------------
# Partner hierarchy (organization, DB 5, table 105)
# ---------------------------------------------------------------------------
def partner_children(partner_ids: list[str]) -> dict[str, list[dict]]:
    """
    For each partner_id, return child orgs [{org_id, name, country}].
    A child is any org whose organization.partner_id == partner_id.
    """
    out: dict[str, list[dict]] = {p: [] for p in partner_ids if p}
    pids = [p for p in partner_ids if p]
    if not pids:
        return out
    rows = query(
        C.ORG_DB,
        {
            "source-table": C.ORG_TABLE,
            "breakout": [
                _field(C.F_ORG_PARTNER),
                _field(C.F_ORG_ID),
                _field(C.F_ORG_NAME),
                _field(C.F_ORG_COUNTRY),
            ],
            "aggregation": [["count"]],
            "filter": [
                "and",
                ["=", _field(C.F_ORG_DELETED), 0],
                _in(C.F_ORG_PARTNER, pids),
            ],
            "limit": 5000,
        },
    )
    for pid, oid, name, country, _cnt in rows:
        out.setdefault(pid, []).append({"org_id": oid, "name": name, "country": country})
    return out


def org_partner_ids(org_ids: list[str]) -> dict[str, str]:
    """org_id -> its own partner_id (if it is a partner). Empty string if none."""
    out: dict[str, str] = {o: "" for o in org_ids}
    if not org_ids:
        return out
    rows = query(
        C.ORG_DB,
        {
            "source-table": C.ORG_TABLE,
            "breakout": [_field(C.F_ORG_ID), _field(C.F_ORG_PARTNER)],
            "aggregation": [["count"]],
            "filter": [
                "and",
                ["=", _field(C.F_ORG_DELETED), 0],
                _in(C.F_ORG_ID, org_ids),
            ],
            "limit": 5000,
        },
    )
    for oid, pid, _cnt in rows:
        out[oid] = pid or ""
    return out


# ---------------------------------------------------------------------------
def _parse_date(raw):
    if not raw:
        return None
    try:
        return dt.date.fromisoformat(str(raw)[:10])
    except ValueError:
        return None
