import os
import uuid
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

from app.db import queries
from app.deps import verify_jwt
from app.schemas.all_schemas import InvoiceListResponse, InvoiceUploadResponse

router = APIRouter(prefix="/invoice", tags=["invoices"])

UPLOAD_DIR = os.path.join(tempfile.gettempdir(), "hisably_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _run_ocr(file_path: str, user_id: str) -> dict:
    try:
        from ai.ocr.extractor import extract
        return extract(file_path, user_id)
    except Exception as e:
        return {"error": f"OCR failed: {e}"}


def _validate_and_score(invoice_id: str, invoice_data: dict, user_id: str):
    update_data = {}

    gstin = invoice_data.get("supplier_gstin")
    if gstin:
        try:
            from app.engines.gstin_validator import validate_gstin
            gstin_result = validate_gstin(gstin)
            if not gstin_result["valid"]:
                update_data["status"] = "error_gstin"
                if gstin_result.get("corrected_gstin"):
                    update_data["supplier_gstin"] = gstin_result["corrected_gstin"]
        except Exception:
            pass

    hsn = invoice_data.get("hsn_code")
    if hsn:
        try:
            from app.engines.hsn_validator import validate_hsn
            hsn_result = validate_hsn(hsn)
            if not hsn_result["valid"]:
                update_data["status"] = "error_hsn"
                if hsn_result.get("suggested_code"):
                    update_data["hsn_code"] = hsn_result["suggested_code"]
        except Exception:
            pass

    try:
        from ai.anomaly.isolation_forest import InvoiceAnomalyScorer
        scorer = InvoiceAnomalyScorer()
        score = scorer.score(invoice_data)
        update_data["anomaly_score"] = round(score, 4)
        if scorer.is_anomalous(score):
            update_data["status"] = "anomalous"
    except Exception:
        pass

    if not update_data.get("status"):
        update_data["status"] = "validated"

    if update_data:
        queries.update_invoice(invoice_id, update_data)

    if invoice_data.get("supplier_gstin") and invoice_data.get("supplier_name"):
        try:
            queries.get_or_create_supplier(user_id, invoice_data["supplier_name"], invoice_data["supplier_gstin"])
        except Exception:
            pass

    try:
        from ai.rag.embedder import embed_text
        from ai.rag.pinecone_client import get_namespace, upsert_vector
        text = (
            f"Invoice {invoice_data.get('invoice_number')} from {invoice_data.get('supplier_name')} "
            f"dated {invoice_data.get('date')} for ₹{invoice_data.get('total_amount')} "
            f"HSN: {invoice_data.get('hsn_code')} - {invoice_data.get('product_description')}"
        )
        vector = embed_text(text)
        namespace = get_namespace(user_id, "invoice")
        upsert_vector(namespace, invoice_id, vector, {"text": text, "record_type": "invoice"})
    except Exception:
        pass


@router.post("/upload")
async def upload_invoice(file: UploadFile = File(...), user=Depends(verify_jwt)):
    ext = os.path.splitext(file.filename or "upload.jpg")[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".pdf", ".tiff", ".bmp", ".webp"):
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    file_id = str(uuid.uuid4())
    saved_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    content = await file.read()
    with open(saved_path, "wb") as f:
        f.write(content)

    extracted = _run_ocr(saved_path, user["uid"])

    if extracted.get("error"):
        invoice_data = {
            "status": "ocr_error",
            "file_url": saved_path,
            "ocr_raw_text": extracted.get("raw_text", ""),
        }
        result = queries.insert_invoice(user["uid"], invoice_data)
        return {
            "invoice_id": result.get("id", ""),
            "status": "ocr_error",
            "error": extracted["error"],
            "extracted": {},
        }

    invoice_data = {
        "supplier_name": extracted.get("supplier_name"),
        "supplier_gstin": extracted.get("supplier_gstin") or extracted.get("gstin"),
        "invoice_number": extracted.get("invoice_number"),
        "date": extracted.get("date") or extracted.get("invoice_date"),
        "taxable_value": _to_float(extracted.get("taxable_value")),
        "cgst_amount": _to_float(extracted.get("cgst_amount") or extracted.get("cgst")),
        "sgst_amount": _to_float(extracted.get("sgst_amount") or extracted.get("sgst")),
        "igst_amount": _to_float(extracted.get("igst_amount") or extracted.get("igst")),
        "gst_amount": _to_float(extracted.get("gst_amount") or extracted.get("total_gst")),
        "gst_percent": _to_float(extracted.get("gst_percent") or extracted.get("gst_rate")),
        "total_amount": _to_float(extracted.get("total_amount") or extracted.get("grand_total")),
        "hsn_code": extracted.get("hsn_code") or extracted.get("hsn"),
        "product_description": extracted.get("product_description") or extracted.get("description"),
        "status": "processing",
        "file_url": saved_path,
        "ocr_raw_text": extracted.get("raw_text", ""),
        "confidence_scores": extracted.get("confidence_scores"),
    }
    result = queries.insert_invoice(user["uid"], invoice_data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to save invoice")

    _validate_and_score(result["id"], invoice_data, user["uid"])

    updated = queries.get_invoice_by_id(result["id"])
    final = updated or result

    return {
        "invoice_id": final.get("id", result.get("id", "")),
        "status": final.get("status", "processing"),
        "extracted": {
            "supplier_name": final.get("supplier_name") or "",
            "supplier_gstin": final.get("supplier_gstin") or "",
            "invoice_number": final.get("invoice_number") or "",
            "date": str(final.get("date") or ""),
            "taxable_value": float(final.get("taxable_value") or 0),
            "cgst_amount": float(final.get("cgst_amount") or 0),
            "sgst_amount": float(final.get("sgst_amount") or 0),
            "igst_amount": float(final.get("igst_amount") or 0),
            "gst_amount": float(final.get("gst_amount") or 0),
            "gst_percent": float(final.get("gst_percent") or 0),
            "total_amount": float(final.get("total_amount") or 0),
            "hsn_code": final.get("hsn_code") or "",
            "product_description": final.get("product_description") or "",
        },
    }


@router.get("/list", response_model=InvoiceListResponse)
async def list_invoices(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user=Depends(verify_jwt),
):
    invoices, total = queries.get_invoices(user["uid"], page=page, per_page=per_page)
    items = []
    for inv in invoices:
        conf = inv.get("confidence_scores") or {}
        items.append({
            "id": inv["id"],
            "supplier_name": inv.get("supplier_name") or "",
            "invoice_number": inv.get("invoice_number") or "",
            "date": str(inv.get("date") or ""),
            "amount": float(inv.get("total_amount") or 0),
            "status": inv.get("status") or "pending",
            "anomaly_score": float(inv.get("anomaly_score") or 0),
            "confidence_scores": {
                "supplier_name": conf.get("supplier_name", 0),
                "gstin": conf.get("gstin", 0),
                "invoice_number": conf.get("invoice_number", 0),
                "date": conf.get("date", 0),
                "amount": conf.get("amount", 0),
                "taxable_value": conf.get("taxable_value", 0),
                "gst_amount": conf.get("gst_amount", 0),
                "hsn_code": conf.get("hsn_code", 0),
                "product_description": conf.get("product_description", 0),
            },
        })
    return InvoiceListResponse(invoices=items, total=total, page=page)


@router.get("/detail")
async def get_invoice_detail(invoice_id: str, user=Depends(verify_jwt)):
    inv = queries.get_invoice_by_id(invoice_id)
    if not inv or inv.get("user_id") != user["uid"]:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {
        "id": inv["id"],
        "supplier_name": inv.get("supplier_name") or "",
        "supplier_gstin": inv.get("supplier_gstin") or "",
        "invoice_number": inv.get("invoice_number") or "",
        "date": str(inv.get("date") or ""),
        "taxable_value": float(inv.get("taxable_value") or 0),
        "cgst_amount": float(inv.get("cgst_amount") or 0),
        "sgst_amount": float(inv.get("sgst_amount") or 0),
        "igst_amount": float(inv.get("igst_amount") or 0),
        "gst_amount": float(inv.get("gst_amount") or 0),
        "gst_percent": float(inv.get("gst_percent") or 0),
        "total_amount": float(inv.get("total_amount") or 0),
        "hsn_code": inv.get("hsn_code") or "",
        "product_description": inv.get("product_description") or "",
        "status": inv.get("status") or "pending",
        "anomaly_score": float(inv.get("anomaly_score") or 0),
        "ocr_raw_text": inv.get("ocr_raw_text") or "",
        "confidence_scores": inv.get("confidence_scores") or {},
        "created_at": str(inv.get("created_at") or ""),
    }


def _to_float(val) -> float | None:
    if val is None:
        return None
    try:
        cleaned = str(val).replace(",", "").replace("₹", "").strip()
        return float(cleaned) if cleaned else None
    except (ValueError, TypeError):
        return None
