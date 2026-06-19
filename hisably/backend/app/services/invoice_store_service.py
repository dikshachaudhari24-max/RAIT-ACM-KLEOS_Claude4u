"""Invoice structured storage service.

Takes the already-extracted invoice data from the OCR pipeline
and saves it to the database with enhanced fields (filing period,
ITC calculation, duplicate detection, raw JSON backup).
"""

import json
from datetime import datetime, timezone

from app.db.supabase import get_admin_client
from app.db.queries import _clean


def _filing_period(date_str) -> str | None:
    """Extract filing period 'YYYY-MM' from a date string."""
    if not date_str:
        return None
    try:
        d = str(date_str)[:10]
        parts = d.split("-")
        if len(parts) >= 2:
            return f"{parts[0]}-{parts[1]}"
    except Exception:
        pass
    return None


def _to_float(val) -> float:
    if val is None:
        return 0.0
    if isinstance(val, dict) and "value" in val:
        val = val["value"]
    try:
        return float(str(val).replace(",", "").replace("₹", "").strip() or 0)
    except (ValueError, TypeError):
        return 0.0


def check_duplicate(user_id: str, supplier_gstin: str | None, invoice_number: str | None) -> dict | None:
    if not supplier_gstin or not invoice_number:
        return None
    client = get_admin_client()
    result = (
        client.table("invoices")
        .select("id,invoice_number,supplier_gstin,created_at")
        .eq("user_id", user_id)
        .eq("supplier_gstin", supplier_gstin.strip().upper())
        .eq("invoice_number", invoice_number.strip().upper())
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def save_invoice(
    extracted_data: dict,
    user_id: str,
    file_url: str | None = None,
    upload_source: str = "app",
) -> dict:
    """Save extracted invoice data to the database with enhanced fields.

    This is called AFTER the existing OCR pipeline has already extracted
    the invoice data.  It adds: duplicate detection, filing period,
    ITC calculation, raw JSON backup, and upload source tracking.
    """
    client = get_admin_client()

    supplier_gstin = _clean(extracted_data.get("supplier_gstin")) or _clean(extracted_data.get("gstin")) or ""
    invoice_number = _clean(extracted_data.get("invoice_number")) or ""
    invoice_date = _clean(extracted_data.get("date")) or _clean(extracted_data.get("invoice_date"))

    is_dup = check_duplicate(user_id, supplier_gstin, invoice_number)

    filing = _filing_period(invoice_date)

    total_gst = _to_float(extracted_data.get("gst_amount") or extracted_data.get("total_gst") or extracted_data.get("total_gst_amount"))
    gstin_valid = bool(supplier_gstin and len(supplier_gstin) == 15)
    itc_amount = total_gst if gstin_valid else 0.0

    row = {
        "user_id": user_id,
        "supplier_name": _clean(extracted_data.get("supplier_name")) or "",
        "supplier_gstin": supplier_gstin,
        "invoice_number": invoice_number,
        "date": invoice_date,
        "taxable_value": _to_float(extracted_data.get("taxable_value")),
        "cgst_amount": _to_float(extracted_data.get("cgst_amount") or extracted_data.get("cgst")),
        "sgst_amount": _to_float(extracted_data.get("sgst_amount") or extracted_data.get("sgst")),
        "igst_amount": _to_float(extracted_data.get("igst_amount") or extracted_data.get("igst")),
        "gst_amount": total_gst,
        "total_amount": _to_float(extracted_data.get("total_amount") or extracted_data.get("grand_total")),
        "hsn_code": _clean(extracted_data.get("hsn_code") or extracted_data.get("hsn")),
        "product_description": _clean(extracted_data.get("product_description") or extracted_data.get("description")),
        "status": extracted_data.get("status", "processed"),
        "file_url": file_url,
        "upload_source": upload_source,
        "filing_period": filing,
        "is_duplicate": is_dup is not None,
        "ocr_raw_text": extracted_data.get("raw_text", ""),
    }

    # Store full raw extracted as JSON in confidence_scores (existing JSONB column)
    # since raw_extracted column may not exist yet
    raw_backup = {}
    for k, v in extracted_data.items():
        if k == "raw_text":
            continue
        try:
            json.dumps(v)
            raw_backup[k] = v
        except (TypeError, ValueError):
            raw_backup[k] = str(v)
    row["confidence_scores"] = raw_backup

    result = client.table("invoices").insert(row).execute()
    saved = result.data[0] if result.data else {}

    return {
        "invoice_id": saved.get("id", ""),
        "status": "saved",
        "is_duplicate": is_dup is not None,
        "itc_amount": itc_amount,
        "filing_period": filing,
    }
