"""Annual ITC report aggregation.

Pure functions that roll up 12 months of already-stored reconciliation data
(invoices + mismatches + supplier health) into a yearly view. This module only
READS derived values from existing rows — it never writes or alters the schema.

Monthly buckets are derived from each invoice's `date`. A mismatch is attributed
to the month of its linked invoice (mismatches carry no date of their own).
"""

from __future__ import annotations

import re
from collections import Counter, defaultdict

# Financial-year month order: April → March
_FY_MONTH_SEQUENCE = [
    (4, "April"), (5, "May"), (6, "June"), (7, "July"), (8, "August"),
    (9, "September"), (10, "October"), (11, "November"), (12, "December"),
    (1, "January"), (2, "February"), (3, "March"),
]

_FY_REGEX = re.compile(r"^\d{4}-\d{2}$")


def _f(val) -> float:
    try:
        return float(val or 0)
    except (TypeError, ValueError):
        return 0.0


def parse_financial_year(fy: str) -> tuple[int, int]:
    """'2024-25' -> (2024, 2025). Raises ValueError on a malformed value."""
    if not fy or not _FY_REGEX.match(fy):
        raise ValueError("financial_year must look like '2024-25'")
    start_year = int(fy[:4])
    end_yy = int(fy[5:7])
    if (start_year + 1) % 100 != end_yy:
        raise ValueError("financial_year end does not follow its start year")
    return start_year, start_year + 1


def _in_fy(year: int, month: int, start_year: int) -> bool:
    """Indian FY: Apr(start_year)..Dec(start_year), Jan..Mar(start_year+1)."""
    if month >= 4:
        return year == start_year
    return year == start_year + 1


def _parse_ym(date_str) -> tuple[int, int] | None:
    """'2024-10-15' -> (2024, 10). None if unparseable."""
    if not date_str:
        return None
    parts = str(date_str)[:10].split("-")
    if len(parts) < 2:
        return None
    try:
        return int(parts[0]), int(parts[1])
    except ValueError:
        return None


def _fy_year_for_month(month: int, start_year: int) -> int:
    return start_year if month >= 4 else start_year + 1


def _supplier_identity(mismatch: dict, invoice: dict | None) -> tuple[str, str]:
    """Resolve (name, gstin) for a mismatch, preferring its linked invoice."""
    name = mismatch.get("supplier_name") or (invoice or {}).get("supplier_name") or "Unknown Supplier"
    gstin = (invoice or {}).get("supplier_gstin") or ""
    return name, gstin


def build_annual_report(
    financial_year: str,
    invoices: list[dict],
    mismatches: list[dict],
    suppliers: list[dict],
    health_by_supplier_id: dict[str, dict],
) -> tuple[dict, bool]:
    """Return (report_dict, has_any_data) for the given financial year.

    has_any_data is False when no month in the FY had a reconciliation run
    (i.e. no invoices dated in the FY), which the API turns into a 404.
    """
    start_year, _ = parse_financial_year(financial_year)
    inv_by_id = {inv.get("id"): inv for inv in invoices if inv.get("id")}

    entitled = defaultdict(float)   # month_number -> ITC entitled
    missed = defaultdict(float)     # month_number -> ITC missed (blocked)
    inv_count = defaultdict(int)    # month_number -> invoice count
    months_with_data: set[int] = set()

    for inv in invoices:
        ym = _parse_ym(inv.get("date"))
        if not ym or not _in_fy(ym[0], ym[1], start_year):
            continue
        m = ym[1]
        entitled[m] += _f(inv.get("gst_amount"))
        inv_count[m] += 1
        months_with_data.add(m)

    for mm in mismatches:
        if mm.get("resolved"):
            continue
        inv = inv_by_id.get(mm.get("invoice_id"))
        ym = _parse_ym((inv or {}).get("date"))
        if not ym or not _in_fy(ym[0], ym[1], start_year):
            continue
        m = ym[1]
        missed[m] += _f(mm.get("itc_at_risk")) or _f(mm.get("amount_difference"))
        months_with_data.add(m)

    monthly_data = []
    for month_number, month_name in _FY_MONTH_SEQUENCE:
        year = _fy_year_for_month(month_number, start_year)
        if month_number in months_with_data:
            ent = round(entitled[month_number], 2)
            miss = round(missed[month_number], 2)
            claimed = round(max(ent - miss, 0.0), 2)
            monthly_data.append({
                "month": month_name,
                "month_number": month_number,
                "year": year,
                "has_data": True,
                "invoices_count": inv_count[month_number],
                "itc_entitled": ent,
                "itc_claimed": claimed,
                "itc_missed": miss,
            })
        else:
            monthly_data.append({
                "month": month_name,
                "month_number": month_number,
                "year": year,
                "has_data": False,
                "invoices_count": 0,
                "itc_entitled": 0,
                "itc_claimed": 0,
                "itc_missed": 0,
            })

    total_entitled = round(sum(d["itc_entitled"] for d in monthly_data if d["has_data"]), 2)
    total_claimed = round(sum(d["itc_claimed"] for d in monthly_data if d["has_data"]), 2)
    total_missed = round(sum(d["itc_missed"] for d in monthly_data if d["has_data"]), 2)
    recovery_rate = round(total_claimed / total_entitled * 100, 1) if total_entitled > 0 else 0.0

    leaderboard = _build_leaderboard(
        financial_year, invoices, mismatches, suppliers, health_by_supplier_id, inv_by_id, start_year
    )

    report = {
        "financial_year": financial_year,
        "summary": {
            "total_entitled": total_entitled,
            "total_claimed": total_claimed,
            "total_missed": total_missed,
            "recovery_rate": recovery_rate,
        },
        "monthly_data": monthly_data,
        "supplier_leaderboard": leaderboard,
    }
    return report, bool(months_with_data)


def _build_leaderboard(
    financial_year, invoices, mismatches, suppliers, health_by_supplier_id, inv_by_id, start_year
) -> list[dict]:
    supplier_by_gstin = {s.get("gstin"): s for s in suppliers if s.get("gstin")}
    supplier_by_name = {s.get("name"): s for s in suppliers if s.get("name")}

    agg: dict[str, dict] = defaultdict(
        lambda: {"blocked": 0.0, "count": 0, "types": Counter(), "gstin": "", "name": ""}
    )

    for mm in mismatches:
        if mm.get("resolved"):
            continue
        inv = inv_by_id.get(mm.get("invoice_id"))
        ym = _parse_ym((inv or {}).get("date"))
        if not ym or not _in_fy(ym[0], ym[1], start_year):
            continue
        name, gstin = _supplier_identity(mm, inv)
        key = gstin or name
        a = agg[key]
        a["blocked"] += _f(mm.get("itc_at_risk")) or _f(mm.get("amount_difference"))
        a["count"] += 1
        if mm.get("mismatch_type"):
            a["types"][mm["mismatch_type"]] += 1
        a["gstin"] = a["gstin"] or gstin
        a["name"] = a["name"] or name

    leaderboard = []
    for a in agg.values():
        supplier = supplier_by_gstin.get(a["gstin"]) or supplier_by_name.get(a["name"])
        health_score = 0
        if supplier:
            health = health_by_supplier_id.get(supplier.get("id"))
            if health:
                health_score = health.get("score") or 0
        leaderboard.append({
            "supplier_name": a["name"],
            "supplier_gstin": a["gstin"],
            "total_itc_blocked": round(a["blocked"], 2),
            "mismatch_count": a["count"],
            "most_common_mismatch_type": a["types"].most_common(1)[0][0] if a["types"] else "",
            "health_score": health_score,
        })

    leaderboard.sort(key=lambda x: x["total_itc_blocked"], reverse=True)
    return leaderboard[:5]


def build_supplier_detail(
    financial_year: str,
    supplier_gstin: str,
    invoices: list[dict],
    mismatches: list[dict],
    suppliers: list[dict],
    health_by_supplier_id: dict[str, dict],
) -> tuple[dict, bool]:
    """Return (detail_dict, found) for one supplier within the financial year."""
    start_year, _ = parse_financial_year(financial_year)
    inv_by_id = {inv.get("id"): inv for inv in invoices if inv.get("id")}

    supplier = next((s for s in suppliers if s.get("gstin") == supplier_gstin), None)
    supplier_name = supplier.get("name") if supplier else ""

    monthly_mismatches = []
    types = Counter()
    total_blocked = 0.0
    months_seen: set[tuple[int, int]] = set()

    for mm in mismatches:
        if mm.get("resolved"):
            continue
        inv = inv_by_id.get(mm.get("invoice_id"))
        # Match this supplier by the linked invoice's GSTIN (fallback: name).
        inv_gstin = (inv or {}).get("supplier_gstin") or ""
        name, _g = _supplier_identity(mm, inv)
        matches = (inv_gstin == supplier_gstin) or (supplier_name and name == supplier_name)
        if not matches:
            continue
        ym = _parse_ym((inv or {}).get("date"))
        if not ym or not _in_fy(ym[0], ym[1], start_year):
            continue
        year, month = ym
        blocked = _f(mm.get("itc_at_risk")) or _f(mm.get("amount_difference"))
        total_blocked += blocked
        if mm.get("mismatch_type"):
            types[mm["mismatch_type"]] += 1
        months_seen.add((year, month))
        if not supplier_name:
            supplier_name = name
        monthly_mismatches.append({
            "month": _month_name(month),
            "year": year,
            "mismatch_type": mm.get("mismatch_type") or "",
            "itc_blocked": round(blocked, 2),
            "invoice_id": mm.get("invoice_id") or "",
        })

    # Newest month first for the vertical list.
    monthly_mismatches.sort(key=lambda r: (r["year"], _month_number(r["month"])), reverse=True)

    health_score = 0
    if supplier:
        health = health_by_supplier_id.get(supplier.get("id"))
        if health:
            health_score = health.get("score") or 0

    detail = {
        "supplier_name": supplier_name or "Unknown Supplier",
        "supplier_gstin": supplier_gstin,
        "financial_year": financial_year,
        "summary": {
            "total_itc_blocked": round(total_blocked, 2),
            "months_with_mismatch": len(months_seen),
            "most_common_mismatch_type": types.most_common(1)[0][0] if types else "",
            "health_score": health_score,
        },
        "monthly_mismatches": monthly_mismatches,
    }
    return detail, bool(monthly_mismatches)


_MONTH_NAMES = {n: name for n, name in _FY_MONTH_SEQUENCE}
_MONTH_NUMBERS = {name: n for n, name in _FY_MONTH_SEQUENCE}


def _month_name(month_number: int) -> str:
    return _MONTH_NAMES.get(month_number, "")


def _month_number(month_name: str) -> int:
    return _MONTH_NUMBERS.get(month_name, 0)
