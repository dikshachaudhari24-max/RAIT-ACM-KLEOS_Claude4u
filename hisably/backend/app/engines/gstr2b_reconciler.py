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

        if inv_taxable > 0:
            pct_diff = abs(inv_taxable - rec_itc) / inv_taxable * 100
        else:
            pct_diff = 0.0 if rec_itc == 0 else 100.0

        if pct_diff > amount_tolerance_percent:
            amount_diff = abs(inv_taxable - rec_itc)
            if inv_gst is not None:
                gst_diff = abs(float(inv_gst) - rec_itc)
                itc_at_risk = gst_diff
            else:
                itc_at_risk = amount_diff * 0.18
            mismatches.append({
                "invoice_id": inv.get("id"),
                "invoice_number": inv.get("invoice_number"),
                "supplier_name": inv.get("supplier_name"),
                "supplier_gstin": inv.get("supplier_gstin"),
                "mismatch_type": "amount_mismatch",
                "invoice_amount": inv_taxable,
                "gstr2b_amount": rec_itc,
                "amount_difference": round(amount_diff, 2),
                "itc_at_risk": round(itc_at_risk, 2),
                "resolved": False,
            })

    return mismatches
