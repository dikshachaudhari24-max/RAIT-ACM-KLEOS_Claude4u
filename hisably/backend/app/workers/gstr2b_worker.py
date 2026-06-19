from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="analyze_gstr2b")
def analyze_gstr2b(self, upload_id: str, user_id: str, file_url: str):
    """Parse GSTR-2B file, run reconciliation, classify root causes, and generate explanations."""
    from app.db import queries
    from app.engines.gstr2b_reconciler import reconcile
    from app.engines.root_cause_classifier import classify_root_cause

    invoices, _ = queries.get_invoices(user_id, page=1, per_page=1000)
    gstr2b_records = queries.get_gstr2b_records(user_id)

    mismatches = reconcile(invoices, gstr2b_records)

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

    return {"upload_id": upload_id, "mismatches_found": len(mismatches)}
