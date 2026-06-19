"""Seed mock data into Supabase for a given user (for testing/demo).

Usage:
    python seed_mock_data.py <phone>        e.g. python seed_mock_data.py 9876543210
    python seed_mock_data.py <phone> --reset  also clears existing seeded data first

Loads invoices_mock.json and gstr2b_mock.csv from ../mock_data, inserts them
under the user's account, runs GSTR-2B reconciliation, and stores mismatches so
the Dashboard, Invoices, GSTR-2B and ITC screens light up with real data.
"""

import csv
import json
import os
import sys

# Make `app` and `ai` importable when run from the backend/ directory.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db import queries
from app.db.supabase import get_admin_client
from app.engines.gstr2b_reconciler import reconcile
from app.engines.root_cause_classifier import classify_root_cause

MOCK_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "mock_data")


def _resolve_user(phone: str) -> str:
    clean = phone.strip()
    if not clean.startswith("+"):
        clean = f"+91{clean}"
    user = queries.get_user_by_phone(clean)
    if not user:
        print(f"No user found for {clean}. Creating one...")
        user = queries.create_user(clean)
    print(f"User: {user['id']}  ({clean})")
    return user["id"]


def _reset(user_id: str):
    client = get_admin_client()
    for table in ("mismatches", "gstr2b_records", "invoices"):
        client.table(table).delete().eq("user_id", user_id).execute()
    print("Cleared existing invoices / gstr2b / mismatches for this user.")


def seed(phone: str, reset: bool = False):
    user_id = _resolve_user(phone)
    if reset:
        _reset(user_id)

    # 1. Invoices
    with open(os.path.join(MOCK_DIR, "invoices_mock.json"), encoding="utf-8") as f:
        invoices = json.load(f)
    inserted_invoices = 0
    for inv in invoices:
        queries.insert_invoice(user_id, inv)
        inserted_invoices += 1
    print(f"Inserted {inserted_invoices} invoices.")

    # 2. GSTR-2B records
    with open(os.path.join(MOCK_DIR, "gstr2b_mock.csv"), encoding="utf-8") as f:
        records = list(csv.DictReader(f))
    queries.insert_gstr2b_batch(user_id, records, upload_id="seed-upload")
    print(f"Inserted {len(records)} GSTR-2B records.")

    # 3. Reconcile -> mismatches
    db_invoices, _ = queries.get_invoices(user_id, page=1, per_page=1000)
    db_gstr2b = queries.get_gstr2b_records(user_id)
    mismatches = reconcile(db_invoices, db_gstr2b)
    for m in mismatches:
        rc = classify_root_cause(
            mismatch_type=m.get("mismatch_type", ""),
            ocr_confidence=0.85,
            user_edited_field=False,
            supplier_error_history=0,
            total_supplier_invoices=1,
        )
        m["root_cause_category"] = rc["root_cause_category"]
        m["root_cause_confidence"] = rc["confidence"]
        m["recommended_action"] = rc["recommended_action"]
        m["explanation_en"] = rc["reasoning"]
        m["explanation_hi"] = ""
    if mismatches:
        queries.insert_mismatches_batch(user_id, mismatches)
    print(f"Created {len(mismatches)} mismatches.")

    print("\nDone. Open the app -> Dashboard / GSTR-2B / ITC to see the data.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python seed_mock_data.py <phone> [--reset]")
        sys.exit(1)
    seed(sys.argv[1], reset="--reset" in sys.argv)
