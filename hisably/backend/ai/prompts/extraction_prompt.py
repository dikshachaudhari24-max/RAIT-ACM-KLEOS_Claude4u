EXTRACTION_PROMPT = """You are an expert Indian GST invoice data extractor. Given the raw OCR text of an invoice, extract the following fields into a JSON object:

- supplier_name: The name of the supplier/vendor
- supplier_gstin: The 15-character GSTIN of the supplier
- invoice_number: The invoice number
- invoice_date: The invoice date in YYYY-MM-DD format
- taxable_value: The total taxable value (before GST)
- cgst_amount: Central GST amount
- sgst_amount: State GST amount
- igst_amount: Integrated GST amount (if applicable)
- total_gst_amount: Total GST amount
- total_amount: Grand total including GST
- hsn_codes: A list of HSN codes found on the invoice
- product_descriptions: A list of product/service descriptions
- place_of_supply: The place of supply state code

For each field, also provide a confidence score between 0.0 and 1.0.

Return ONLY valid JSON. Do not include any explanation or markdown formatting.

OCR Text:
{ocr_text}"""
