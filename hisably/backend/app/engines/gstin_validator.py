"""GSTIN validation engine — format and state code verification."""

import re

_VALID_STATE_CODES = {str(i).zfill(2) for i in range(1, 38)}
_GSTIN_REGEX = re.compile(r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")


def validate_gstin(gstin: str) -> dict:
    """Validate a GSTIN string for format and state code correctness."""
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

    if len(gstin) != 15:
        result["error_type"] = "length_error"
        result["error_message"] = f"GSTIN '{gstin}' is {len(gstin)} characters long, expected 15"
        return result

    if not _GSTIN_REGEX.match(gstin):
        result["error_type"] = "format_error"
        result["error_message"] = f"GSTIN '{gstin}' does not match the expected format (2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric)"
        return result

    state_code = gstin[:2]
    result["state_code"] = state_code

    if state_code not in _VALID_STATE_CODES:
        result["error_type"] = "invalid_state"
        result["error_message"] = f"State code '{state_code}' is not valid (must be 01-37)"
        return result

    result["valid"] = True
    return result
