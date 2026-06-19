"""Supplier reliability scoring engine."""

from datetime import datetime, timedelta, timezone


def _parse_date(val) -> datetime | None:
    if isinstance(val, datetime):
        return val
    if isinstance(val, str):
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S.%f"):
            try:
                return datetime.strptime(val, fmt)
            except ValueError:
                continue
    return None


def _compute_score_for_window(invoices: list[dict], mismatches: list[dict]) -> float | None:
    total = len(invoices)
    if total == 0:
        return None

    inv_ids = {inv.get("id") for inv in invoices}
    relevant_mismatches = [m for m in mismatches if m.get("invoice_id") in inv_ids]

    missing_count = sum(1 for m in relevant_mismatches if m.get("mismatch_type") == "missing_invoice")
    gstin_count = sum(1 for m in relevant_mismatches if m.get("mismatch_type") == "gstin_mismatch")
    hsn_count = sum(1 for m in relevant_mismatches if m.get("mismatch_type") == "hsn_error")

    total_gst = sum(float(inv.get("gst_amount", 0) or 0) for inv in invoices)
    blocked_itc = sum(float(m.get("itc_at_risk", 0) or 0) for m in relevant_mismatches)
    correction_count = sum(1 for m in relevant_mismatches if m.get("resolved", False))

    missing_rate = min(missing_count / total, 1.0)
    gstin_rate = min(gstin_count / total, 1.0)
    hsn_rate = min(hsn_count / total, 1.0)
    blocked_ratio = min(blocked_itc / total_gst, 1.0) if total_gst > 0 else 0.0
    correction_freq = min(correction_count / total, 1.0)

    weighted = (
        missing_rate * 30
        + gstin_rate * 25
        + hsn_rate * 15
        + blocked_ratio * 20
        + correction_freq * 10
    )

    return 100 - weighted


def compute_supplier_score(supplier_invoices: list[dict], mismatches: list[dict]) -> dict:
    """Compute a supplier reliability score based on invoice history and mismatch patterns."""
    now = datetime.now(timezone.utc)
    cutoff_90 = now - timedelta(days=90)
    cutoff_30 = now - timedelta(days=30)

    def in_window(item, start, end):
        d = _parse_date(item.get("created_at") or item.get("date"))
        if d is None:
            return True
        if d.tzinfo is None:
            d = d.replace(tzinfo=timezone.utc)
        return start <= d <= end

    inv_90 = [i for i in supplier_invoices if in_window(i, cutoff_90, now)]
    mis_90 = [m for m in mismatches if in_window(m, cutoff_90, now)]

    if not inv_90:
        return {
            "score": 50,
            "tier": "yellow",
            "trend": "stable",
            "total_invoices": 0,
            "total_mismatches": 0,
        }

    score_full = _compute_score_for_window(inv_90, mis_90)
    score = round(score_full) if score_full is not None else 50

    if score <= 40:
        tier = "green"
    elif score <= 70:
        tier = "yellow"
    else:
        tier = "red"

    inv_recent = [i for i in supplier_invoices if in_window(i, cutoff_30, now)]
    mis_recent = [m for m in mismatches if in_window(m, cutoff_30, now)]
    inv_older = [i for i in supplier_invoices if in_window(i, cutoff_90, cutoff_30)]
    mis_older = [m for m in mismatches if in_window(m, cutoff_90, cutoff_30)]

    score_recent = _compute_score_for_window(inv_recent, mis_recent)
    score_older = _compute_score_for_window(inv_older, mis_older)

    if score_recent is not None and score_older is not None:
        diff = score_recent - score_older
        if diff <= -5:
            trend = "improving"
        elif diff >= 5:
            trend = "worsening"
        else:
            trend = "stable"
    else:
        trend = "stable"

    return {
        "score": score,
        "tier": tier,
        "trend": trend,
        "total_invoices": len(inv_90),
        "total_mismatches": len(mis_90),
    }
