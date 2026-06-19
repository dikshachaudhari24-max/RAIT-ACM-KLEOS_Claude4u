"""Invoice data extraction using Tesseract OCR and Groq LLM."""

import os
import shutil
import platform

import pytesseract
from PIL import Image

from ai.ocr.preprocessor import preprocess_image, is_digital_pdf

if platform.system() == "Windows":
    _tesseract = shutil.which("tesseract") or r"C:\Program Files\Tesseract-OCR\tesseract.exe"
else:
    _tesseract = shutil.which("tesseract") or "/usr/bin/tesseract"

if os.path.isfile(_tesseract):
    pytesseract.pytesseract.tesseract_cmd = _tesseract


def _available_langs() -> set:
    try:
        return set(pytesseract.get_languages())
    except Exception:
        return {"eng"}


def _ocr_lang() -> str:
    langs = _available_langs()
    if "hin" in langs:
        return "eng+hin"
    return "eng"


def _extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF — use digital text if available, else OCR each page."""
    import fitz

    if is_digital_pdf(file_path):
        doc = fitz.open(file_path)
        text = "\n".join(page.get_text() for page in doc)
        doc.close()
        return text

    doc = fitz.open(file_path)
    full_text = []
    lang = _ocr_lang()
    for page in doc:
        pix = page.get_pixmap(dpi=300)
        img_path = f"/tmp/page_{page.number}.png"
        pix.save(img_path)
        try:
            processed = preprocess_image(img_path)
            page_text = pytesseract.image_to_string(Image.open(processed), lang=lang)
            full_text.append(page_text)
        except Exception as e:
            full_text.append(f"[Page {page.number} OCR error: {e}]")
        finally:
            for p in (img_path, processed if 'processed' in dir() else ''):
                if p and os.path.exists(p):
                    os.unlink(p)
    doc.close()
    return "\n".join(full_text)


def _extract_text_from_image(file_path: str) -> str:
    """Extract text from an image using Tesseract after preprocessing."""
    processed = preprocess_image(file_path)
    lang = _ocr_lang()
    text = pytesseract.image_to_string(Image.open(processed), lang=lang)
    if os.path.exists(processed):
        os.unlink(processed)
    return text


def extract(file_path: str, user_id: str) -> dict:
    """Extract structured invoice fields from an image or PDF using OCR and LLM."""
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == ".pdf":
            raw_text = _extract_text_from_pdf(file_path)
        elif ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"):
            raw_text = _extract_text_from_image(file_path)
        else:
            return {"error": f"Unsupported file type: {ext}"}
    except Exception as e:
        return {"error": f"OCR failed: {e}", "raw_text": ""}

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
