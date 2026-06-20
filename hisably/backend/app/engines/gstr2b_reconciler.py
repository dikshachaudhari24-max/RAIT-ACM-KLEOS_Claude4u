"""Invoice vs GSTR-2B reconciliation engine."""


def reconcile(
    invoices: list[dict],
    gstr2b_records: list[dict],
    amount_tolerance_percent: float = 1.0,
) -> list[dict]:
    """Reconcile uploaded invoices against GSTR-2B records and return mismatches."""
    gstr2b_by_inv_num: dict[str, dict] = {}
    for rec in gstr2b_records:
        key = rec.get("invoice_number", "").strip().upper()
        gstr2b_by_inv_num[key] = rec

    mismatches = []

    for inv in invoices:
        inv_num = inv.get("invoice_number", "").strip().upper()
        inv_gstin = inv.get("supplier_gstin", "").strip().upper()
        inv_taxable = float(inv.get("taxable_value", 0) or 0)
        inv_gst = inv.get("gst_amount")

        rec = gstr2b_by_inv_num.get(inv_num)

        if rec is None:
            itc_at_risk = float(inv_gst) if inv_gst is not None else inv_taxable * 0.18
            mismatches.append({
                "invoice_id": inv.get("id"),
                "invoice_number": inv.get("invoice_number"),
                "supplier_name": inv.get("supplier_name"),
                "supplier_gstin": inv.get("supplier_gstin"),
                "mismatch_type": "missing_invoice",
                "amount_difference": inv_taxable,
                "itc_at_risk": round(itc_at_risk, 2),
                "resolved": False,
            })
            continue

        rec_gstin = rec.get("supplier_gstin", "").strip().upper()
        rec_itc = float(rec.get("itc_amount", 0) or 0)

        if rec_gstin != inv_gstin:
            itc_at_risk = float(inv_gst) if inv_gst is not None else inv_taxable * 0.18
            mismatches.append({
                "invoice_id": inv.get("id"),
                "invoice_number": inv.get("invoice_number"),
                "supplier_name": inv.get("supplier_name"),
                "supplier_gstin": inv.get("supplier_gstin"),
                "gstr2b_gstin": rec_gstin,
                "mismatch_type": "gstin_mismatch",
                "amount_difference": 0.0,
                "itc_at_risk": round(itc_at_risk, 2),
                "resolved": False,
            })
            continue

        # GSTR-2B reports ITC (the GST amount), so compare it against the
        # invoice's GST amount — not the taxable value (different magnitudes).
        inv_itc = float(inv_gst) if inv_gst is not None else inv_taxable * 0.18
        if inv_itc > 0:
            pct_diff = abs(inv_itc - rec_itc) / inv_itc * 100
        else:
            pct_diff = 0.0 if rec_itc == 0 else 100.0

        if pct_diff > amount_tolerance_percent:
            itc_at_risk = abs(inv_itc - rec_itc)
            mismatches.append({
                "invoice_id": inv.get("id"),
                "invoice_number": inv.get("invoice_number"),
                "supplier_name": inv.get("supplier_name"),
                "supplier_gstin": inv.get("supplier_gstin"),
                "mismatch_type": "amount_mismatch",
                "invoice_amount": inv_itc,
                "gstr2b_amount": rec_itc,
                "amount_difference": round(abs(inv_itc - rec_itc), 2),
                "itc_at_risk": round(itc_at_risk, 2),
                "resolved": False,
            })

    return mismatches


def reconcile_summary(invoices: list[dict], gstr2b_records: list[dict]) -> dict:
    """Return accurate matched / mismatched / missing counts for invoices vs GSTR-2B.

    - matched: invoice found in GSTR-2B with matching GSTIN and amount in tolerance
    - mismatched: found but GSTIN or amount differs (gstin_mismatch + amount_mismatch)
    - missing: invoice not present in GSTR-2B at all (missing_invoice)
    - in_2b_not_in_books: GSTR-2B entries with no matching uploaded invoice
    """
    mismatches = reconcile(invoices, gstr2b_records)
    total_invoices = len(invoices)

    missing = sum(1 for m in mismatches if m.get("mismatch_type") == "missing_invoice")
    mismatched = sum(
        1 for m in mismatches
        if m.get("mismatch_type") in ("gstin_mismatch", "amount_mismatch")
    )
    matched = max(0, total_invoices - missing - mismatched)

    invoice_nums = {str(inv.get("invoice_number", "")).strip().upper() for inv in invoices}
    in_2b_not_in_books = sum(
        1 for rec in gstr2b_records
        if str(rec.get("invoice_number", "")).strip().upper() not in invoice_nums
    )

    total_itc_at_risk = sum(
        float(m.get("itc_at_risk") or m.get("amount_difference") or 0) for m in mismatches
    )

    return {
        "total_invoices": total_invoices,
        "total_2b_records": len(gstr2b_records),
        "matched": matched,
        "mismatched": mismatched,
        "missing": missing,
        "in_2b_not_in_books": in_2b_not_in_books,
        "total_itc_at_risk": round(total_itc_at_risk, 2),
    }
