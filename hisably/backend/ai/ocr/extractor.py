"""Invoice data extraction using Tesseract OCR and Groq LLM."""

import os

import fitz
import pytesseract
from PIL import Image

from ai.ocr.preprocessor import preprocess_image, is_digital_pdf


def _extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF — use digital text if available, else OCR each page."""
    if is_digital_pdf(file_path):
        doc = fitz.open(file_path)
        text = "\n".join(page.get_text() for page in doc)
        doc.close()
        return text

    doc = fitz.open(file_path)
    full_text = []
    for page in doc:
        pix = page.get_pixmap(dpi=300)
        img_path = f"/tmp/page_{page.number}.png"
        pix.save(img_path)
        processed = preprocess_image(img_path)
        page_text = pytesseract.image_to_string(Image.open(processed), lang="eng+hin")
        full_text.append(page_text)
        for p in (img_path, processed):
            if os.path.exists(p):
                os.unlink(p)
    doc.close()
    return "\n".join(full_text)


def _extract_text_from_image(file_path: str) -> str:
    """Extract text from an image using Tesseract after preprocessing."""
    processed = preprocess_image(file_path)
    text = pytesseract.image_to_string(Image.open(processed), lang="eng+hin")
    if os.path.exists(processed):
        os.unlink(processed)
    return text


def extract(file_path: str, user_id: str) -> dict:
    """Extract structured invoice fields from an image or PDF using OCR and LLM."""
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        raw_text = _extract_text_from_pdf(file_path)
    elif ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"):
        raw_text = _extract_text_from_image(file_path)
    else:
        return {"error": f"Unsupported file type: {ext}"}

    if not raw_text.strip():
        return {"error": "No text could be extracted from the file", "raw_text": ""}

    try:
        from ai.groq_client import generate_invoice_extraction
        structured = generate_invoice_extraction(raw_text)
        structured["raw_text"] = raw_text
        structured["user_id"] = user_id
        return structured
    except Exception as e:
        return {"raw_text": raw_text, "parse_error": str(e), "user_id": user_id}
