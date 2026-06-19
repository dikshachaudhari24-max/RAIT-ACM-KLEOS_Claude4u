import csv
import io
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


@router.post("/upload", response_model=GSTR2BUploadResponse)
async def upload_gstr2b(file: UploadFile = File(...), user=Depends(verify_jwt)):
    """Upload a GSTR-2B file for reconciliation."""
    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))
    records = list(reader)

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

    return GSTR2BUploadResponse(upload_id=upload_id, status="processed")


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
