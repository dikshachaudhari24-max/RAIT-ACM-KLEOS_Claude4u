import os
import tempfile
import uuid

import httpx
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.config import settings
from app.db import queries

router = APIRouter(prefix="/webhook", tags=["webhook"])


def _send_whatsapp(to: str, message: str) -> bool:
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_=settings.TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{to}" if not to.startswith("whatsapp:") else to,
        )
        return True
    except Exception as e:
        print(f"Twilio send error: {e}")
        return False


def _download_media(media_url: str) -> str | None:
    try:
        resp = httpx.get(
            media_url,
            auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
            follow_redirects=True,
        )
        if resp.status_code != 200:
            return None
        ext = ".jpg"
        ct = resp.headers.get("content-type", "")
        if "pdf" in ct:
            ext = ".pdf"
        elif "png" in ct:
            ext = ".png"
        fd, path = tempfile.mkstemp(suffix=ext)
        os.write(fd, resp.content)
        os.close(fd)
        return path
    except Exception as e:
        print(f"Media download error: {e}")
        return None


def _handle_invoice_upload(user_id: str, file_path: str) -> str:
    try:
        from ai.ocr.extractor import extract
        result = extract(file_path, user_id)

        if result.get("error"):
            return f"Invoice padh nahi paaye: {result['error']}\nDusri photo bhejein ya clear photo lein."

        invoice_data = {
            "status": "pending",
            "supplier_name": result.get("supplier_name"),
            "supplier_gstin": result.get("supplier_gstin"),
            "invoice_number": result.get("invoice_number"),
            "date": result.get("invoice_date"),
            "total_amount": result.get("total_amount"),
            "taxable_value": result.get("taxable_value"),
            "gst_amount": result.get("total_gst_amount"),
            "hsn_code": ",".join(result.get("hsn_codes", [])) if isinstance(result.get("hsn_codes"), list) else result.get("hsn_codes"),
            "product_description": ", ".join(result.get("product_descriptions", [])) if isinstance(result.get("product_descriptions"), list) else result.get("product_descriptions"),
            "file_url": f"whatsapp_uploads/{uuid.uuid4()}",
        }
        inv = queries.insert_invoice(user_id, invoice_data)

        if not inv:
            return "Invoice save karne mein error aa gaya. Dobara try karein."

        from app.api.invoices import _validate_and_score
        _validate_and_score(inv["id"], inv, user_id)

        updated = queries.get_invoice_by_id(inv["id"])
        status = updated.get("status", "pending") if updated else "pending"

        lines = [
            "✅ Invoice upload ho gaya!",
            "",
            f"📄 Invoice No: {invoice_data.get('invoice_number') or 'N/A'}",
            f"🏪 Supplier: {invoice_data.get('supplier_name') or 'N/A'}",
            f"💰 Amount: ₹{invoice_data.get('total_amount') or 'N/A'}",
            f"📊 Status: {status}",
        ]

        if status == "error_gstin":
            lines.append("⚠️ GSTIN mein galti hai — check karein")
        elif status == "error_hsn":
            lines.append("⚠️ HSN code galat hai — check karein")
        elif status == "anomalous":
            lines.append("🔴 Yeh invoice suspicious lag raha hai")

        return "\n".join(lines)
    except Exception as e:
        return f"Invoice process karne mein error: {e}"
    finally:
        if os.path.exists(file_path):
            os.unlink(file_path)


def _handle_command(user_id: str, message: str) -> str:
    msg = message.lower().strip()

    if msg in ("hi", "hello", "namaste", "help", "menu"):
        return (
            "🙏 Namaste! Main Hisably hoon — aapka GST assistant.\n\n"
            "Aap mujhse yeh pooch sakte hain:\n\n"
            "1️⃣ *itc* — ITC summary dekhein\n"
            "2️⃣ *risk* — Compliance risk score\n"
            "3️⃣ *mismatches* — GSTR-2B mismatches\n"
            "4️⃣ *tasks* — Pending tasks\n"
            "5️⃣ *suppliers* — Supplier list\n"
            "6️⃣ *invoice photo bhejein* — Invoice upload\n\n"
            "Ya koi bhi GST sawal Hindi mein poochein!"
        )

    if msg in ("itc", "itc summary", "mera itc", "itc kitna hai", "1"):
        try:
            from app.engines.itc_engine import compute_itc_summary
            invoices, _ = queries.get_invoices(user_id, page=1, per_page=1000)
            mismatches = queries.get_mismatches(user_id, resolved=False)
            s = compute_itc_summary(invoices, mismatches)
            return (
                f"📊 *ITC Summary — {s['month']}*\n\n"
                f"✅ Eligible: ₹{s['total_eligible']:,.2f}\n"
                f"🔴 Blocked: ₹{s['total_blocked']:,.2f}\n"
                f"🔄 Recoverable: ₹{s['total_recoverable']:,.2f}\n\n"
                + (
                    "📋 *Priority Actions:*\n" +
                    "\n".join(f"• {a.get('action_hi', a.get('action_en', ''))}" for a in s.get("priority_actions", [])[:3])
                    if s.get("priority_actions") else "Koi action nahi hai abhi."
                )
            )
        except Exception as e:
            return f"ITC check karne mein error: {e}"

    if msg in ("risk", "risk score", "compliance", "2"):
        try:
            from app.engines.compliance_score import compute_risk_score
            mismatches = queries.get_mismatches(user_id, resolved=False)
            invoices, _ = queries.get_invoices(user_id, page=1, per_page=1000)
            um = sum(1 for m in mismatches if m.get("mismatch_type") in ("gstin_mismatch", "amount_mismatch", "missing_invoice"))
            uh = sum(1 for m in mismatches if m.get("mismatch_type") == "hsn_error")
            ua = sum(1 for inv in invoices if float(inv.get("anomaly_score") or 0) >= 0.5)
            r = compute_risk_score(um, uh, ua)
            emoji = {"low": "🟢", "medium": "🟡", "high": "🟠", "critical": "🔴"}.get(r["tier"], "⚪")
            return (
                f"{emoji} *Compliance Risk Score: {r['score']}*\n"
                f"Tier: {r['tier'].upper()}\n\n"
                f"📅 Next deadline: {r['next_deadline']}\n\n"
                f"Breakdown:\n"
                f"• Mismatches: {r['breakdown'].get('mismatch_score', 0)}\n"
                f"• HSN errors: {r['breakdown'].get('hsn_score', 0)}\n"
                f"• Anomalies: {r['breakdown'].get('anomaly_score', 0)}\n"
                f"• Deadline: {r['breakdown'].get('deadline_score', 0)}"
            )
        except Exception as e:
            return f"Risk score check mein error: {e}"

    if msg in ("mismatches", "mismatch", "gstr2b", "3"):
        try:
            mismatches = queries.get_mismatches(user_id, resolved=False)
            if not mismatches:
                return "✅ Koi mismatch nahi hai! Sab theek hai."
            total = sum(float(m.get("amount_difference") or 0) for m in mismatches)
            lines = [f"⚠️ *{len(mismatches)} Mismatches Found*\nTotal ITC at risk: ₹{total:,.2f}\n"]
            for m in mismatches[:5]:
                lines.append(
                    f"• {m.get('supplier_name', 'Unknown')} — {m.get('mismatch_type', '').replace('_', ' ')}"
                    f" (₹{float(m.get('amount_difference') or 0):,.2f})"
                )
            if len(mismatches) > 5:
                lines.append(f"\n...aur {len(mismatches) - 5} mismatches hain. App pe dekhein.")
            return "\n".join(lines)
        except Exception as e:
            return f"Mismatches check mein error: {e}"

    if msg in ("tasks", "task", "kaam", "pending", "4"):
        try:
            tasks = queries.get_tasks(user_id)
            pending = [t for t in tasks if t.get("status") != "completed"]
            if not pending:
                return "✅ Sab kaam ho gaye! Koi pending task nahi hai."
            lines = [f"📋 *{len(pending)} Pending Tasks*\n"]
            for t in pending[:5]:
                lines.append(f"• {t.get('task_type', '').replace('_', ' ')} — {t.get('supplier_name') or 'General'}")
            return "\n".join(lines)
        except Exception as e:
            return f"Tasks check mein error: {e}"

    if msg in ("suppliers", "supplier", "5"):
        try:
            suppliers = queries.get_suppliers(user_id)
            if not suppliers:
                return "Koi supplier nahi mila. Pehle invoice upload karein."
            lines = ["🏪 *Your Suppliers*\n"]
            for s in suppliers[:5]:
                lines.append(f"• {s.get('name', 'Unknown')} — GSTIN: {s.get('gstin', 'N/A')}")
            return "\n".join(lines)
        except Exception as e:
            return f"Suppliers check mein error: {e}"

    try:
        from ai.rag.retriever import retrieve_and_respond
        result = retrieve_and_respond(user_id, message, "invoices")
        return result["response"]
    except Exception as e:
        return (
            "Samajh nahi aaya. Aap yeh try karein:\n\n"
            "• *itc* — ITC summary\n"
            "• *risk* — Risk score\n"
            "• *mismatches* — GSTR-2B mismatches\n"
            "• *tasks* — Pending tasks\n"
            "• Invoice ki photo bhejein\n"
            "• Ya koi bhi GST sawal poochein"
        )


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    body = await request.form()
    from_number = body.get("From", "")
    message_body = body.get("Body", "").strip()
    num_media = int(body.get("NumMedia", "0"))

    user = queries.get_user_by_phone(from_number.replace("whatsapp:", ""))

    if not user:
        _send_whatsapp(from_number, (
            "🙏 Namaste! Aapka number Hisably pe registered nahi hai.\n\n"
            "Pehle Hisably app pe sign up karein, phir WhatsApp se queries kar sakte hain."
        ))
        return JSONResponse(status_code=200, content={"status": "unregistered"})

    user_id = user["id"]

    if num_media > 0:
        media_url = body.get("MediaUrl0", "")
        media_type = body.get("MediaContentType0", "")

        if not media_url:
            _send_whatsapp(from_number, "Media receive nahi hua. Dobara bhejein.")
            return JSONResponse(status_code=200, content={"status": "no_media"})

        _send_whatsapp(from_number, "📄 Invoice receive hua! Processing kar raha hoon...")

        file_path = _download_media(media_url)
        if not file_path:
            _send_whatsapp(from_number, "File download nahi ho paya. Dobara bhejein.")
            return JSONResponse(status_code=200, content={"status": "download_failed"})

        queries.insert_chat_message(user_id, "user", f"[Invoice image uploaded] {message_body}")
        response_text = _handle_invoice_upload(user_id, file_path)
    else:
        if not message_body:
            return JSONResponse(status_code=200, content={"status": "empty"})

        queries.insert_chat_message(user_id, "user", message_body)
        response_text = _handle_command(user_id, message_body)

    queries.insert_chat_message(user_id, "assistant", response_text, namespaces=["invoices", "mismatches"], grounded=True)
    _send_whatsapp(from_number, response_text)

    return JSONResponse(status_code=200, content={"status": "replied"})


@router.post("/whatsapp/send")
async def send_whatsapp_message(request: Request):
    body = await request.json()
    to_number = body.get("to", "")
    message = body.get("message", "")

    if not to_number or not message:
        return JSONResponse(status_code=400, content={"error": "Missing 'to' or 'message'"})

    sent = _send_whatsapp(to_number, message)
    return JSONResponse(status_code=200, content={"sent": sent})
