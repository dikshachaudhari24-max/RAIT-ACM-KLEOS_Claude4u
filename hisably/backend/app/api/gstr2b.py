import csv
import io
import os
import tempfile
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.db import queries
from app.deps import verify_jwt
from app.engines.gstr2b_reconciler import reconcile
from app.engines.root_cause_classifier import classify_root_cause
from app.schemas.all_schemas import GSTR2BUploadResponse, MismatchListResponse

router = APIRouter(prefix="/gstr2b", tags=["gstr2b"])


def _embed_mismatch(mismatch: dict, user_id: str):
    """Embed a mismatch record into Pinecone."""
    try:
        from ai.rag.embedder import embed_text
        from ai.rag.pinecone_client import get_namespace, upsert_vector

        text = (
            f"Mismatch: {mismatch.get('mismatch_type')} for {mismatch.get('supplier_name')} "
            f"amount difference ₹{mismatch.get('amount_difference')} "
            f"root cause: {mismatch.get('root_cause_category')}"
        )
        vector = embed_text(text)
        namespace = get_namespace(user_id, "mismatch")
        upsert_vector(namespace, mismatch.get("id", str(uuid.uuid4())), vector, {"text": text, "record_type": "mismatch"})
    except Exception:
        pass


EXPECTED_COLUMNS = {"supplier_gstin", "invoice_number", "itc_amount"}


def _parse_pdf_to_records(content: bytes) -> list[dict]:
    """Extract GSTR-2B table rows from a PDF file using pdfplumber."""
    import pdfplumber

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    try:
        tmp.write(content)
        tmp.close()
        records = []
        with pdfplumber.open(tmp.name) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    if not table or len(table) < 2:
                        continue
                    raw_header = [str(c).strip().lower().replace(" ", "_") for c in table[0] if c]
                    col_map = {}
                    for idx, col in enumerate(raw_header):
                        if "gstin" in col and "supplier" in col:
                            col_map["supplier_gstin"] = idx
                        elif "invoice" in col:
                            col_map["invoice_number"] = idx
                        elif "itc" in col or "amount" in col:
                            col_map["itc_amount"] = idx
                        elif "date" in col or "upload" in col:
                            col_map["upload_date"] = idx
                        elif "status" in col:
                            col_map["status"] = idx
                    if not EXPECTED_COLUMNS.issubset(col_map.keys()):
                        continue
                    for row in table[1:]:
                        if not row or not any(row):
                            continue
                        gstin = str(row[col_map["supplier_gstin"]] or "").strip()
                        inv_num = str(row[col_map["invoice_number"]] or "").strip()
                        itc_raw = str(row[col_map.get("itc_amount", -1)] or "0").strip()
                        import re
                        itc_raw = re.sub(r"[^\d.]", "", itc_raw)
                        if not gstin or not inv_num or inv_num.upper() == "TOTAL":
                            continue
                        rec = {
                            "supplier_gstin": gstin,
                            "invoice_number": inv_num,
                            "itc_amount": itc_raw,
                        }
                        if "upload_date" in col_map and row[col_map["upload_date"]]:
                            rec["upload_date"] = str(row[col_map["upload_date"]]).strip()
                        if "status" in col_map and row[col_map["status"]]:
                            rec["status"] = str(row[col_map["status"]]).strip()
                        records.append(rec)
        return records
    finally:
        os.unlink(tmp.name)


def _parse_csv_to_records(content: bytes) -> list[dict]:
    text = content.decode("utf-8")
    return list(csv.DictReader(io.StringIO(text)))


@router.post("/upload", response_model=GSTR2BUploadResponse)
async def upload_gstr2b(file: UploadFile = File(...), user=Depends(verify_jwt)):
    """Upload a GSTR-2B file (CSV or PDF) for reconciliation."""
    content = await file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        records = _parse_pdf_to_records(content)
        if not records:
            raise HTTPException(status_code=400, detail="Could not extract GSTR-2B data from PDF. Ensure it has a table with supplier GSTIN, invoice number, and ITC amount columns.")
    elif filename.endswith(".csv") or filename.endswith(".xls"):
        records = _parse_csv_to_records(content)
    else:
        try:
            records = _parse_csv_to_records(content)
        except Exception:
            raise HTTPException(status_code=400, detail="Unsupported file format. Upload a CSV or PDF.")

    upload_id = str(uuid.uuid4())
    queries.insert_gstr2b_batch(user["uid"], records, upload_id)

    invoices, _ = queries.get_invoices(user["uid"], page=1, per_page=1000)
    gstr2b_records = queries.get_gstr2b_records(user["uid"])

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
        inserted = queries.insert_mismatches_batch(user["uid"], mismatches)
        for m in (inserted or mismatches):
            _embed_mismatch(m, user["uid"])

        _send_whatsapp_mismatch_alert(user["uid"], mismatches)

    return GSTR2BUploadResponse(upload_id=upload_id, status="processed")


def _send_whatsapp_mismatch_alert(user_id: str, mismatches: list):
    """Send WhatsApp alert to the user when GSTR-2B mismatches are found."""
    try:
        user = queries.get_user_by_phone_by_id(user_id)
        if not user or not user.get("phone"):
            return

        total_risk = sum(float(m.get("itc_at_risk") or m.get("amount_difference") or 0) for m in mismatches)
        amt_count = sum(1 for m in mismatches if m.get("mismatch_type") == "amount_mismatch")
        gstin_count = sum(1 for m in mismatches if m.get("mismatch_type") == "gstin_mismatch")
        missing_count = sum(1 for m in mismatches if m.get("mismatch_type") == "missing_invoice")

        lines = [
            "🚨 *GSTR-2B Reconciliation Alert*",
            "",
            f"⚠️ *{len(mismatches)} mismatches found!*",
            f"💰 ITC at risk: ₹{total_risk:,.2f}",
            "",
        ]
        if amt_count:
            lines.append(f"• Amount mismatch: {amt_count}")
        if gstin_count:
            lines.append(f"• GSTIN mismatch: {gstin_count}")
        if missing_count:
            lines.append(f"• Missing in GSTR-2B: {missing_count}")

        lines.append("")
        for m in mismatches[:5]:
            supplier = m.get("supplier_name") or "Unknown"
            mtype = (m.get("mismatch_type") or "").replace("_", " ")
            diff = float(m.get("amount_difference") or 0)
            lines.append(f"📄 {supplier} — {mtype} (₹{diff:,.2f})")

        if len(mismatches) > 5:
            lines.append(f"\n...aur {len(mismatches) - 5} mismatches. App pe dekhein.")

        lines.append("\n🔧 App kholein aur GSTR-2B tab pe jaayein fix karne ke liye.")

        from app.api.webhook import _send_whatsapp
        _send_whatsapp(user["phone"], "\n".join(lines))
    except Exception as e:
        print(f"WhatsApp alert error: {e}")


@router.get("/summary")
async def gstr2b_summary(user=Depends(verify_jwt)):
    """Return accurate matched / mismatched / missing counts by reconciling live data."""
    from app.engines.gstr2b_reconciler import reconcile_summary

    invoices, _ = queries.get_invoices(user["uid"], page=1, per_page=1000)
    gstr2b_records = queries.get_gstr2b_records(user["uid"])
    summary = reconcile_summary(invoices, gstr2b_records)
    return summary


@router.get("/mismatches", response_model=MismatchListResponse)
async def get_mismatches(user=Depends(verify_jwt)):
    """Get list of invoice vs GSTR-2B mismatches."""
    mismatches = queries.get_mismatches(user["uid"])
    total_blocked = sum(float(m.get("itc_at_risk") or m.get("amount_difference") or 0) for m in mismatches)
    items = []
    for m in mismatches:
        items.append({
            "id": m["id"],
            "invoice_id": m.get("invoice_id") or "",
            "supplier_name": m.get("supplier_name") or "",
            "mismatch_type": m.get("mismatch_type") or "",
            "amount_difference": float(m.get("amount_difference") or 0),
            "explanation_hi": m.get("explanation_hi") or "",
            "explanation_en": m.get("explanation_en") or "",
            "root_cause_category": m.get("root_cause_category") or "",
            "root_cause_confidence": float(m.get("root_cause_confidence") or 0),
            "recommended_action": m.get("recommended_action") or "",
            "resolved": m.get("resolved", False),
        })
    return MismatchListResponse(mismatches=items, total_blocked_itc=round(total_blocked, 2))
