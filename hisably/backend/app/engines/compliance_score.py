"""Compliance risk indicator engine."""

from datetime import date, timedelta


def get_next_deadline() -> date:
    """Return the next GST filing deadline (day 20 of current or next month)."""
    today = date.today()
    deadline = today.replace(day=20)
    if today.day > 20:
        if today.month == 12:
            deadline = today.replace(year=today.year + 1, month=1, day=20)
        else:
            deadline = today.replace(month=today.month + 1, day=20)
    return deadline


def compute_risk_score(
    unresolved_mismatches: int,
    unresolved_hsn_errors: int,
    uncleared_anomalies: int,
    next_deadline: date | None = None,
) -> dict:
    """Compute a compliance risk score from 0-100 with tier classification."""
    if next_deadline is None:
        next_deadline = get_next_deadline()

    days_to_deadline = (next_deadline - date.today()).days

    mismatch_score = min(40, unresolved_mismatches * 8)
    hsn_score = min(25, unresolved_hsn_errors * 5)
    anomaly_score = min(15, uncleared_anomalies * 5)

    if days_to_deadline <= 3:
        deadline_score = 20
    elif days_to_deadline <= 7:
        deadline_score = 15
    elif days_to_deadline <= 14:
        deadline_score = 10
    elif days_to_deadline <= 21:
        deadline_score = 5
    else:
        deadline_score = 0

    total = min(100, mismatch_score + hsn_score + anomaly_score + deadline_score)

    if total <= 30:
        tier, color = "low", "green"
    elif total <= 60:
        tier, color = "medium", "yellow"
    elif total <= 80:
        tier, color = "high", "orange"
    else:
        tier, color = "critical", "red"

    return {
        "score": total,
        "tier": tier,
        "tier_color": color,
        "breakdown": {
            "unresolved_mismatches": unresolved_mismatches,
            "unresolved_hsn_errors": unresolved_hsn_errors,
            "days_to_deadline": days_to_deadline,
            "uncleared_anomalies": uncleared_anomalies,
        },
        "next_deadline": next_deadline.isoformat(),
    }
