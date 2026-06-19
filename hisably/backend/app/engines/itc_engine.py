"""ITC recovery and loss tracking engine."""

from datetime import datetime


_ACTION_LABELS_HI = {
    "hsn_error": "Corrected invoice bhejein",
    "gstin_mismatch": "Supplier se sahi GSTIN maangein",
    "missing_invoice": "Supplier ko GSTR-1 file karne yaad dilaayein",
    "anomaly": "Invoice verify karein",
}


def compute_itc_summary(invoices: list[dict], mismatches: list[dict]) -> dict:
    """Compute eligible, blocked, and recoverable ITC from invoices and mismatches."""
    mismatch_invoice_ids = {m.get("invoice_id") for m in mismatches if not m.get("resolved", False)}

    eligible = 0.0
    blocked = 0.0
    blocked_invoices = []

    for inv in invoices:
        gst = inv.get("gst_amount")
        if gst is None:
            continue
        gst = float(gst)
        inv_id = inv.get("id")
        anomaly = float(inv.get("anomaly_score", 0) or 0)

        is_blocked = inv_id in mismatch_invoice_ids or anomaly >= 0.15

        if is_blocked:
            blocked += gst
            blocked_invoices.append(inv)
        elif inv.get("status") == "validated" and anomaly < 0.15:
            eligible += gst

    mismatch_map = {}
    for m in mismatches:
        if not m.get("resolved", False):
            mismatch_map[m.get("invoice_id")] = m

    recoverable = 0.0
    recoverable_items = []
    for inv in blocked_invoices:
        inv_id = inv.get("id")
        m = mismatch_map.get(inv_id)
        if m and not m.get("resolved", False) and m.get("root_cause_category") != "store_owner_error":
            gst = float(inv.get("gst_amount", 0) or 0)
            recoverable += gst
            mtype = m.get("mismatch_type", "anomaly")
            action_hi = _ACTION_LABELS_HI.get(mtype, "Invoice verify karein")
            action_en = action_hi.replace("bhejein", "send corrected invoice").replace(
                "Supplier se sahi GSTIN maangein", "Request correct GSTIN from supplier"
            ).replace(
                "Supplier ko GSTR-1 file karne yaad dilaayein", "Remind supplier to file GSTR-1"
            ).replace(
                "Invoice verify karein", "Verify invoice"
            )
            recoverable_items.append({
                "invoice_id": inv_id,
                "amount": gst,
                "issue": mtype,
                "action_label": action_en,
                "action_label_hi": action_hi,
            })

    recoverable_items.sort(key=lambda x: x["amount"], reverse=True)
    priority_actions = recoverable_items[:10]

    return {
        "total_eligible": round(eligible, 2),
        "total_blocked": round(blocked, 2),
        "total_recoverable": round(recoverable, 2),
        "priority_actions": priority_actions,
        "month": datetime.now().strftime("%Y-%m"),
    }
