from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="recompute_itc")
def recompute_itc(self, user_id: str):
    """Recompute ITC summary and compliance risk score for a user."""
    from app.db import queries
    from app.engines.itc_engine import compute_itc_summary

    invoices, _ = queries.get_invoices(user_id, page=1, per_page=1000)
    mismatches = queries.get_mismatches(user_id, resolved=False)

    summary = compute_itc_summary(invoices, mismatches)
    queries.upsert_itc_summary(user_id, summary)

    return {"user_id": user_id, "month": summary["month"], "blocked": summary["total_blocked"]}


@celery_app.task(bind=True, name="recompute_supplier_score")
def recompute_supplier_score(self, supplier_id: str, user_id: str):
    """Recompute reliability score for a specific supplier."""
    from app.db import queries
    from app.engines.supplier_health import compute_supplier_score

    supplier = queries.get_supplier_by_id(supplier_id)
    if not supplier:
        return {"error": f"Supplier {supplier_id} not found"}

    invoices, _ = queries.get_invoices(user_id, page=1, per_page=1000)
    s_invoices = [inv for inv in invoices if inv.get("supplier_gstin") == supplier.get("gstin")]

    all_mismatches = queries.get_mismatches(user_id)
    s_mismatches = [m for m in all_mismatches if m.get("supplier_name") == supplier.get("name")]

    health = compute_supplier_score(s_invoices, s_mismatches)
    queries.upsert_supplier_health(user_id, supplier_id, health)

    return {"supplier_id": supplier_id, "score": health["score"], "tier": health["tier"]}
