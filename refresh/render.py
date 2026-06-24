"""
HTML renderers that reproduce the Pipeline Health / Merchant Adoption dashboards
from enriched cohort data (enrich.build_cohort).

All pages share one stylesheet: refresh/templates/_head.html (extracted verbatim
from the original merchant-adoption-live.html so styling is identical). The sortable
table footer script comes from templates/_footer_script.html.

Public entry points:
- render_cohort_page(cohort_data, title, subtitle, source_line) -> full HTML string
- render_pipeline_health(cohorts_by_key) -> tabbed cross-cohort HTML string
"""

import datetime as dt
import html

import config as C

_HEAD = (C.TEMPLATE_DIR / "_head.html").read_text()
_FOOT_SCRIPT = (C.TEMPLATE_DIR / "_footer_script.html").read_text()

LANES = ["KYB rejected", "KYB not submitted", "No adoption", "Transacting"]
LANE_CLASS = {"KYB rejected": "bad", "KYB not submitted": "warn",
              "No adoption": "warn", "Transacting": "ok"}
LANE_HINT = {
    "KYB rejected": "compliance rejected - cannot transact",
    "KYB not submitted": "KYB never started or in progress",
    "No adoption": "KYB approved but zero transactions",
    "Transacting": "live and processing volume",
}
ACTIVITY_BUCKETS = ["Revenue Generating", "Revenue, Gone Dormant",
                    "Transacting, No Revenue", "Activated, No Txn", "No Txn"]
ACTIVITY_CLASS = {"Revenue Generating": "ok", "Revenue, Gone Dormant": "warn",
                  "Transacting, No Revenue": "warn", "Activated, No Txn": "bad",
                  "No Txn": "muted"}


# ---------------------------------------------------------------------------
# small helpers
# ---------------------------------------------------------------------------
def _e(s) -> str:
    return html.escape(str(s if s is not None else ""))


def _usd(v) -> str:
    return "${:,.0f}".format(v or 0)


def _usd2(v) -> str:
    return "${:,.2f}".format(v or 0)


def _ago(iso: str) -> str:
    if not iso:
        return "—"
    try:
        d = dt.date.fromisoformat(iso[:10])
    except (ValueError, TypeError):
        return "—"
    days = (dt.date.today() - d).days
    return f"{iso[:10]} ({days}d ago)"


def _link(deal) -> str:
    return f'<a href="{_e(deal["hubspot_url"])}" target="_blank">{_e(deal["deal_name"])}</a>'


def _pill(text: str, cls: str) -> str:
    return f'<span class="pill {cls}">{_e(text)}</span>'


def _spark(trend: list) -> str:
    if not trend:
        return "—"
    mx = max(trend) or 1
    bars = "".join(
        f'<span class="sw" style="height:{max(2, round(100*v/mx))}%"></span>' for v in trend
    )
    return f'<div class="spark">{bars}</div>'


# ---------------------------------------------------------------------------
# sections
# ---------------------------------------------------------------------------
def _kpis(s: dict, cohort_label: str) -> str:
    cards = [
        ("Deals", str(s["deals"]), cohort_label),
        ("Booked (HS)", _usd(s["booked_mrr"]), "HubSpot deal value"),
        ("Revenue realized", _usd(s["revenue_realized"]), "Net USD, Metabase DB 14"),
        ("Not transacting", str(s["not_transacting"]), f"{s['not_transacting_pct']}% of deals"),
        ("Blocked / off", str(s["blocked_off"]), f"{s['blocked_off_pct']}% of deals"),
    ]
    inner = "".join(
        f'<div class="kpi"><div class="l">{_e(l)}</div><div class="v">{_e(v)}</div>'
        f'<div class="x">{_e(x)}</div></div>'
        for l, v, x in cards
    )
    return f'<div class="kpis">{inner}</div>'


def _banner(s: dict) -> str:
    return (
        '<div class="banner bad">'
        f'<b>{s["not_transacting"]} of {s["deals"]} deals never transacted</b>; '
        f'another <b>{s["dormant"]}</b> generated revenue but went dormant in '
        f'{C.DORMANCY_DAYS}+ days. '
        f'<b>{s["approved_zero_txn"]}</b> KYB-approved deals have zero transactions, '
        f'a projected <b>{_usd(s["projected_loss"])}</b> in lost run-rate. '
        f'Only <b>{s["revenue_generating"]}</b> deals are currently active and '
        f'revenue-positive. Adoption gap is the dominant pipeline-health story.'
        '</div>'
    )


def _journey_kanban(deals: list) -> str:
    cols = []
    for lane in LANES:
        members = [d for d in deals if d["journey_lane"] == lane]
        mrr = sum(d["forecast_mrr"] for d in members)
        cards = "".join(_journey_card(d) for d in members)
        cols.append(
            f'<div class="diag-col {LANE_CLASS[lane]}">'
            f'<div class="h"><div><div class="l">{_e(lane)} · '
            f'<span class="mrr-chip">{_usd2(mrr)} MRR</span></div>'
            f'<div class="x">{_e(LANE_HINT[lane])}</div></div>'
            f'<div class="n">{len(members)}</div></div>{cards}</div>'
        )
    return (
        f'<section class="tight"><h2 class="section-title">1 · Customer journey pipeline '
        f'<span class="count">{len(deals)} deals</span> '
        f'<span class="hint">end-to-end: KYB rejected → not submitted → no adoption → transacting</span></h2>'
        f'<div class="diag-grid pipe4">{"".join(cols)}</div></section>'
    )


def _journey_card(d: dict) -> str:
    pclass = " partner" if d["is_partner"] else ""
    return (
        f'<div class="card{pclass}">'
        f'<span class="name">{_link(d)}</span>'
        f'<div class="meta"><span>{_e(d["org_id"][:20] or "no org")}</span>'
        f'<span><span class="rev">{_usd(d["net_revenue_usd"])}</span> · '
        f'{d["txn_count"]:,} txns</span></div>'
        f'<div class="meta"><span>closed {_e(d["close_date"] or "—")}</span>'
        f'<span class="age">last txn: {_e((d["last_txn"] or "—"))}</span></div>'
        f'</div>'
    )


def _kyb_kanban(deals: list) -> str:
    present = [s for s in C.KYB_STATUSES if any(d["kyb_status"] == s for d in deals)]
    present += sorted({d["kyb_status"] for d in deals if d["kyb_status"] not in C.KYB_STATUSES})
    cols = []
    for status in present:
        members = [d for d in deals if d["kyb_status"] == status]
        cards = "".join(
            f'<div class="card{" partner" if d["is_partner"] else ""}">'
            f'<span class="name">{_link(d)}</span>'
            f'<div class="meta"><span>{_e(d["org_id"][:18] or "—")}</span>'
            f'<span>{d["txn_count"]:,} txns</span></div></div>'
            for d in members
        )
        cols.append(
            f'<div class="col"><div class="col-head">{_e(status)} '
            f'<span class="count">{len(members)}</span></div>'
            f'<div class="col-body">{cards}</div></div>'
        )
    return (
        f'<section><h2 class="section-title">4 · KYB status kanban '
        f'<span class="count">{len(deals)} deals</span> '
        f'<span class="hint">field: organization_kyb.status</span></h2>'
        f'<div class="kanban" style="--cols:{len(present) or 1}">{"".join(cols)}</div></section>'
    )


def _activity_kanban(deals: list) -> str:
    cols = []
    for bucket in ACTIVITY_BUCKETS:
        members = [d for d in deals if d["activity_bucket"] == bucket]
        mrr = sum(d["forecast_mrr"] for d in members)
        cards = "".join(
            f'<div class="card"><span class="name">{_link(d)}</span>'
            f'<div class="meta"><span>{_e(d["ae_name"] or "—")}</span>'
            f'<span>{_usd(d["forecast_mrr"])}</span></div></div>'
            for d in members
        )
        cols.append(
            f'<div class="col"><div class="col-head {ACTIVITY_CLASS[bucket]}">{_e(bucket)} '
            f'<span class="count">{len(members)} · {_usd(mrr)}</span></div>'
            f'<div class="col-body">{cards}</div></div>'
        )
    return (
        f'<section><h2 class="section-title">5 · Transaction activity</h2>'
        f'<div class="kanban" style="--cols:{len(ACTIVITY_BUCKETS)}">{"".join(cols)}</div></section>'
    )


def _transacted_table(deals: list) -> str:
    rows_data = sorted(
        [d for d in deals if d["kyb_status"] in C.KYB_APPROVED and d["txn_count"] > 0],
        key=lambda d: -d["net_revenue_usd"],
    )
    body = ""
    for d in rows_data:
        att = d["attainment_pct"]
        cls = "ok" if att >= 80 else ("warn" if att >= 30 else "bad")
        body += (
            f'<tr><td>{_link(d)}<br><span class="muted">{_e(d["org_id"][:24])}</span></td>'
            f'<td class="num">{d["txn_count"]:,}</td>'
            f'<td>{_e(_ago(d["first_txn"]))}</td>'
            f'<td>{_e(_ago(d["last_txn"]))}</td>'
            f'<td class="num">{_usd(d["net_revenue_usd"])}</td>'
            f'<td class="num">{_usd(d["avg_active_month_usd"])}</td>'
            f'<td class="num">{_usd(d["forecast_mrr"])}</td>'
            f'<td class="num">{_pill(f"{att:.0f}%", cls)}</td></tr>'
        )
    tot_rev = sum(d["net_revenue_usd"] for d in rows_data)
    return (
        f'<section><h2 class="section-title">2 · KYB-approved orgs that have transacted '
        f'<span class="count">{len(rows_data)}</span></h2>'
        f'<table class="sortable"><thead><tr><th>Deal · Org</th><th class="num">Txns</th>'
        f'<th>First txn</th><th>Last txn</th><th class="num">Total rev</th>'
        f'<th class="num">Avg/mo</th><th class="num">Forecast MRR</th>'
        f'<th class="num">Attainment</th></tr></thead><tbody>{body}</tbody>'
        f'<tfoot><tr><td>TOTAL ({len(rows_data)} orgs)</td><td></td><td></td><td></td>'
        f'<td class="num">{_usd(tot_rev)}</td><td></td><td></td><td></td></tr></tfoot>'
        f'</table></section>'
    )


def _zero_txn_table(deals: list) -> str:
    rows_data = sorted(
        [d for d in deals if d["kyb_status"] in C.KYB_APPROVED and d["txn_count"] == 0],
        key=lambda d: -d["revenue_loss_usd"],
    )
    body = ""
    for d in rows_data:
        body += (
            f'<tr><td>{_link(d)}<br><span class="muted">{_e(d["org_id"][:24])}</span></td>'
            f'<td>{_e(_ago(d["close_date"]))}</td>'
            f'<td class="num">{d["months_elapsed"]:.1f}</td>'
            f'<td class="num">{_usd(d["forecast_mrr"])}</td>'
            f'<td class="num"><b>{_usd(d["revenue_loss_usd"])}</b></td></tr>'
        )
    tot_loss = sum(d["revenue_loss_usd"] for d in rows_data)
    return (
        f'<section><h2 class="section-title">3 · KYB-approved orgs with zero transactions '
        f'<span class="count">{len(rows_data)}</span> '
        f'<span class="hint">revenue loss = forecast MRR × months elapsed since closed-won</span></h2>'
        f'<table class="sortable"><thead><tr><th>Deal · Org</th><th>Closed-won date</th>'
        f'<th class="num">Months elapsed</th><th class="num">Forecast MRR</th>'
        f'<th class="num">Revenue loss</th></tr></thead><tbody>{body}</tbody>'
        f'<tfoot><tr><td>TOTAL ({len(rows_data)} orgs)</td><td></td><td></td><td></td>'
        f'<td class="num">{_pill(_usd(tot_loss), "bad")}</td></tr></tfoot>'
        f'</table></section>'
    )


def _forecast_vs_actual(deals: list) -> str:
    rows_data = sorted(
        [d for d in deals if d["net_revenue_usd"] > 0 or d["offboarding_status"] != "Active"],
        key=lambda d: -d["forecast_mrr"],
    )
    body = ""
    for d in rows_data:
        if d["offboarding_status"] != "Active":
            state = _pill(d["offboarding_status"].upper(), "bad")
        elif d["net_revenue_usd"] > 0:
            state = _pill("ACTIVE", "ok")
        else:
            state = _pill("NO REV", "muted")
        bvf = (100 * d["best_month_usd"] / d["forecast_mrr"]) if d["forecast_mrr"] else 0
        bvf_cls = "ok" if bvf >= 100 else ("warn" if bvf >= 30 else "bad")
        body += (
            f'<tr><td>{_link(d)}</td><td>{state}</td>'
            f'<td class="num">{_usd(d["forecast_mrr"])}</td>'
            f'<td class="num">{_usd(d["best_month_usd"])}</td>'
            f'<td class="num">{_usd(d["avg_active_month_usd"])}</td>'
            f'<td class="num">{_usd(d["net_revenue_usd"])}</td>'
            f'<td class="num">{d["active_months"]}</td>'
            f'<td>{_spark(d["trend"])}</td>'
            f'<td class="num">{_pill(f"{bvf:.0f}%", bvf_cls)}</td></tr>'
        )
    n_off = sum(1 for d in rows_data if d["offboarding_status"] != "Active")
    n_active = sum(1 for d in rows_data if d["net_revenue_usd"] > 0)
    return (
        f'<section><h2 class="section-title">6 · Forecast MRR vs actual · revenue + offboarded '
        f'<span class="count">{len(rows_data)} deals</span></h2>'
        f'<table class="sortable"><thead><tr><th>Deal</th><th>State</th>'
        f'<th class="num">Forecast MRR</th><th class="num">Best month</th>'
        f'<th class="num">Avg / active mo</th><th class="num">Lifetime net</th>'
        f'<th class="num">Active mo</th><th>Trend (≤12 mo)</th>'
        f'<th class="num">Best vs forecast</th></tr></thead><tbody>{body}</tbody>'
        f'<tfoot><tr><td>TOTAL ({len(rows_data)} deals · {n_off} offboarded · '
        f'{n_active} active w/ rev)</td><td></td><td></td><td></td><td></td><td></td>'
        f'<td></td><td></td><td></td></tr></tfoot></table></section>'
    )


def _ae_breakdown(deals: list) -> str:
    by_ae: dict[str, list] = {}
    for d in deals:
        by_ae.setdefault(d["ae_name"] or "(unassigned)", []).append(d)
    body = ""
    for ae, members in sorted(by_ae.items(), key=lambda kv: -len(kv[1])):
        booked = sum(m["forecast_mrr"] for m in members)
        realized = sum(m["net_revenue_usd"] for m in members if m["net_revenue_usd"] > 0)
        transacting = sum(1 for m in members if m["txn_count"] > 0)
        no_adopt = sum(1 for m in members if m["journey_lane"] == "No adoption")
        rejected = sum(1 for m in members if m["kyb_status"] == "REJECTED")
        off = sum(1 for m in members if m["offboarding_status"] != "Active")
        nonperf = round(100 * (no_adopt + rejected + off) / len(members)) if members else 0
        cls = "bad" if nonperf >= 50 else ("warn" if nonperf >= 25 else "ok")
        body += (
            f'<tr><td>{_e(ae)}</td><td class="num">{len(members)}</td>'
            f'<td class="num">{_usd(booked)}</td><td class="num">{_usd(realized)}</td>'
            f'<td class="num">{transacting}</td><td class="num">{no_adopt}</td>'
            f'<td class="num">{rejected}</td><td class="num">{off}</td>'
            f'<td class="num">{_pill(f"{nonperf}%", cls)}</td></tr>'
        )
    return (
        f'<section><h2 class="section-title">7 · AE breakdown</h2>'
        f'<table class="sortable"><thead><tr><th>AE</th><th class="num">Deals</th>'
        f'<th class="num">Booked</th><th class="num">Realized</th>'
        f'<th class="num">Transacting</th><th class="num">No adoption</th>'
        f'<th class="num">KYB rejected</th><th class="num">Offboarded</th>'
        f'<th class="num">Non-perf %</th></tr></thead><tbody>{body}</tbody></table></section>'
    )


def _all_deals_table(deals: list) -> str:
    body = ""
    for d in sorted(deals, key=lambda d: -d["forecast_mrr"]):
        act_cls = ACTIVITY_CLASS.get(d["activity_bucket"], "muted")
        off_cls = "ok" if d["offboarding_status"] == "Active" else "bad"
        body += (
            f'<tr><td>{_link(d)}</td><td>{_e(d["ae_name"] or "—")}</td>'
            f'<td class="num">{_usd(d["forecast_mrr"])}</td>'
            f'<td class="num">{_usd(d["net_revenue_usd"])}</td>'
            f'<td>{_pill(d["activity_bucket"], act_cls)}</td>'
            f'<td>{_pill(d["offboarding_status"], off_cls)}</td>'
            f'<td>{_e(d["kyb_status"])}</td>'
            f'<td>{_e(d["last_txn"] or "")}</td>'
            f'<td><code>{_e(d["country"] or "—")}</code></td></tr>'
        )
    return (
        f'<section><h2 class="section-title">8 · All deals '
        f'<span class="count">{len(deals)}</span> '
        f'<span class="hint">click a header to sort</span></h2>'
        f'<table class="sortable"><thead><tr><th>Deal</th><th>AE</th>'
        f'<th class="num">Forecast MRR</th><th class="num">Revenue</th>'
        f'<th>Activity</th><th>Offboarding</th><th>KYB</th><th>Last txn</th>'
        f'<th>Country</th></tr></thead><tbody>{body}</tbody></table></section>'
    )


def _all_sections(data: dict) -> str:
    deals = data["deals"]
    return "".join([
        _journey_kanban(deals),
        _transacted_table(deals),
        _zero_txn_table(deals),
        _kyb_kanban(deals),
        _activity_kanban(deals),
        _forecast_vs_actual(deals),
        _ae_breakdown(deals),
        _all_deals_table(deals),
    ])


# ---------------------------------------------------------------------------
# pages
# ---------------------------------------------------------------------------
def render_cohort_page(data: dict, title: str, subtitle: str) -> str:
    s = data["summary"]
    snapshot = data["generated_at"]
    src = f"Snapshot: {snapshot} · Sources: HubSpot · Metabase (DB 2/5/14) · Airtable"
    header = (
        f'<div class="topbar"><div><b>{_e(title)}</b> '
        f'<span class="sub">{_e(subtitle)}</span></div>'
        f'<div class="refresh">{_e(src)}</div></div>'
    )
    body = (
        f'<section><div class="info">{header}</div>{_kpis(s, title)}{_banner(s)}</section>'
        f'{_all_sections(data)}'
    )
    return _page(title, body)


def render_pipeline_health(cohorts: dict) -> str:
    """Tabbed cross-cohort page. cohorts = {key: data} for cwa/live/offboarded."""
    order = [("closed-won-activation", "Closed Won / Activation"),
             ("live", "Live"), ("offboarded", "Offboarded")]
    order = [(k, lbl) for k, lbl in order if k in cohorts]
    tabs = "".join(
        f'<button class="tab-btn{" active" if i == 0 else ""}" data-tab="{k}">'
        f'{_e(lbl)} <span class="count">{cohorts[k]["summary"]["deals"]}</span></button>'
        for i, (k, lbl) in enumerate(order)
    )
    panels = ""
    for i, (k, lbl) in enumerate(order):
        data = cohorts[k]
        s = data["summary"]
        panels += (
            f'<div class="tab-panel" id="tab-{k}" style="display:{"block" if i == 0 else "none"}">'
            f'{_kpis(s, lbl)}{_banner(s)}{_all_sections(data)}</div>'
        )
    snapshot = next(iter(cohorts.values()))["generated_at"]
    header = (
        f'<div class="topbar"><div><b>Pipeline Health &amp; Adoption</b> '
        f'<span class="sub">Why are activated merchants not transacting? · '
        f'KYB · Compliance · Activity · Partner channel</span></div>'
        f'<div class="refresh">Snapshot: {_e(snapshot)} · Sources: HubSpot · '
        f'Metabase (DB 2/5/14) · Airtable</div></div>'
    )
    tab_css = (
        '<style>.tabs{display:flex;gap:8px;padding:12px 24px;flex-wrap:wrap}'
        '.tab-btn{border:1px solid #ece7f5;background:#fff;border-radius:8px;'
        'padding:6px 14px;font-size:13px;font-weight:600;color:#5a36a6;cursor:pointer}'
        '.tab-btn.active{background:#5a36a6;color:#fff}</style>'
    )
    tab_js = (
        '<script>document.querySelectorAll(".tab-btn").forEach(b=>{'
        'b.onclick=()=>{document.querySelectorAll(".tab-btn").forEach(x=>x.classList.remove("active"));'
        'b.classList.add("active");'
        'document.querySelectorAll(".tab-panel").forEach(p=>p.style.display="none");'
        'document.getElementById("tab-"+b.dataset.tab).style.display="block";};});</script>'
    )
    body = (
        f'<section><div class="info">{header}</div></section>'
        f'{tab_css}<div class="tabs">{tabs}</div>{panels}{tab_js}'
    )
    return _page("Pipeline Health & Adoption", body)


def _page(title: str, body: str) -> str:
    head = _HEAD.replace("<title>", f"<!-- generated {dt.datetime.utcnow():%Y-%m-%d %H:%M UTC} --><title>", 1)
    return f"{head}\n{body}\n{_FOOT_SCRIPT}\n</body></html>"
