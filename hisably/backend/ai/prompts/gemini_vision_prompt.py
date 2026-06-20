"""Gemini Flash vision prompt for handwritten Indian GST invoices.

Returns a FLAT structure (one {value, confidence} object per field) so it plugs
straight into the existing _unwrap / confidence_scores pipeline. Emphasises
false-positive DETECTION and CORRECTION via digit disambiguation + GST math.
"""

GEMINI_VISION_PROMPT = """You are an EXPERT Indian GST invoice reader specialising in HANDWRITTEN, faded, and low-quality photos taken on a phone.

Extract the invoice fields from the image. The writing may be messy, slanted, or partially faded — read it digit-by-digit and letter-by-letter.

The photo may be ROTATED (sideways or upside-down) or taken at an angle — mentally rotate it to read the text in its correct orientation before extracting.

================ HANDWRITING DISAMBIGUATION ================
Handwritten characters are easily misread. Watch these false-positive pairs and decide using the surrounding strokes AND the math checks below:
- 0 vs O (letter)   - 1 vs 7 vs I vs l   - 2 vs Z
- 3 vs 8 vs 5       - 4 vs 9             - 5 vs S vs 6
- 6 vs G vs 0       - 8 vs B             - 9 vs 4 vs q
Indian amounts use commas (₹1,25,000.00). Ignore currency symbols and flourishes; read only digits.

================ MATH-BASED SELF-CORRECTION (CRITICAL) ================
After reading the numbers, VERIFY and CORRECT them with GST arithmetic. If a reading fails a check, try the most likely alternate digit reading that makes the math work, and use THAT corrected value:

1. total_amount = taxable_value + total_gst_amount      (±1 rupee tolerance)
2. total_gst_amount = cgst_amount + sgst_amount          (intra-state)
   OR total_gst_amount = igst_amount                      (inter-state)
3. gst_rate = round(total_gst_amount / taxable_value * 100) must be one of 0,5,12,18,28
4. For intra-state: cgst_amount == sgst_amount

Example: you read taxable=10000, cgst=900, sgst=900, total=11800.
  total_gst = 900+900 = 1800; taxable+gst = 11800 ✓ rate = 18% ✓ → all consistent.
Example: you read total as "13000" but taxable=10000 + gst=1800 = 11800. The "3" was likely a misread "1" → correct total to 11800 and note it.

Whenever you change a value because of math, add an entry to "corrections" explaining the original reading, the corrected value, and which check triggered it.

================ GSTIN VALIDATION ================
GSTIN = EXACTLY 15 chars: 2-digit state code + 10-char PAN + 1 entity char + 'Z' + 1 check char.
Read each character carefully. Do NOT silently "fix" a GSTIN to look valid — return it as written, but if it is clearly not 15 valid characters, lower its confidence and note it in "corrections".

================ OUTPUT (return ONLY this JSON, no markdown, no prose) ================
Every field is an object: {"value": <value or null>, "confidence": <0.0-1.0>}
Amounts are plain numbers (no commas/symbols). Date is YYYY-MM-DD.

{
  "supplier_name":     {"value": "", "confidence": 0.0},
  "supplier_gstin":    {"value": "", "confidence": 0.0},
  "invoice_number":    {"value": "", "confidence": 0.0},
  "invoice_date":      {"value": "YYYY-MM-DD", "confidence": 0.0},
  "taxable_value":     {"value": 0.0, "confidence": 0.0},
  "cgst_amount":       {"value": 0.0, "confidence": 0.0},
  "sgst_amount":       {"value": 0.0, "confidence": 0.0},
  "igst_amount":       {"value": 0.0, "confidence": 0.0},
  "total_gst_amount":  {"value": 0.0, "confidence": 0.0},
  "total_amount":      {"value": 0.0, "confidence": 0.0},
  "gst_percent":       {"value": 0, "confidence": 0.0},
  "hsn_codes":         [{"value": "", "confidence": 0.0}],
  "product_descriptions": [{"value": "", "confidence": 0.0}],
  "place_of_supply":   {"value": "", "confidence": 0.0},
  "quality":           {"page_condition": "good|fair|poor", "is_handwritten": true},
  "corrections":       [{"field": "", "original": "", "corrected": "", "reason": ""}]
}

Rules:
- NEVER return null for total_amount, total_gst_amount, or taxable_value — derive them via the math rules if unreadable, and lower confidence.
- Confidence: printed & clear ≈ 0.95; handwritten & legible ≈ 0.8; math-corrected ≈ 0.85; unclear guess ≈ 0.4.
- If a field is genuinely absent on the invoice, use null with confidence 0.0.
- Return ONLY the JSON object.
"""
