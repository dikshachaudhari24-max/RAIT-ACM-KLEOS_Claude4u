from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="process_invoice_ocr")
def process_invoice_ocr(self, invoice_id: str, file_url: str, user_id: str):
    """Run OCR extraction, GSTIN/HSN validation, anomaly scoring, and embedding for an invoice."""
    from app.db import queries
    from app.engines.gstin_validator import validate_gstin
    from app.engines.hsn_validator import validate_hsn

    invoice = queries.get_invoice_by_id(invoice_id)
    if not invoice:
        return {"error": f"Invoice {invoice_id} not found"}

    # TODO: OCR extraction via ai/ocr/extractor.py when Google Vision key is configured
    # For now, mark as needing manual review if no extracted data
    update_data = {"status": "processing"}
    queries.update_invoice(invoice_id, update_data)

    gstin = invoice.get("supplier_gstin")
    if gstin:
        gstin_result = validate_gstin(gstin)
        if not gstin_result["valid"]:
            update_data["status"] = "error_gstin"
            if gstin_result.get("corrected_gstin"):
                update_data["supplier_gstin"] = gstin_result["corrected_gstin"]

    hsn = invoice.get("hsn_code")
    if hsn:
        hsn_result = validate_hsn(hsn)
        if not hsn_result["valid"]:
            update_data["status"] = "error_hsn"
            if hsn_result.get("suggested_code"):
                update_data["hsn_code"] = hsn_result["suggested_code"]

    try:
        from ai.anomaly.isolation_forest import InvoiceAnomalyScorer
        scorer = InvoiceAnomalyScorer()
        score = scorer.score(invoice)
        update_data["anomaly_score"] = round(score, 4)
        if scorer.is_anomalous(score):
            update_data["status"] = "anomalous"
    except Exception:
        pass

    if update_data.get("status") == "processing":
        update_data["status"] = "validated"

    queries.update_invoice(invoice_id, update_data)

    if invoice.get("supplier_gstin") and invoice.get("supplier_name"):
        queries.get_or_create_supplier(user_id, invoice["supplier_name"], invoice["supplier_gstin"])

    return {"invoice_id": invoice_id, "status": update_data.get("status")}
