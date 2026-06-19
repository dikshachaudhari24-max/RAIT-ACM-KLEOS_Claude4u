"""GSTIN validation and checksum verification engine."""

import re

_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
_VALID_STATE_CODES = {str(i).zfill(2) for i in range(1, 38)}
_GSTIN_REGEX = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")


def _compute_check_digit(gstin_14: str) -> str:
    total = 0
    for i, ch in enumerate(gstin_14):
        val = _CHARSET.index(ch)
        product = val * (2 if i % 2 else 1)
        digit_sum = product // 36 + product % 36
        total += digit_sum
    remainder = total % 36
    return _CHARSET[remainder]


def validate_gstin(gstin: str) -> dict:
    """Validate a GSTIN string for format, checksum, and state code correctness."""
    result = {
        "valid": False,
        "error_type": None,
        "error_message": None,
        "state_code": None,
        "corrected_gstin": None,
    }

    if not gstin or not isinstance(gstin, str):
        result["error_type"] = "empty_input"
        result["error_message"] = "GSTIN is empty or None"
        return result

    gstin = gstin.strip().upper()

    if not gstin:
        result["error_type"] = "empty_input"
        result["error_message"] = "GSTIN is empty after stripping whitespace"
        return result

    if not _GSTIN_REGEX.match(gstin):
        result["error_type"] = "format_error"
        result["error_message"] = f"GSTIN '{gstin}' does not match the expected 15-character format"
        return result

    state_code = gstin[:2]
    result["state_code"] = state_code

    if state_code not in _VALID_STATE_CODES:
        result["error_type"] = "invalid_state"
        result["error_message"] = f"State code '{state_code}' is not valid (must be 01-37)"
        return result

    expected_check = _compute_check_digit(gstin[:14])
    if gstin[14] != expected_check:
        result["error_type"] = "checksum_error"
        result["error_message"] = (
            f"Check digit mismatch: expected '{expected_check}', got '{gstin[14]}'"
        )
        result["corrected_gstin"] = gstin[:14] + expected_check
        return result

    result["valid"] = True
    return result
