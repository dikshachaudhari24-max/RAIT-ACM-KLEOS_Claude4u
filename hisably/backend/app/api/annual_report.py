"""Annual ITC Report endpoints — yearly rollups of existing monthly data.

Read-only: aggregates invoices + mismatches + supplier health that other
features already produced. user_id always comes from the verified session
(never a query param) so one user can never read another user's data.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response

from app.db import queries
from app.db.supabase import get_admin_client
from app.deps import verify_jwt
from app.engines.annual_report import (
    build_annual_report,
    build_supplier_detail,
    parse_financial_year,
)

router = APIRouter(prefix="/annual-report", tags=["annual-report"])


def _load_health_by_supplier_id(user_id: str) -> dict:
    """Latest supplier health score per supplier_id for this user."""
    try:
        client = get_admin_client()
        rows = (
            client.table("supplier_health_scores")
            .select("*")
            .eq("user_id", user_id)
            .order("computed_at", desc=True)
            .execute()
        ).data or []
    except Exception:
        return {}
    health: dict = {}
    for r in rows:  # rows are newest-first; keep the first seen per supplier
        sid = r.get("supplier_id")
        if sid and sid not in health:
            health[sid] = r
    return health


def _load_inputs(user_id: str):
    invoices, _ = queries.get_invoices(user_id, page=1, per_page=1000)
    mismatches = queries.get_mismatches(user_id)
    suppliers = queries.get_suppliers(user_id)
    health = _load_health_by_supplier_id(user_id)
    return invoices, mismatches, suppliers, health


@router.get("/itc")
async def annual_itc_report(
    financial_year: str = Query(...),
    user=Depends(verify_jwt),
):
    try:
        parse_financial_year(financial_year)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid financial year format. Use '2024-25'.")

    try:
        invoices, mismatches, suppliers, health = _load_inputs(user["uid"])
        report, has_data = build_annual_report(
            financial_year, invoices, mismatches, suppliers, health
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[annual-report] itc failed: {e}")
        raise HTTPException(status_code=500, detail="Could not build annual report")

    if not has_data:
        raise HTTPException(
            status_code=404,
            detail="No reconciliation data found for this financial year",
        )
    return report


@router.get("/supplier-detail")
async def supplier_annual_detail(
    supplier_gstin: str = Query(...),
    financial_year: str = Query(...),
    user=Depends(verify_jwt),
):
    try:
        parse_financial_year(financial_year)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid financial year format. Use '2024-25'.")

    try:
        invoices, mismatches, suppliers, health = _load_inputs(user["uid"])
        detail, found = build_supplier_detail(
            financial_year, supplier_gstin, invoices, mismatches, suppliers, health
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[annual-report] supplier-detail failed: {e}")
        raise HTTPException(status_code=500, detail="Could not build supplier detail")

    if not found:
        raise HTTPException(
            status_code=404,
            detail="No reconciliation data found for this financial year",
        )
    return detail


@router.get("/export")
async def export_annual_report(
    financial_year: str = Query(...),
    user=Depends(verify_jwt),
):
    """Generate the annual report PDF server-side and return it as a download."""
    try:
        parse_financial_year(financial_year)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid financial year format. Use '2024-25'.")

    try:
        invoices, mismatches, suppliers, health = _load_inputs(user["uid"])
        report, has_data = build_annual_report(
            financial_year, invoices, mismatches, suppliers, health
        )
        if not has_data:
            raise HTTPException(
                status_code=404,
                detail="No reconciliation data found for this financial year",
            )

        user_info = {"name": user.get("email", "") or "Hisably User", "gstin": ""}
        try:
            row = queries.get_user_by_phone_by_id(user["uid"])
            if row:
                user_info["name"] = row.get("business_name") or row.get("phone") or user_info["name"]
                user_info["gstin"] = row.get("gstin") or ""
        except Exception:
            pass

        from app.services.annual_report_pdf import generate_annual_report_pdf
        pdf_bytes = generate_annual_report_pdf(report, user_info)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[annual-report] export failed: {e}")
        raise HTTPException(status_code=500, detail="Could not generate report")

    filename = f"Hisably_Annual_ITC_Report_FY{financial_year}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
