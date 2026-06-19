"""Invoice data extraction using Tesseract OCR + Groq LLM, with vision fallback for handwritten docs."""

import os
import shutil
import platform
import tempfile

import pytesseract
from PIL import Image

from ai.ocr.preprocessor import preprocess_image, is_digital_pdf
from app.config import settings

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


def _avg_confidence(structured: dict) -> float:
    """Compute average confidence from the LLM's per-field confidence scores."""
    conf = structured.get("confidence_scores", {})
    if not conf or not isinstance(conf, dict):
        return 1.0
    vals = []
    for v in conf.values():
        if isinstance(v, (int, float)):
            vals.append(float(v))
        elif isinstance(v, dict) and "confidence" in v:
            vals.append(float(v["confidence"]))
    return sum(vals) / len(vals) if vals else 1.0


def _extract_text_from_pdf(file_path: str) -> str:
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
        img_path = os.path.join(tempfile.gettempdir(), f"page_{page.number}.png")
        pix.save(img_path)
        processed = None
        try:
            processed = preprocess_image(img_path)
            page_text = pytesseract.image_to_string(Image.open(processed), lang=lang)
            full_text.append(page_text)
        except Exception as e:
            full_text.append(f"[Page {page.number} OCR error: {e}]")
        finally:
            for p in (img_path, processed or ""):
                if p and os.path.exists(p):
                    os.unlink(p)
    doc.close()
    return "\n".join(full_text)


def _extract_text_from_image(file_path: str) -> str:
    processed = preprocess_image(file_path)
    lang = _ocr_lang()
    text = pytesseract.image_to_string(Image.open(processed), lang=lang)
    if os.path.exists(processed):
        os.unlink(processed)
    return text


def _try_vision_extraction(file_path: str, user_id: str) -> dict:
    """Send the image directly to Groq vision model for handwritten/low-quality docs."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        import fitz
        doc = fitz.open(file_path)
        pix = doc[0].get_pixmap(dpi=300)
        img_path = os.path.join(tempfile.gettempdir(), "vision_page0.png")
        pix.save(img_path)
        doc.close()
    else:
        img_path = preprocess_image(file_path)

    try:
        from ai.groq_client import generate_vision_extraction
        structured = generate_vision_extraction(img_path)
        structured["extraction_method"] = "vision_llm"
        structured["user_id"] = user_id
        return structured
    except Exception as e:
        return {"error": f"Vision extraction failed: {e}", "extraction_method": "vision_llm"}
    finally:
        if img_path != file_path and os.path.exists(img_path):
            os.unlink(img_path)


def extract(file_path: str, user_id: str) -> dict:
    """Extract structured invoice fields. Tries OCR first, falls back to vision for handwritten docs."""
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    ext = os.path.splitext(file_path)[1].lower()

    # Step 1: Try standard OCR path
    try:
        if ext == ".pdf":
            raw_text = _extract_text_from_pdf(file_path)
        elif ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"):
            raw_text = _extract_text_from_image(file_path)
        else:
            return {"error": f"Unsupported file type: {ext}"}
    except Exception as e:
        raw_text = ""

    # Step 2: If OCR got enough text, try LLM structuring
    if raw_text and len(raw_text.strip()) >= settings.OCR_MIN_TEXT_LENGTH:
        try:
            from ai.groq_client import generate_invoice_extraction
            structured = generate_invoice_extraction(raw_text)
            structured["raw_text"] = raw_text
            structured["user_id"] = user_id
            structured["extraction_method"] = "ocr_llm"

            # Step 3: Check confidence — if too low, fall back to vision
            avg_conf = _avg_confidence(structured)
            if avg_conf >= settings.VISION_CONFIDENCE_THRESHOLD:
                return structured

            # Low confidence — try vision path as supplement
            vision_result = _try_vision_extraction(file_path, user_id)
            if not vision_result.get("error") and not vision_result.get("parse_error"):
                vision_result["raw_text"] = raw_text
                vision_result["ocr_fallback_reason"] = f"OCR confidence {avg_conf:.2f} below threshold {settings.VISION_CONFIDENCE_THRESHOLD}"
                return vision_result

            # Vision also failed — return OCR result (better than nothing)
            return structured

        except Exception as e:
            pass

    # Step 4: OCR text too sparse or empty — go straight to vision
    vision_result = _try_vision_extraction(file_path, user_id)
    if not vision_result.get("error"):
        vision_result["raw_text"] = raw_text or ""
        vision_result["ocr_fallback_reason"] = "OCR text too sparse or empty"
        return vision_result

    if raw_text:
        return {"raw_text": raw_text, "error": "Both OCR and vision extraction failed", "user_id": user_id}

    return {"error": "No text could be extracted from the file", "raw_text": "", "user_id": user_id}
