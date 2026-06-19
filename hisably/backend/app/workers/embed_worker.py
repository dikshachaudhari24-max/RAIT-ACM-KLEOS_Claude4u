from app.workers.celery_app import celery_app


@celery_app.task(bind=True, name="embed_and_upsert")
def embed_and_upsert(self, record_type: str, record_id: str, user_id: str):
    """Generate embeddings for a record and upsert into the Pinecone vector store."""
    from app.db import queries

    if record_type == "invoice":
        record = queries.get_invoice_by_id(record_id)
        if not record:
            return {"error": f"Invoice {record_id} not found"}
        text = (
            f"Invoice {record.get('invoice_number')} from {record.get('supplier_name')} "
            f"dated {record.get('date')} for ₹{record.get('total_amount')} "
            f"HSN: {record.get('hsn_code')} - {record.get('product_description')}"
        )
    elif record_type == "mismatch":
        mismatches = queries.get_mismatches(user_id)
        record = next((m for m in mismatches if m["id"] == record_id), None)
        if not record:
            return {"error": f"Mismatch {record_id} not found"}
        text = (
            f"Mismatch: {record.get('mismatch_type')} for {record.get('supplier_name')} "
            f"amount difference ₹{record.get('amount_difference')} "
            f"root cause: {record.get('root_cause_category')}"
        )
    else:
        return {"error": f"Unknown record type: {record_type}"}

    try:
        from ai.rag.embedder import embed_text
        from ai.rag.pinecone_client import get_namespace, upsert_vector

        vector = embed_text(text)
        namespace = get_namespace(user_id, record_type)
        upsert_vector(namespace, record_id, vector, {"text": text, "record_type": record_type})
        return {"record_id": record_id, "embedded": True}
    except Exception as e:
        return {"record_id": record_id, "embedded": False, "error": str(e)}
