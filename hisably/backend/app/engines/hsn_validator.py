"""HSN code validation and auto-correction engine."""

import csv
from pathlib import Path

_HSN_DB: dict[str, dict] = {}


def _load_hsn_db():
    global _HSN_DB
    if _HSN_DB:
        return
    csv_path = Path(__file__).resolve().parents[3] / "mock_data" / "hsn_codes_sample.csv"
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            _HSN_DB[row["code"].strip()] = {
                "description": row["description"].strip(),
                "gst_rate": float(row["gst_rate"]),
                "category": row["category"].strip(),
            }


def _levenshtein(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return _levenshtein(s2, s1)
    if not s2:
        return len(s1)
    prev = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        curr = [i + 1]
        for j, c2 in enumerate(s2):
            cost = 0 if c1 == c2 else 1
            curr.append(min(curr[j] + 1, prev[j + 1] + 1, prev[j] + cost))
        prev = curr
    return prev[-1]


def validate_hsn(code: str) -> dict:
    """Validate an HSN code against the master list and suggest corrections."""
    _load_hsn_db()

    result = {
        "valid": False,
        "description": None,
        "gst_rate": None,
        "category": None,
        "suggested_code": None,
        "suggested_description": None,
    }

    if not code or not isinstance(code, str):
        return result

    code = code.strip()

    if code in _HSN_DB:
        entry = _HSN_DB[code]
        result["valid"] = True
        result["description"] = entry["description"]
        result["gst_rate"] = entry["gst_rate"]
        result["category"] = entry["category"]
        return result

    for prefix_len in (6, 4, 2):
        prefix = code[:prefix_len]
        matches = {k: v for k, v in _HSN_DB.items() if k.startswith(prefix)}
        if matches:
            best_code = min(matches, key=lambda k: abs(len(k) - len(code)))
            entry = matches[best_code]
            result["suggested_code"] = best_code
            result["suggested_description"] = entry["description"]
            result["gst_rate"] = entry["gst_rate"]
            result["category"] = entry["category"]
            return result

    best_dist = float("inf")
    best_match = None
    for db_code in _HSN_DB:
        dist = _levenshtein(code, db_code)
        if dist < best_dist:
            best_dist = dist
            best_match = db_code

    if best_match and best_dist <= 2:
        entry = _HSN_DB[best_match]
        result["suggested_code"] = best_match
        result["suggested_description"] = entry["description"]
        result["gst_rate"] = entry["gst_rate"]
        result["category"] = entry["category"]

    return result
