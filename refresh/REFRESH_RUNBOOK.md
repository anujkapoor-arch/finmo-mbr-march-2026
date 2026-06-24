# Pipeline Health / Merchant Adoption — Dashboard Refresh Runbook

This toolkit regenerates the revenue / adoption dashboards in `mbr-dashboard` from
live data (HubSpot + Metabase + Airtable). It was rebuilt on **2026-06-24** after the
original generator scripts were lost; this folder is now the canonical, version-controlled
source of truth so it can never be lost again.

## What it produces

| Dashboard | React wrapper | Static HTML (iframed) | Cohort |
|---|---|---|---|
| Live | `src/MerchantAdoptionLive.tsx` | `public/merchant-adoption-live.html` | Sales Deals → Live |
| Closed Won / Activation | `src/MerchantAdoptionClosedWon.tsx` | `public/closed-won-activation.html` | Sales Deals → Closed Won/Activation |
| Offboarded | (add a wrapper if needed) | `public/merchant-adoption-offboarded.html` | Sales Deals → Offboarded |
| Pipeline Health (tabbed) | `src/PipelineHealth.tsx` | `public/pipeline-health.html` | all three, as tabs |

Each dashboard tracks the four things leadership asked for:
**transaction activity · actual revenue vs forecast MRR · KYB status · offboarding**.

The React components are thin wrappers that `<iframe>` the static HTML in `public/`.
All data is baked into the HTML at generation time (rows are server-rendered Python),
so "updating the data" = re-running this toolkit and committing the regenerated HTML.

## TL;DR — refresh everything

```bash
# 1. Connect to the Finmo VPN (Metabase is internal).
# 2. Run:
cd mbr-dashboard/refresh
python3 refresh_all.py            # all cohorts: HTML + data JSON + Airtable snapshot
# 3. Commit the regenerated public/*.html and refresh/data/*.json
git add ../public/*.html data/*.json && git commit -m "Refresh dashboard data <date>"
git push                          # Lovable redeploys from origin/main
```

Useful flags:
- `python3 refresh_all.py --only live` — one cohort.
- `python3 refresh_all.py --no-airtable` — regenerate HTML without appending Airtable history.

Requires Python `requests` (`pip3 install requests`).

## Architecture

```
HubSpot (deals + org_id)  ─┐
Metabase DB 14 (revenue)   ├─► enrich.build_cohort() ─► refresh/data/<cohort>.json
Metabase DB 2  (txn count) │            │
Metabase DB 5  (KYB, org)  ─┘            ├─► render.py ─► public/*.html  (the dashboards)
                                         └─► lib_airtable.push_snapshot ─► Airtable history
```

### Files

| File | Role |
|---|---|
| `config.py` | All IDs + credential loading. The data dictionary lives here. |
| `.env` | Credentials (gitignored). Canonical copies in project `MEMORY.md`. |
| `lib_hubspot.py` | Fetch Sales Deals by stage with `org_id`, amount, MRR, owner, country. |
| `lib_metabase.py` | Read-only MBQL: net revenue, monthly revenue, txn activity, KYB status, partner children. |
| `lib_airtable.py` | Append-only snapshot push to base "Pipeline Health Snapshots". |
| `enrich.py` | Join HubSpot↔Metabase, classify buckets, roll up the cohort summary. |
| `render.py` | Reproduce the dashboards' HTML from enriched data. |
| `refresh_all.py` | Orchestrator. |
| `templates/_head.html` | Shared `<head>`+CSS, extracted verbatim from the original dashboard. |
| `templates/_footer_script.html` | Client-side table-sort script. |
| `data/<cohort>.json` | Durable raw enriched snapshot for each refresh. |

## Data sources & IDs (full data dictionary in `config.py`)

### HubSpot
- Token: `HUBSPOT_TOKEN` (env / `.env`). Pipeline **712777261** "Sales Deals".
- Join key: the deal property **`org_id`** → Metabase org_id.
- Cohort = dealstage: Closed Won/Activation `1041148499`, Live `2971347643`, Offboarded `3482930895`.
- Forecast MRR = `hs_mrr`, falling back to deal `amount` (matches original behaviour).

### Metabase (read-only, VPN required — see `metabase-safety-rules` in MEMORY.md)
- `POST https://reports.finmo.net/api/dataset`, header `x-api-key`. MBQL only, always batched + capped.
- **revenue** DB14 t242 — net USD = Σ(CREDIT) − Σ(DEBIT) by `source_org_id`; also monthly for best-month / run-rate / sparkline.
- **org_analytics** DB2 t12 — txn `total_count`, first/last txn via min/max `start_time`, `time_unit='day'`.
- **organization_kyb** DB5 t98 — latest `status` per org (NOT_STARTED … APPROVED/REJECTED).
- **organization** DB5 t105 — `partner_id` for partner→child expansion.

### Airtable — base `appzjic6aRCatDK0o` "Pipeline Health Snapshots"
- Append-only. Each run adds 1 `Snapshots` row + N `Deal Snapshots` rows per cohort, stamped `Refreshed At`.
- Lovable reads the latest snapshot per cohort for the "last updated" timestamp + change history.
- `typecast: true` so new select values are accepted gracefully.

## Classification rules (in `enrich.py`)

- **Journey lane (Section 1):** REJECTED → *KYB rejected*; NOT_STARTED/STARTED → *KYB not submitted*;
  approved + txns → *Transacting*; approved + 0 txns → *No adoption*.
- **Activity bucket (Section 5):** 0 txns → *Activated, No Txn* (if approved) / *No Txn*;
  revenue + last txn ≤ 30d → *Revenue Generating*; revenue + last txn > 30d → *Revenue, Gone Dormant*;
  txns but ~no revenue → *Transacting, No Revenue*.
- **Offboarding status:** Offboarded stage → *Offboarded*; REJECTED → *Compliance Blocked*; else *Active*.
- **Revenue loss:** forecast MRR × months since close, only for KYB-approved + zero-txn deals.
- Dormancy threshold: `DORMANCY_DAYS = 30` in `config.py`.

## Adding a new cohort / dashboard

1. Add the stage to `COHORT_STAGES` in `config.py` (and `PAGE_FILES` in `refresh_all.py` for a standalone page).
2. The cohort row should already exist in the Airtable `Cohorts` table; if not, add it.
3. Run `python3 refresh_all.py --only <key>`.

## Last manual refresh

- **2026-06-24** — first run of the rebuilt toolkit. Results: Live 75 deals / $1.59M realized,
  CWA 35 deals, Offboarded 16 deals. Replaced the stale 2026-05-06 / 2026-05-14 snapshots.

## Gotchas

- Metabase needs the VPN; a hang or empty body usually means VPN is down.
- `is_deleted` is **integer 0/1** on DB5 tables (organization, organization_kyb) but **boolean**
  on the revenue/analytics tables — `config.py`/`lib_metabase.py` already handle each correctly.
- Some HubSpot deals have no `org_id` → they appear with zero revenue/txns until the property is set.
- Do not edit/delete Metabase saved questions. `POST /api/dataset` only.
