"""
Central configuration for the Pipeline Health / Merchant Adoption dashboard refresh.

All IDs (HubSpot pipelines/stages/properties, Metabase DB/table/field IDs, Airtable
base/tables) live here so the rest of the toolkit never hard-codes a magic number.

Credentials are read from environment variables, falling back to refresh/.env.
See REFRESH_RUNBOOK.md for the full data dictionary.
"""

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Credential loading (env first, then refresh/.env)
# ---------------------------------------------------------------------------
_ENV_FILE = Path(__file__).resolve().parent / ".env"


def _load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        os.environ.setdefault(key.strip(), val.strip())


_load_dotenv(_ENV_FILE)


def _require(name: str) -> str:
    val = os.environ.get(name)
    if not val:
        raise RuntimeError(
            f"Missing credential {name}. Set it in refresh/.env or the environment. "
            f"Canonical values are in the project MEMORY.md."
        )
    return val


HUBSPOT_TOKEN = _require("HUBSPOT_TOKEN")
METABASE_API_KEY = _require("METABASE_API_KEY")
AIRTABLE_PAT = _require("AIRTABLE_PAT")

# ---------------------------------------------------------------------------
# Output paths
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parent.parent          # mbr-dashboard/
PUBLIC_DIR = REPO_ROOT / "public"                           # where the iframes read from
DATA_DIR = Path(__file__).resolve().parent / "data"        # raw enriched JSON snapshots
TEMPLATE_DIR = Path(__file__).resolve().parent / "templates"

# ---------------------------------------------------------------------------
# HubSpot
# ---------------------------------------------------------------------------
HUBSPOT_BASE = "https://api.hubapi.com"

SALES_PIPELINE_ID = "712777261"          # "Sales Deals"
KYB_TRACKER_PIPELINE_ID = "1225454307"   # "KYB tracker" (operations)

# Sales Deals stage_id -> human label
SALES_STAGES = {
    "1041148494": "Discovery",
    "1041148495": "Qualified To Buy",
    "1041148498": "KYB",
    "1041148496": "Contract/Commercial",
    "1041148499": "Closed Won/Activation",
    "2971347643": "Live",
    "1041148500": "Closed Lost",
    "1041183495": "Re-Engage",
    "3482930895": "Offboarded",
}

# Cohort key -> the Sales Deals stage(s) it is built from
COHORT_STAGES = {
    "closed-won-activation": ["1041148499"],
    "live": ["2971347643"],
    "offboarded": ["3482930895"],
}

# Deal properties to fetch
HUBSPOT_DEAL_PROPS = [
    "dealname",
    "amount",
    "hs_mrr",
    "hs_deal_registration_mrr",
    "dealstage",
    "pipeline",
    "closedate",
    "hubspot_owner_id",
    "org_id",
    "org_name",
    "merchant_or_partner_name",
    "merchant_status",
    "country",
    "merchant_industry",
]

# HubSpot owner_id -> AE name (extend as the team grows; unknown ids fall back to the
# owner's HubSpot first/last name fetched live).
KNOWN_OWNERS = {
    "159405535": "Harini",
    "159199727": "Sukriti",
}

# ---------------------------------------------------------------------------
# Metabase
# ---------------------------------------------------------------------------
METABASE_BASE = "https://reports.finmo.net"
METABASE_DATASET = f"{METABASE_BASE}/api/dataset"

# revenue (DB 14, table 242) -- USD-normalised revenue recognition, CREDIT/DEBIT
REVENUE_DB = 14
REVENUE_TABLE = 242
F_REV_ORG = 8020            # source_org_id
F_REV_DATE = 8011           # revenue_date
F_REV_TYPE = 8003           # type (CREDIT / DEBIT)
F_REV_USD = 8019            # revenue_amount_in_usd
F_REV_DELETED = 8008        # is_deleted (boolean)

# org_analytics (DB 2, table 12) -- daily aggregated txn counts/volumes/fees
ANALYTICS_DB = 2
ANALYTICS_TABLE = 12
F_AN_ORG = 603              # org_id
F_AN_TIME_UNIT = 607        # time_unit ('day')
F_AN_EVENT = 610            # event_name
F_AN_COUNT = 614            # total_count
F_AN_AMOUNT = 616           # total_amount
F_AN_FEES = 609             # total_fees
F_AN_START = 608            # start_time
F_AN_DELETED = 611          # is_deleted (boolean)

# organization (DB 5, table 105)
ORG_DB = 5
ORG_TABLE = 105
F_ORG_ID = 3291             # org_id
F_ORG_PARTNER = 3270        # partner_id
F_ORG_NAME = 3268           # name
F_ORG_COUNTRY = 3289        # country
F_ORG_PARENT = 11766        # parent_org_id
F_ORG_DELETED = 3274        # is_deleted (integer 0/1)
F_ORG_IS_PARTNER = 3301     # is_partner_privelege_enabled (integer 0/1)

# organization_kyb (DB 5, table 98)
KYB_DB = 5
KYB_TABLE = 98
F_KYB_ORG = 3436            # org_id
F_KYB_STATUS = 3463         # status (enum)
F_KYB_DELETED = 3456        # is_deleted (integer 0/1)
F_KYB_UPDATED = 3444        # updated_at

KYB_STATUSES = [
    "NOT_STARTED", "STARTED", "CUST_SUBMITTED", "RESUBMITTED",
    "TO_BE_RESUBMITTED", "CONDITIONALLY_APPROVED", "APPROVED", "REJECTED",
]
KYB_APPROVED = {"APPROVED", "CONDITIONALLY_APPROVED"}

# ---------------------------------------------------------------------------
# Airtable -- "Pipeline Health Snapshots" base
# ---------------------------------------------------------------------------
AIRTABLE_BASE = "appzjic6aRCatDK0o"
AT_COHORTS = "tblQa3CCdRYMGgqMn"
AT_SNAPSHOTS = "tblBOK0C2dpbsyfUb"
AT_DEAL_SNAPSHOTS = "tblo2kQ0aizDU3QNL"
AT_ORG_SNAPSHOTS = "tblxQ0Cn3Fxm4pksH"
AT_CHANGE_EVENTS = "tbl7fWvoNzrxJhNdN"

# ---------------------------------------------------------------------------
# Business rules
# ---------------------------------------------------------------------------
DORMANCY_DAYS = 30          # no txn in N days => "gone dormant"
HUBSPOT_DEAL_URL = "https://app.hubspot.com/contacts/na2/record/0-3/{deal_id}"
