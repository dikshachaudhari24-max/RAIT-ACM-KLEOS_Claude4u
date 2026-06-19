from fastapi import APIRouter, Depends, HTTPException

from app.db import queries
from app.deps import verify_jwt
from app.engines.supplier_health import compute_supplier_score
from app.schemas.all_schemas import (
    SupplierListResponse,
    SupplierMessageRequest,
    SupplierMessageResponse,
)

router = APIRouter(prefix="/supplier", tags=["suppliers"])


@router.get("/list", response_model=SupplierListResponse)
async def list_suppliers(user=Depends(verify_jwt)):
    """List all suppliers with reliability scores."""
    suppliers = queries.get_suppliers(user["uid"])
    all_invoices, _ = queries.get_invoices(user["uid"], page=1, per_page=1000)
    all_mismatches = queries.get_mismatches(user["uid"])

    items = []
    for s in suppliers:
        sid = s["id"]
        s_invoices = [inv for inv in all_invoices if inv.get("supplier_gstin") == s.get("gstin")]
        s_mismatches = [m for m in all_mismatches if m.get("supplier_name") == s.get("name")]

        health = compute_supplier_score(s_invoices, s_mismatches)
        queries.upsert_supplier_health(user["uid"], sid, health)

        blocked_itc = sum(
            float(m.get("itc_at_risk") or m.get("amount_difference") or 0)
            for m in s_mismatches if not m.get("resolved", False)
        )

        error_count = len([m for m in s_mismatches if not m.get("resolved", False)])

        if health["tier"] == "red":
            action = "Consider finding alternative supplier"
        elif health["tier"] == "yellow":
            action = "Send correction request to supplier"
        else:
            action = "No action needed"

        items.append({
            "id": sid,
            "name": s.get("name") or "",
            "gstin": s.get("gstin") or "",
            "reliability_score": float(health["score"]),
            "reliability_tier": health["tier"],
            "total_itc_blocked": round(blocked_itc, 2),
            "invoice_count": len(s_invoices),
            "error_count": error_count,
            "suggested_action": action,
        })

    return SupplierListResponse(suppliers=items)


@router.post("/message", response_model=SupplierMessageResponse)
async def send_supplier_message(request: SupplierMessageRequest, user=Depends(verify_jwt)):
    """Send a correction message to a supplier."""
    supplier = queries.get_supplier_by_id(request.supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    task = queries.insert_task(user["uid"], {
        "task_type": "supplier_message",
        "supplier_name": supplier.get("name"),
        "supplier_id": request.supplier_id,
        "invoice_id": request.related_invoice_id,
    })

    queries.insert_recommendation(user["uid"], {
        "supplier_id": request.supplier_id,
        "invoice_id": request.related_invoice_id,
        "recommendation_type": "correction_message",
        "message_en": request.edited_message or "Please correct the invoice.",
        "channel": request.channel,
        "sent": True,
    })

    return SupplierMessageResponse(
        task_id=task["id"],
        message_sent=True,
        channel=request.channel,
    )
