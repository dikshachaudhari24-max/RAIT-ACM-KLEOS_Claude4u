"""CA Dashboard API — no auth required, uses GSTIN to identify the client."""

import json
from datetime import date, timedelta

from fastapi import APIRouter, HTTPException, Query

from app.db import queries
from app.db.supabase import get_admin_client

router = APIRouter(prefix="/ca", tags=["ca-dashboard"])


def _get_client_invoices(gstin: str) -> list[dict]:
    client = get_admin_client()
    result = (
        client.table("invoices")
        .select("*")
        .or_(f"supplier_gstin.ilike.%{gstin}%,user_id.in.({_user_ids_for_gstin(gstin)})")
        .order("created_at", desc=True)
        .limit(1000)
        .execute()
    )
    return result.data or []


def _user_ids_for_gstin(gstin: str) -> str:
    """Find user IDs whose invoices mention this GSTIN (i.e. the business owner)."""
    client = get_admin_client()
    result = (
        client.table("users")
        .select("id")
        .limit(100)
        .execute()
    )
    if not result.data:
        return "'none'"
    return ",".join(f"'{u['id']}'" for u in result.data)


def _get_all_invoices_for_dashboard(user_id: str = None) -> list[dict]:
    client = get_admin_client()
    q = client.table("invoices").select("*").order("created_at", desc=True).limit(1000)
    if user_id:
        q = q.eq("user_id", user_id)
    result = q.execute()
    return result.data or []


def _get_all_mismatches(user_id: str = None) -> list[dict]:
    client = get_admin_client()
    q = client.table("mismatches").select("*").limit(1000)
    if user_id:
        q = q.eq("user_id", user_id)
    result = q.execute()
    return result.data or []


def _get_all_gstr2b(user_id: str = None) -> list[dict]:
    client = get_admin_client()
    q = client.table("gstr2b_records").select("*").limit(1000)
    if user_id:
        q = q.eq("user_id", user_id)
    result = q.execute()
    return result.data or []


def _get_all_suppliers(user_id: str = None) -> list[dict]:
    client = get_admin_client()
    q = client.table("suppliers").select("*").limit(500)
    if user_id:
        q = q.eq("user_id", user_id)
    result = q.execute()
    return result.data or []


def _build_summary(invoices: list, mismatches: list, gstr2b: list, suppliers: list) -> dict:
    """Build the CA dashboard summary from raw data — no LLM needed for basic stats."""
    total_amount = sum(float(inv.get("total_amount") or 0) for inv in invoices)
    total_gst = sum(float(inv.get("gst_amount") or 0) for inv in invoices)
    total_taxable = sum(float(inv.get("taxable_value") or 0) for inv in invoices)

    blocked_itc = sum(float(m.get("itc_at_risk") or m.get("amount_difference") or 0) for m in mismatches)
    resolved_mismatches = sum(1 for m in mismatches if m.get("resolved"))

    gstin_issues = sum(1 for m in mismatches if m.get("mismatch_type") == "gstin_mismatch")
    amount_issues = sum(1 for m in mismatches if m.get("mismatch_type") == "amount_mismatch")
    missing_issues = sum(1 for m in mismatches if m.get("mismatch_type") == "missing_invoice")

    unique_suppliers = set()
    for inv in invoices:
        gstin = inv.get("supplier_gstin")
        if gstin:
            unique_suppliers.add(gstin)

    validated = sum(1 for inv in invoices if inv.get("status") == "validated")
    issues = sum(1 for inv in invoices if inv.get("status") in ("error_gstin", "error_hsn", "anomalous", "ocr_error"))

    gst_rates = {"5": 0, "12": 0, "18": 0, "28": 0, "other": 0}
    for inv in invoices:
        rate = float(inv.get("gst_percent") or 0)
        if rate <= 0:
            continue
        bucket = str(int(rate)) if str(int(rate)) in gst_rates else "other"
        gst_rates[bucket] += 1

    confidence_scores = []
    for inv in invoices:
        cs = inv.get("confidence_scores")
        if isinstance(cs, dict):
            vals = [float(v) for v in cs.values() if isinstance(v, (int, float))]
            if vals:
                confidence_scores.append(sum(vals) / len(vals))

    avg_confidence = (sum(confidence_scores) / len(confidence_scores)) if confidence_scores else 0
    high_confidence_pct = (sum(1 for c in confidence_scores if c >= 0.85) / len(confidence_scores) * 100) if confidence_scores else 0

    risk_score = min(100, int(
        (gstin_issues * 15) +
        (amount_issues * 10) +
        (missing_issues * 8) +
        (issues * 5) +
        max(0, 30 - high_confidence_pct * 0.3)
    ))

    if risk_score <= 30:
        color = "green"
    elif risk_score <= 60:
        color = "yellow"
    else:
        color = "red"

    readiness = int((validated / len(invoices) * 100)) if invoices else 0

    supplier_scorecards = []
    for gstin in unique_suppliers:
        s_invoices = [inv for inv in invoices if inv.get("supplier_gstin") == gstin]
        s_mismatches = [m for m in mismatches if m.get("supplier_gstin") == gstin]
        s_name = s_invoices[0].get("supplier_name", "Unknown") if s_invoices else "Unknown"
        s_total = sum(float(inv.get("total_amount") or 0) for inv in s_invoices)
        s_itc_risk = sum(float(m.get("itc_at_risk") or m.get("amount_difference") or 0) for m in s_mismatches)
        s_issues = len(s_mismatches)
        s_reliability = max(0, 100 - (s_issues * 20))
        s_color = "green" if s_reliability >= 70 else ("yellow" if s_reliability >= 40 else "red")

        supplier_scorecards.append({
            "supplier_name": s_name,
            "supplier_gstin": gstin,
            "total_invoices": len(s_invoices),
            "total_value": round(s_total, 2),
            "reliability_score": s_reliability,
            "color_status": s_color,
            "issues_count": s_issues,
            "itc_at_risk": round(s_itc_risk, 2),
            "action_needed": "Follow up on mismatches" if s_issues > 0 else "No action needed",
        })

    supplier_scorecards.sort(key=lambda s: s["reliability_score"])

    action_items = []
    if gstin_issues > 0:
        action_items.append({
            "priority": "critical" if gstin_issues > 3 else "high",
            "action": f"Resolve {gstin_issues} GSTIN mismatches with suppliers",
            "itc_impact": round(blocked_itc * 0.5, 2),
            "effort": "15_mins" if gstin_issues <= 3 else "30_mins",
            "deadline_suggestion": "immediate",
        })
    if missing_issues > 0:
        action_items.append({
            "priority": "high",
            "action": f"Follow up on {missing_issues} invoices missing from GSTR-2B",
            "itc_impact": round(blocked_itc * 0.3, 2),
            "effort": "15_mins",
            "deadline_suggestion": "this_week",
        })
    if amount_issues > 0:
        action_items.append({
            "priority": "medium",
            "action": f"Verify {amount_issues} amount discrepancies",
            "itc_impact": round(blocked_itc * 0.2, 2),
            "effort": "15_mins",
            "deadline_suggestion": "before_filing",
        })
    if issues > 0:
        action_items.append({
            "priority": "medium",
            "action": f"Review {issues} invoices with extraction issues",
            "itc_impact": 0,
            "effort": "30_mins",
            "deadline_suggestion": "this_week",
        })

    return {
        "report_type": "ca_dashboard_comprehensive",
        "report_date": date.today().isoformat(),

        "executive_summary": {
            "compliance_status": {
                "overall_risk_score": risk_score,
                "color": color,
                "trend": "stable",
            },
            "financial_snapshot": {
                "total_invoice_amount": round(total_amount, 2),
                "total_taxable_value": round(total_taxable, 2),
                "total_eligible_itc": round(total_gst, 2),
                "total_blocked_itc": round(blocked_itc, 2),
                "recovery_potential": round(blocked_itc * 0.6, 2),
                "invoice_count": len(invoices),
                "supplier_count": len(unique_suppliers),
                "gst_rate_distribution": gst_rates,
            },
            "key_metrics": {
                "avg_invoice_amount": round(total_amount / len(invoices), 2) if invoices else 0,
                "itc_recovery_rate": round(resolved_mismatches / len(mismatches) * 100, 1) if mismatches else 100,
                "hsn_error_rate": round(sum(1 for inv in invoices if inv.get("status") == "error_hsn") / len(invoices) * 100, 1) if invoices else 0,
                "gstin_mismatch_rate": round(gstin_issues / len(invoices) * 100, 1) if invoices else 0,
                "data_quality_score": round(high_confidence_pct, 1),
            },
        },

        "filing_readiness": {
            "readiness_percent": readiness,
            "urgency": "low" if readiness >= 90 else ("medium" if readiness >= 70 else ("high" if readiness >= 50 else "critical")),
            "total_invoices_processed": len(invoices),
            "invoices_validated": validated,
            "invoices_with_issues": issues,
            "net_claimable_itc": round(total_gst - blocked_itc, 2),
            "total_blocked_itc": round(blocked_itc, 2),
        },

        "supplier_scorecards": supplier_scorecards[:20],

        "risk_assessment": {
            "total_mismatches": len(mismatches),
            "gstin_mismatches": gstin_issues,
            "amount_mismatches": amount_issues,
            "missing_invoices": missing_issues,
            "anomalous_invoices": sum(1 for inv in invoices if inv.get("status") == "anomalous"),
            "fraud_risk_level": "very_low" if risk_score < 30 else ("low" if risk_score < 50 else ("medium" if risk_score < 70 else "high")),
            "compliance_status": "compliant" if risk_score < 40 else ("conditional" if risk_score < 70 else "non_compliant"),
        },

        "ca_action_items": action_items,

        "ca_recommendations": {
            "filing_strategy": f"{'Conservative filing recommended — resolve {len(mismatches)} mismatches before claiming full ITC' if mismatches else 'All clear — file with full ITC claim'}",
            "supplier_engagement": f"{len([s for s in supplier_scorecards if s['issues_count'] > 0])} suppliers need follow-up for GSTIN/amount corrections",
            "data_quality_improvements": f"Average extraction confidence: {avg_confidence:.0%}. {'Consider re-scanning low-confidence invoices' if avg_confidence < 0.8 else 'Data quality is good'}",
        },

        "gstr2b_reconciliation": {
            "total_2b_records": len(gstr2b),
            "matched": len(invoices) - len(mismatches) if len(invoices) > len(mismatches) else 0,
            "mismatched": gstin_issues + amount_issues,
            "missing": missing_issues,
        },
    }


@router.get("/dashboard")
async def ca_dashboard(user_id: str = Query(None)):
    """CA Dashboard — returns comprehensive analysis. No auth required.
    Pass user_id to filter for a specific client, or omit for all data."""
    invoices = _get_all_invoices_for_dashboard(user_id)
    mismatches = _get_all_mismatches(user_id)
    gstr2b = _get_all_gstr2b(user_id)
    suppliers = _get_all_suppliers(user_id)

    if not invoices:
        return {
            "report_type": "ca_dashboard_comprehensive",
            "report_date": date.today().isoformat(),
            "message": "No invoice data found. Upload invoices to generate CA dashboard.",
            "executive_summary": {
                "compliance_status": {"overall_risk_score": 0, "color": "green", "trend": "stable"},
                "financial_snapshot": {"total_invoice_amount": 0, "total_eligible_itc": 0, "total_blocked_itc": 0, "invoice_count": 0, "supplier_count": 0},
                "key_metrics": {"avg_invoice_amount": 0, "data_quality_score": 0},
            },
            "filing_readiness": {"readiness_percent": 0, "urgency": "low"},
            "supplier_scorecards": [],
            "risk_assessment": {"total_mismatches": 0, "fraud_risk_level": "very_low"},
            "ca_action_items": [],
            "ca_recommendations": {},
        }

    summary = _build_summary(invoices, mismatches, gstr2b, suppliers)
    return summary


@router.get("/dashboard/ai-insights")
async def ca_ai_insights(user_id: str = Query(None)):
    """Generate LLM-powered CA insights from the dashboard data."""
    invoices = _get_all_invoices_for_dashboard(user_id)
    mismatches = _get_all_mismatches(user_id)
    gstr2b = _get_all_gstr2b(user_id)

    if not invoices:
        return {"insights": "No data available for analysis. Upload invoices first."}

    client_data = {
        "invoice_count": len(invoices),
        "total_amount": sum(float(inv.get("total_amount") or 0) for inv in invoices),
        "total_gst": sum(float(inv.get("gst_amount") or 0) for inv in invoices),
        "mismatch_count": len(mismatches),
        "gstin_issues": sum(1 for m in mismatches if m.get("mismatch_type") == "gstin_mismatch"),
        "amount_issues": sum(1 for m in mismatches if m.get("mismatch_type") == "amount_mismatch"),
        "missing_issues": sum(1 for m in mismatches if m.get("mismatch_type") == "missing_invoice"),
        "gstr2b_count": len(gstr2b),
        "validated_count": sum(1 for inv in invoices if inv.get("status") == "validated"),
        "error_count": sum(1 for inv in invoices if inv.get("status") in ("error_gstin", "error_hsn", "anomalous")),
        "blocked_itc": sum(float(m.get("itc_at_risk") or 0) for m in mismatches),
    }

    try:
        from ai.groq_client import _chat
        from ai.prompts.ca_dashboard_prompt import CA_DASHBOARD_INTELLIGENCE_PROMPT

        prompt = CA_DASHBOARD_INTELLIGENCE_PROMPT.format(client_data=json.dumps(client_data, default=str))
        result = _chat(
            system_prompt="You are an expert Chartered Accountant AI assistant. Provide professional, actionable insights.",
            user_message=prompt,
            temperature=0.2,
        )
        cleaned = result.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(cleaned)
    except Exception as e:
        return {"insights": f"AI analysis unavailable: {e}", "raw_data": client_data}


@router.get("/export/summary")
async def ca_export_summary(user_id: str = Query(None)):
    """Export a text-based CA summary suitable for email or print."""
    invoices = _get_all_invoices_for_dashboard(user_id)
    mismatches = _get_all_mismatches(user_id)
    gstr2b = _get_all_gstr2b(user_id)
    suppliers = _get_all_suppliers(user_id)

    if not invoices:
        return {"format": "text", "content": "No invoice data available."}

    summary = _build_summary(invoices, mismatches, gstr2b, suppliers)
    es = summary["executive_summary"]
    fs = es["financial_snapshot"]
    fr = summary["filing_readiness"]

    lines = [
        "=" * 60,
        "HISABLY — CA DASHBOARD REPORT",
        f"Date: {summary['report_date']}",
        "=" * 60,
        "",
        "EXECUTIVE SUMMARY",
        "-" * 40,
        f"Risk Score: {es['compliance_status']['overall_risk_score']}/100 ({es['compliance_status']['color'].upper()})",
        f"Total Invoices: {fs['invoice_count']}",
        f"Total Amount: Rs.{fs['total_invoice_amount']:,.2f}",
        f"Eligible ITC: Rs.{fs['total_eligible_itc']:,.2f}",
        f"Blocked ITC: Rs.{fs['total_blocked_itc']:,.2f}",
        f"Suppliers: {fs['supplier_count']}",
        "",
        "FILING READINESS",
        "-" * 40,
        f"Readiness: {fr['readiness_percent']}% ({fr['urgency'].upper()})",
        f"Validated: {fr['invoices_validated']}/{fr['total_invoices_processed']}",
        f"Issues: {fr['invoices_with_issues']}",
        f"Net Claimable ITC: Rs.{fr['net_claimable_itc']:,.2f}",
        "",
        "ACTION ITEMS",
        "-" * 40,
    ]

    for item in summary["ca_action_items"]:
        lines.append(f"[{item['priority'].upper()}] {item['action']} (ITC: Rs.{item['itc_impact']:,.2f})")

    lines.append("")
    lines.append("=" * 60)

    return {"format": "text", "content": "\n".join(lines)}
