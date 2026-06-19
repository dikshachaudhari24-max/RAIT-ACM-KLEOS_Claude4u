"""Root cause analysis engine for invoice mismatches."""


def classify_root_cause(
    mismatch_type: str,
    ocr_confidence: float,
    user_edited_field: bool,
    supplier_error_history: int,
    total_supplier_invoices: int,
) -> dict:
    """Classify the root cause of a mismatch and return category, confidence, and recommended action."""
    if supplier_error_history >= 2 and ocr_confidence >= 0.70 and not user_edited_field:
        category = "supplier_error"
        confidence = min(95, 60 + supplier_error_history * 10)
        reasoning = (
            f"Supplier has {supplier_error_history} prior errors out of "
            f"{total_supplier_invoices} invoices, OCR confidence is {ocr_confidence:.2f}, "
            f"and the field was not user-edited — pattern indicates supplier-side error."
        )
        action = "Contact supplier to correct the invoice and re-file GSTR-1."

    elif user_edited_field and ocr_confidence < 0.70:
        category = "store_owner_error"
        confidence = 80
        reasoning = (
            f"Field was manually edited by the store owner and OCR confidence is low "
            f"({ocr_confidence:.2f}), suggesting the manual correction may itself be incorrect."
        )
        action = "Review the manually entered value against the original invoice image."

    elif user_edited_field and ocr_confidence >= 0.70:
        category = "store_owner_error"
        confidence = 70
        reasoning = (
            f"Field was manually edited despite high OCR confidence ({ocr_confidence:.2f}). "
            f"The original OCR extraction was likely correct before the edit."
        )
        action = "Compare the edited value with the OCR-extracted value and revert if needed."

    elif ocr_confidence < 0.50 and not user_edited_field:
        category = "shared"
        confidence = 60
        reasoning = (
            f"OCR confidence is very low ({ocr_confidence:.2f}) and no manual edit was made. "
            f"The error could originate from poor image quality or a genuine supplier mistake."
        )
        action = "Re-upload a clearer image of the invoice and verify with the supplier."

    else:
        category = "supplier_error"
        confidence = 50
        reasoning = (
            f"No strong signal detected — OCR confidence {ocr_confidence:.2f}, "
            f"user_edited={user_edited_field}, supplier history {supplier_error_history}/"
            f"{total_supplier_invoices}. Defaulting to supplier error."
        )
        action = "Verify the mismatch details with the supplier."

    return {
        "root_cause_category": category,
        "confidence": confidence,
        "reasoning": reasoning,
        "recommended_action": action,
        "mismatch_type": mismatch_type,
    }
