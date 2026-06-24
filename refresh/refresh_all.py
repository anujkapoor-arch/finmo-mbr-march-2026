"""
Orchestrator: refresh every cohort dashboard end to end.

  python3 refresh_all.py            # all cohorts, write HTML + data, push Airtable
  python3 refresh_all.py --no-airtable
  python3 refresh_all.py --only live

Steps per run:
  1. Build enriched cohort data (HubSpot + Metabase joins).
  2. Write refresh/data/<cohort>.json  (durable raw snapshot).
  3. Render HTML into ../public/  (what the Lovable iframes read).
  4. Append a snapshot to Airtable base "Pipeline Health Snapshots" (history).

Requires the Finmo VPN (Metabase) and credentials in refresh/.env.
"""

import argparse
import json
import sys

import config as C
import enrich
import render

PAGE_FILES = {
    "live": ("merchant-adoption-live.html", "Live - Pipeline Health & Adoption",
             "Live cohort · why are activated merchants not transacting?"),
    "closed-won-activation": ("closed-won-activation.html",
                              "Closed Won/Activation - Pipeline Health & Adoption",
                              "Closed Won / Activation cohort · adoption gap analysis"),
    "offboarded": ("merchant-adoption-offboarded.html",
                   "Offboarded - Pipeline Health & Adoption",
                   "Offboarded cohort · MRR lost + historical revenue"),
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="refresh a single cohort key")
    ap.add_argument("--no-airtable", action="store_true", help="skip Airtable snapshot push")
    args = ap.parse_args()

    cohort_keys = [args.only] if args.only else list(C.COHORT_STAGES.keys())
    C.DATA_DIR.mkdir(exist_ok=True)

    built: dict[str, dict] = {}
    for key in cohort_keys:
        print(f"→ building cohort: {key}")
        data = enrich.build_cohort(key)
        built[key] = data
        (C.DATA_DIR / f"{key}.json").write_text(json.dumps(data, indent=2, default=str))
        s = data["summary"]
        print(f"   {s['deals']} deals · booked {s['booked_mrr']:,.0f} · "
              f"realized {s['revenue_realized']:,.0f} · "
              f"{s['revenue_generating']} revenue-generating · {s['dormant']} dormant")

        if key in PAGE_FILES:
            fname, title, subtitle = PAGE_FILES[key]
            (C.PUBLIC_DIR / fname).write_text(render.render_cohort_page(data, title, subtitle))
            print(f"   wrote public/{fname}")

    # Tabbed cross-cohort page (only when we have the full set)
    ph_cohorts = {k: built[k] for k in ("closed-won-activation", "live", "offboarded") if k in built}
    if ph_cohorts:
        (C.PUBLIC_DIR / "pipeline-health.html").write_text(render.render_pipeline_health(ph_cohorts))
        print("   wrote public/pipeline-health.html")

    if not args.no_airtable:
        try:
            import lib_airtable
            for key, data in built.items():
                n = lib_airtable.push_snapshot(data)
                print(f"   Airtable: pushed snapshot for {key} ({n} deal rows)")
        except Exception as e:  # noqa: BLE001 - Airtable is best-effort history
            print(f"   ! Airtable push skipped: {e}", file=sys.stderr)

    print("done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
