"""Voice assistant endpoints: conversational query (Artha) and voice invoice entry."""

from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.db import queries
from app.deps import verify_jwt

router = APIRouter(prefix="/voice", tags=["voice"])


class VoiceQueryRequest(BaseModel):
    query: str
    history: list = []
    language: str = "English"
    session_id: str = ""


class VoiceInvoiceRequest(BaseModel):
    transcript: str
    language: str = "English"


def _build_user_context(user_id: str) -> str:
    """Assemble a compact context string from the user's live GST data."""
    parts = []
    try:
        invoices, total = queries.get_invoices(user_id, page=1, per_page=5)
        if invoices:
            parts.append(f"Total invoices: {total}.")
            recent = []
            for inv in invoices[:5]:
                recent.append(
                    f"{inv.get('supplier_name') or 'Unknown'} "
                    f"Rs {inv.get('total_amount') or 0} "
                    f"({inv.get('status') or 'pending'})"
                )
            parts.append("Recent invoices: " + "; ".join(recent) + ".")
    except Exception:
        pass

    try:
        from app.engines.itc_engine import compute_itc_summary
        invoices_all, _ = queries.get_invoices(user_id, page=1, per_page=1000)
        mismatches = queries.get_mismatches(user_id, resolved=False)
        itc = compute_itc_summary(invoices_all, mismatches)
        parts.append(
            f"ITC eligible Rs {itc['total_eligible']}, "
            f"recoverable Rs {itc['total_recoverable']}, "
            f"blocked Rs {itc['total_blocked']}."
        )
    except Exception:
        pass

    try:
        tasks = queries.get_tasks(user_id)
        open_tasks = [t for t in tasks if t.get("status") != "completed"]
        if open_tasks:
            parts.append(f"Open tasks: {len(open_tasks)}.")
    except Exception:
        pass

    try:
        from app.engines.compliance_score import compute_risk_score
        mismatches = queries.get_mismatches(user_id, resolved=False)
        invoices_all, _ = queries.get_invoices(user_id, page=1, per_page=1000)
        um = sum(1 for m in mismatches if m.get("mismatch_type") in ("gstin_mismatch", "amount_mismatch", "missing_invoice"))
        uh = sum(1 for m in mismatches if m.get("mismatch_type") == "hsn_error")
        ua = sum(1 for inv in invoices_all if float(inv.get("anomaly_score") or 0) >= 0.5)
        risk = compute_risk_score(um, uh, ua)
        parts.append(f"Compliance risk score: {risk['score']} ({risk['tier']}), next deadline {risk['next_deadline']}.")
    except Exception:
        pass

    return " ".join(parts) if parts else "No recent activity yet."


@router.post("/query")
async def voice_query(req: VoiceQueryRequest, user=Depends(verify_jwt)):
    """Conversational voice query — grounds Artha's reply in user data + GST FAQ RAG."""
    user_id = user["uid"]

    profile = queries.get_user_by_phone_by_id(user_id) or {}
    user_name = profile.get("name") or profile.get("business_name") or ""
    gstin = profile.get("gstin") or ""

    rag_context = _build_user_context(user_id)

    try:
        from ai.rag.faq_service import get_relevant_context
        faq_context = get_relevant_context(req.query, top_k=3)
    except Exception:
        faq_context = ""

    try:
        from ai.groq_client import generate_artha_response
        response_text = generate_artha_response(
            query=req.query,
            user_name=user_name,
            gstin=gstin,
            language=req.language,
            rag_context=rag_context,
            faq_context=faq_context,
            history=req.history,
        )
    except Exception as e:
        response_text = "Sorry, I could not process that right now. Please try again."

    try:
        queries.insert_chat_message(user_id, "user", req.query)
        queries.insert_chat_message(user_id, "assistant", response_text, grounded=True)
    except Exception:
        pass

    return {
        "response": response_text,
        "language": req.language,
        "session_id": req.session_id,
    }


@router.post("/invoice")
async def voice_invoice(req: VoiceInvoiceRequest, user=Depends(verify_jwt)):
    """Parse a spoken invoice description into structured fields, asking follow-ups if needed."""
    try:
        from ai.groq_client import generate_voice_invoice_extraction
        data = generate_voice_invoice_extraction(req.transcript, date.today().isoformat())
    except Exception as e:
        return {"needs_followup": False, "data": {}, "error": str(e)}

    if data.get("parse_error"):
        return {"needs_followup": False, "data": {}, "error": "Could not understand the invoice. Please describe it again."}

    follow_up = data.get("follow_up_question")
    if follow_up:
        return {"needs_followup": True, "question": follow_up, "partial_data": data}

    return {"needs_followup": False, "data": data}
