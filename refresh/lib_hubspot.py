"""
HubSpot data access (read-only) for the Sales Deals pipeline.

Pulls deals for a given stage (cohort), with the org_id property that joins to
Metabase, plus amount / hs_mrr / owner / country.
"""

import requests

import config as C

_TIMEOUT = 60
_HEADERS = {
    "Authorization": f"Bearer {C.HUBSPOT_TOKEN}",
    "Content-Type": "application/json",
}

_owner_cache: dict[str, str] = {}


def _owner_name(owner_id: str) -> str:
    if not owner_id:
        return ""
    if owner_id in C.KNOWN_OWNERS:
        return C.KNOWN_OWNERS[owner_id]
    if owner_id in _owner_cache:
        return _owner_cache[owner_id]
    try:
        r = requests.get(
            f"{C.HUBSPOT_BASE}/crm/v3/owners/{owner_id}",
            headers=_HEADERS,
            timeout=_TIMEOUT,
        )
        if r.ok:
            d = r.json()
            name = " ".join(x for x in [d.get("firstName"), d.get("lastName")] if x).strip()
            name = name or d.get("email", owner_id)
        else:
            name = owner_id
    except requests.RequestException:
        name = owner_id
    _owner_cache[owner_id] = name
    return name


def deals_in_stages(stage_ids: list[str]) -> list[dict]:
    """
    Return all deals in the Sales Deals pipeline whose dealstage is in stage_ids.
    Each deal: normalised dict with the fields the dashboards need.
    """
    body = {
        "filterGroups": [
            {
                "filters": [
                    {"propertyName": "pipeline", "operator": "EQ", "value": C.SALES_PIPELINE_ID},
                    {"propertyName": "dealstage", "operator": "IN", "values": stage_ids},
                ]
            }
        ],
        "properties": C.HUBSPOT_DEAL_PROPS,
        "limit": 100,
    }
    results: list[dict] = []
    after = None
    while True:
        if after:
            body["after"] = after
        r = requests.post(
            f"{C.HUBSPOT_BASE}/crm/v3/objects/deals/search",
            headers=_HEADERS,
            json=body,
            timeout=_TIMEOUT,
        )
        r.raise_for_status()
        data = r.json()
        for d in data.get("results", []):
            results.append(_normalise(d))
        paging = data.get("paging", {}).get("next", {})
        after = paging.get("after")
        if not after:
            break
    return results


def _to_float(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _normalise(deal: dict) -> dict:
    p = deal.get("properties", {})
    owner_id = p.get("hubspot_owner_id") or ""
    amount = _to_float(p.get("amount"))
    mrr = _to_float(p.get("hs_mrr")) or _to_float(p.get("hs_deal_registration_mrr"))
    # Forecast MRR falls back to deal amount when no explicit MRR is set (matches
    # the original dashboards, which treated deal `amount` as booked MRR).
    forecast_mrr = mrr or amount
    return {
        "deal_id": deal.get("id"),
        "deal_name": p.get("dealname") or "(unnamed deal)",
        "stage_id": p.get("dealstage"),
        "stage": C.SALES_STAGES.get(p.get("dealstage"), p.get("dealstage")),
        "org_id": (p.get("org_id") or "").strip(),
        "org_name": p.get("org_name") or p.get("merchant_or_partner_name") or "",
        "ae_name": _owner_name(owner_id),
        "owner_id": owner_id,
        "amount": amount,
        "mrr": mrr,
        "forecast_mrr": forecast_mrr,
        "close_date": (p.get("closedate") or "")[:10],
        "country": (p.get("country") or "").strip(),
        "merchant_status": p.get("merchant_status") or "",
        "industry": p.get("merchant_industry") or "",
        "hubspot_url": C.HUBSPOT_DEAL_URL.format(deal_id=deal.get("id")),
    }
