from fastapi import APIRouter, Depends, HTTPException

from app.db import queries
from app.deps import verify_jwt
from app.engines.supplier_health import compute_supplier_score
from app.schemas.all_schemas import (
    GenerateSupplierMessageRequest,
    GenerateSupplierMessageResponse,
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


@router.post("/generate-supplier-message", response_model=GenerateSupplierMessageResponse)
async def generate_supplier_message(req: GenerateSupplierMessageRequest, user=Depends(verify_jwt)):
    """Generate a bilingual supplier correction message via Groq LLM with amount masking."""
    from ai.groq_client import _chat

    masked_amount = "[ITC_AMOUNT_TOKEN]"
    real_amount = f"₹{float(req.blocked_itc_amount or 0):,.2f}"

    system_prompt = (
        "You are a GST compliance assistant. Generate a formal WhatsApp message to a supplier "
        "requesting GST amendment. The message must be bilingual — first in Hindi, then the same "
        "message in English below it. Be polite, professional, and under 150 words total for each "
        "language version. Do not add any explanation outside the message itself. Output only the "
        "message text, nothing else."
    )
    user_prompt = (
        f"Generate a supplier correction message with these details:\n"
        f"- Supplier Name: {req.supplier_name}\n"
        f"- Invoice Number: {req.invoice_number}\n"
        f"- Invoice Date: {req.invoice_date}\n"
        f"- Issue Type: {req.mismatch_type}\n"
        f"- Specific Problem: {req.mismatch_detail}\n"
        f"- ITC Blocked Amount: {masked_amount}\n"
        f"- Buyer GSTIN: {req.buyer_gstin}\n"
        f"- Request: Ask supplier to correct and re-file their GSTR-1 amendment at the earliest."
    )

    try:
        raw_message = _chat(
            system_prompt=system_prompt,
            user_message=user_prompt,
            model="llama-3.3-70b-versatile",
            temperature=0.3,
        )
        message = raw_message.replace(masked_amount, real_amount)
        return GenerateSupplierMessageResponse(message=message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Message generation failed: {str(e)}")


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
