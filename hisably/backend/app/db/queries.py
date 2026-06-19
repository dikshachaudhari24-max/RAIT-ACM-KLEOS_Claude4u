"""Supabase database query functions for all Hisably entities."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.db.supabase import get_admin_client, get_client


# ──────────────────────────── Invoices ────────────────────────────

def insert_invoice(user_id: str, data: dict) -> dict:
    client = get_admin_client()
    row = {
        "user_id": user_id,
        "supplier_name": data.get("supplier_name"),
        "supplier_gstin": data.get("supplier_gstin"),
        "invoice_number": data.get("invoice_number"),
        "date": data.get("date"),
        "taxable_value": data.get("taxable_value"),
        "cgst_amount": data.get("cgst_amount"),
        "sgst_amount": data.get("sgst_amount"),
        "igst_amount": data.get("igst_amount"),
        "gst_amount": data.get("gst_amount"),
        "gst_percent": data.get("gst_percent"),
        "total_amount": data.get("total_amount"),
        "hsn_code": data.get("hsn_code"),
        "product_description": data.get("product_description"),
        "status": data.get("status", "pending"),
        "anomaly_score": data.get("anomaly_score", 0),
        "confidence_scores": data.get("confidence_scores"),
        "file_url": data.get("file_url"),
        "ocr_raw_text": data.get("ocr_raw_text"),
    }
    result = client.table("invoices").insert(row).execute()
    return result.data[0] if result.data else {}


def get_invoices(user_id: str, page: int = 1, per_page: int = 20) -> tuple[list[dict], int]:
    client = get_admin_client()
    offset = (page - 1) * per_page
    result = (
        client.table("invoices")
        .select("*", count="exact")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + per_page - 1)
        .execute()
    )
    return result.data or [], result.count or 0


def get_invoice_by_id(invoice_id: str) -> dict | None:
    client = get_admin_client()
    result = client.table("invoices").select("*").eq("id", invoice_id).limit(1).execute()
    return result.data[0] if result.data else None


def update_invoice(invoice_id: str, data: dict) -> dict:
    client = get_admin_client()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = client.table("invoices").update(data).eq("id", invoice_id).execute()
    return result.data[0] if result.data else {}


# ──────────────────────────── GSTR-2B Records ────────────────────────────

def insert_gstr2b_record(user_id: str, data: dict) -> dict:
    client = get_admin_client()
    row = {
        "user_id": user_id,
        "upload_id": data.get("upload_id"),
        "supplier_gstin": data.get("supplier_gstin"),
        "invoice_number": data.get("invoice_number"),
        "itc_amount": data.get("itc_amount"),
        "upload_date": data.get("upload_date"),
        "status": data.get("status", "pending"),
        "file_url": data.get("file_url"),
    }
    result = client.table("gstr2b_records").insert(row).execute()
    return result.data[0] if result.data else {}


def insert_gstr2b_batch(user_id: str, records: list[dict], upload_id: str, file_url: str | None = None) -> list[dict]:
    client = get_admin_client()
    rows = []
    for rec in records:
        rows.append({
            "user_id": user_id,
            "upload_id": upload_id,
            "supplier_gstin": rec.get("supplier_gstin"),
            "invoice_number": rec.get("invoice_number"),
            "itc_amount": rec.get("itc_amount"),
            "upload_date": rec.get("upload_date"),
            "status": rec.get("status", "pending"),
            "file_url": file_url,
        })
    result = client.table("gstr2b_records").insert(rows).execute()
    return result.data or []


def get_gstr2b_records(user_id: str) -> list[dict]:
    client = get_admin_client()
    result = client.table("gstr2b_records").select("*").eq("user_id", user_id).execute()
    return result.data or []


# ──────────────────────────── Mismatches ────────────────────────────

def insert_mismatch(user_id: str, data: dict) -> dict:
    client = get_admin_client()
    row = {
        "user_id": user_id,
        "invoice_id": data.get("invoice_id"),
        "supplier_name": data.get("supplier_name"),
        "mismatch_type": data.get("mismatch_type"),
        "amount_difference": data.get("amount_difference", 0),
        "itc_at_risk": data.get("itc_at_risk", 0),
        "explanation_hi": data.get("explanation_hi"),
        "explanation_en": data.get("explanation_en"),
        "root_cause_category": data.get("root_cause_category"),
        "root_cause_confidence": data.get("root_cause_confidence"),
        "recommended_action": data.get("recommended_action"),
        "resolved": data.get("resolved", False),
    }
    result = client.table("mismatches").insert(row).execute()
    return result.data[0] if result.data else {}


def insert_mismatches_batch(user_id: str, mismatches: list[dict]) -> list[dict]:
    client = get_admin_client()
    rows = []
    for m in mismatches:
        rows.append({
            "user_id": user_id,
            "invoice_id": m.get("invoice_id"),
            "supplier_name": m.get("supplier_name"),
            "mismatch_type": m.get("mismatch_type"),
            "amount_difference": m.get("amount_difference", 0),
            "itc_at_risk": m.get("itc_at_risk", 0),
            "explanation_hi": m.get("explanation_hi", ""),
            "explanation_en": m.get("explanation_en", ""),
            "root_cause_category": m.get("root_cause_category", ""),
            "root_cause_confidence": m.get("root_cause_confidence", 0),
            "recommended_action": m.get("recommended_action", ""),
            "resolved": m.get("resolved", False),
        })
    if not rows:
        return []
    result = client.table("mismatches").insert(rows).execute()
    return result.data or []


def get_mismatches(user_id: str, resolved: bool | None = None) -> list[dict]:
    client = get_admin_client()
    query = client.table("mismatches").select("*").eq("user_id", user_id)
    if resolved is not None:
        query = query.eq("resolved", resolved)
    result = query.order("created_at", desc=True).execute()
    return result.data or []


def resolve_mismatch(mismatch_id: str) -> dict:
    client = get_admin_client()
    result = (
        client.table("mismatches")
        .update({"resolved": True, "resolved_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", mismatch_id)
        .execute()
    )
    return result.data[0] if result.data else {}


# ──────────────────────────── Tasks ────────────────────────────

def insert_task(user_id: str, data: dict) -> dict:
    client = get_admin_client()
    row = {
        "user_id": user_id,
        "task_type": data.get("task_type"),
        "supplier_name": data.get("supplier_name"),
        "supplier_id": data.get("supplier_id"),
        "invoice_id": data.get("invoice_id"),
        "amount": data.get("amount"),
        "due_date": data.get("due_date"),
        "status": "pending",
    }
    result = client.table("tasks").insert(row).execute()
    return result.data[0] if result.data else {}


def get_tasks(user_id: str, status: str | None = None) -> list[dict]:
    client = get_admin_client()
    query = client.table("tasks").select("*").eq("user_id", user_id)
    if status:
        query = query.eq("status", status)
    result = query.order("created_at", desc=True).execute()
    return result.data or []


def complete_task(task_id: str, proof_type: str, cash_note: str | None = None) -> dict:
    client = get_admin_client()
    now = datetime.now(timezone.utc).isoformat()
    update_data: dict[str, Any] = {
        "status": "completed",
        "proof_type": proof_type,
        "completed_at": now,
    }
    if cash_note:
        update_data["cash_note"] = cash_note
    result = client.table("tasks").update(update_data).eq("id", task_id).execute()
    return result.data[0] if result.data else {}


# ──────────────────────────── Suppliers ────────────────────────────

def get_or_create_supplier(user_id: str, name: str, gstin: str) -> dict:
    client = get_admin_client()
    result = (
        client.table("suppliers")
        .select("*")
        .eq("user_id", user_id)
        .eq("gstin", gstin)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]
    new = client.table("suppliers").insert({
        "user_id": user_id,
        "name": name,
        "gstin": gstin,
    }).execute()
    return new.data[0] if new.data else {}


def get_suppliers(user_id: str) -> list[dict]:
    client = get_admin_client()
    result = client.table("suppliers").select("*").eq("user_id", user_id).execute()
    return result.data or []


def get_supplier_by_id(supplier_id: str) -> dict | None:
    client = get_admin_client()
    result = client.table("suppliers").select("*").eq("id", supplier_id).limit(1).execute()
    return result.data[0] if result.data else None


# ──────────────────────────── Supplier Health Scores ────────────────────────────

def upsert_supplier_health(user_id: str, supplier_id: str, score_data: dict) -> dict:
    client = get_admin_client()
    row = {
        "user_id": user_id,
        "supplier_id": supplier_id,
        "score": score_data.get("score"),
        "tier": score_data.get("tier"),
        "trend": score_data.get("trend"),
        "total_invoices": score_data.get("total_invoices", 0),
        "total_mismatches": score_data.get("total_mismatches", 0),
        "computed_at": datetime.now(timezone.utc).isoformat(),
    }
    result = client.table("supplier_health_scores").insert(row).execute()
    return result.data[0] if result.data else {}


def get_supplier_health(user_id: str, supplier_id: str) -> dict | None:
    client = get_admin_client()
    result = (
        client.table("supplier_health_scores")
        .select("*")
        .eq("user_id", user_id)
        .eq("supplier_id", supplier_id)
        .order("computed_at", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


# ──────────────────────────── ITC Summary ────────────────────────────

def upsert_itc_summary(user_id: str, summary: dict) -> dict:
    client = get_admin_client()
    row = {
        "user_id": user_id,
        "month": summary.get("month"),
        "total_eligible": summary.get("total_eligible"),
        "total_blocked": summary.get("total_blocked"),
        "total_recoverable": summary.get("total_recoverable"),
        "priority_actions": summary.get("priority_actions"),
        "computed_at": datetime.now(timezone.utc).isoformat(),
    }
    result = client.table("itc_summary").insert(row).execute()
    return result.data[0] if result.data else {}


def get_itc_summary(user_id: str, month: str | None = None) -> dict | None:
    client = get_admin_client()
    query = client.table("itc_summary").select("*").eq("user_id", user_id)
    if month:
        query = query.eq("month", month)
    result = query.order("computed_at", desc=True).limit(1).execute()
    return result.data[0] if result.data else None


# ──────────────────────────── Payments ────────────────────────────

def insert_payment(user_id: str, data: dict) -> dict:
    client = get_admin_client()
    row = {
        "user_id": user_id,
        "task_id": data.get("task_id"),
        "supplier_id": data.get("supplier_id"),
        "amount": data.get("amount"),
        "payment_type": data.get("payment_type"),
        "proof_type": data.get("proof_type"),
        "proof_url": data.get("proof_url"),
        "cash_note": data.get("cash_note"),
    }
    result = client.table("payments").insert(row).execute()
    return result.data[0] if result.data else {}


# ──────────────────────────── AI Recommendations ────────────────────────────

def insert_recommendation(user_id: str, data: dict) -> dict:
    client = get_admin_client()
    row = {
        "user_id": user_id,
        "invoice_id": data.get("invoice_id"),
        "supplier_id": data.get("supplier_id"),
        "recommendation_type": data.get("recommendation_type"),
        "message_en": data.get("message_en"),
        "message_hi": data.get("message_hi"),
        "channel": data.get("channel"),
        "sent": data.get("sent", False),
    }
    result = client.table("ai_recommendations").insert(row).execute()
    return result.data[0] if result.data else {}


# ──────────────────────────── Chat History ────────────────────────────

def insert_chat_message(user_id: str, role: str, content: str, namespaces: list | None = None, grounded: bool = True) -> dict:
    client = get_admin_client()
    row = {
        "user_id": user_id,
        "role": role,
        "content": content,
        "retrieved_namespaces": namespaces,
        "grounded": grounded,
    }
    result = client.table("chat_history").insert(row).execute()
    return result.data[0] if result.data else {}


def get_chat_history(user_id: str, limit: int = 20) -> list[dict]:
    client = get_admin_client()
    result = (
        client.table("chat_history")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return list(reversed(result.data or []))


# ──────────────────────────── Analytics ────────────────────────────

def get_monthly_analytics(user_id: str, month: str) -> dict:
    client = get_admin_client()
    payments_result = (
        client.table("payments")
        .select("amount,payment_type")
        .eq("user_id", user_id)
        .gte("paid_at", f"{month}-01")
        .lt("paid_at", _next_month(month))
        .execute()
    )
    payments = payments_result.data or []

    cash_total = sum(float(p["amount"]) for p in payments if p.get("payment_type") == "cash")
    online_total = sum(float(p["amount"]) for p in payments if p.get("payment_type") != "cash")

    itc = get_itc_summary(user_id, month)
    itc_recovered = float(itc["total_recoverable"]) if itc else 0.0

    return {
        "month": month,
        "cash_total": round(cash_total, 2),
        "online_total": round(online_total, 2),
        "itc_recovered": round(itc_recovered, 2),
        "estimated_ca_cost_saved": round(itc_recovered * 0.05, 2),
    }


# ──────────────────────────── Users ────────────────────────────

def get_user_by_phone(phone: str) -> dict | None:
    client = get_admin_client()
    clean = phone.replace("+", "").replace(" ", "").replace("-", "")
    result = client.table("users").select("*").like("phone", f"%{clean[-10:]}").limit(1).execute()
    return result.data[0] if result.data else None


def create_user(phone: str) -> dict:
    client = get_admin_client()
    result = client.table("users").insert({"phone": phone, "is_verified": True}).execute()
    return result.data[0] if result.data else {}


def verify_user(user_id: str) -> dict:
    client = get_admin_client()
    result = client.table("users").update({"is_verified": True}).eq("id", user_id).execute()
    return result.data[0] if result.data else {}


# ──────────────────────────── OTP ────────────────────────────

def store_otp(phone: str, otp: str, expires_at: str) -> dict:
    client = get_admin_client()
    result = client.table("otp_codes").insert({
        "phone": phone,
        "otp": otp,
        "expires_at": expires_at,
        "verified": False,
    }).execute()
    return result.data[0] if result.data else {}


def get_latest_otp(phone: str) -> dict | None:
    client = get_admin_client()
    result = (
        client.table("otp_codes")
        .select("*")
        .eq("phone", phone)
        .eq("verified", False)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def mark_otp_verified(otp_id: str) -> dict:
    client = get_admin_client()
    result = client.table("otp_codes").update({"verified": True}).eq("id", otp_id).execute()
    return result.data[0] if result.data else {}


def _next_month(month: str) -> str:
    year, m = month.split("-")
    m_int = int(m)
    if m_int == 12:
        return f"{int(year) + 1}-01"
    return f"{year}-{m_int + 1:02d}"
