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


def _flatten_vision_result(result: dict) -> dict:
    """Convert the master vision prompt's nested JSON into the flat format the pipeline expects."""
    fields = result.get("fields", {})
    if not fields:
        return result

    flat = {}
    confidence_scores = {}
    for key, obj in fields.items():
        if isinstance(obj, dict) and "value" in obj:
            flat[key] = obj["value"]
            if "confidence" in obj:
                confidence_scores[key] = obj["confidence"]
        else:
            flat[key] = obj

    flat["confidence_scores"] = confidence_scores

    meta = result.get("metadata", {})
    if meta:
        flat["page_condition"] = meta.get("page_condition")
        flat["overall_quality_score"] = meta.get("overall_quality_score")

    rec = result.get("recommendations", {})
    if rec:
        flat["needs_manual_verification"] = rec.get("needs_manual_verification", False)
        flat["data_quality"] = rec.get("data_quality")

    flat["validation_summary"] = result.get("validation_summary")
    flat["quality_indicators"] = result.get("quality_indicators")

    return flat


def _try_vision_extraction(file_path: str, user_id: str) -> dict:
    """Send the image to the vision LLM (Gemini preferred) for handwritten/low-quality docs.

    The ORIGINAL color image is sent — vision models read full-colour phone photos
    (including rotated/handwritten ones) far better than a binarized/deskewed copy.
    """
    ext = os.path.splitext(file_path)[1].lower()
    temp_img = None
    if ext == ".pdf":
        import fitz
        doc = fitz.open(file_path)
        pix = doc[0].get_pixmap(dpi=300)
        img_path = os.path.join(tempfile.gettempdir(), "vision_page0.png")
        pix.save(img_path)
        doc.close()
        temp_img = img_path
    else:
        # Send the raw photo as-is (no preprocessing) — best for Gemini.
        img_path = file_path

    try:
        from ai.groq_client import generate_vision_extraction
        raw_result = generate_vision_extraction(img_path)
        structured = _flatten_vision_result(raw_result)
        structured.setdefault("extraction_method", raw_result.get("extraction_method", "vision_llm"))
        structured["user_id"] = user_id
        return structured
    except Exception as e:
        return {"error": f"Vision extraction failed: {e}", "extraction_method": "vision_llm"}
    finally:
        if temp_img and os.path.exists(temp_img):
            os.unlink(temp_img)


def extract(file_path: str, user_id: str) -> dict:
    """Extract structured invoice fields.

    Strategy:
      - PHOTOS (jpg/png/...): go straight to the vision LLM (Gemini). Phone photos
        of invoices — especially handwritten/rotated ones — are read far more
        accurately end-to-end by a vision model than by Tesseract OCR + text LLM.
      - DIGITAL PDFs (with embedded text): use the fast, exact text → LLM path.
      - SCANNED PDFs / vision failures: fall back to OCR + text LLM.
    """
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    ext = os.path.splitext(file_path)[1].lower()
    image_exts = (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp")

    if ext not in image_exts and ext != ".pdf":
        return {"error": f"Unsupported file type: {ext}"}

    from ai.gemini_client import is_available as _gemini_available

    # ── Path A: image photos → vision LLM first (Gemini is best for these) ──
    if ext in image_exts and _gemini_available():
        vision_result = _try_vision_extraction(file_path, user_id)
        if not vision_result.get("error") and not vision_result.get("parse_error"):
            vision_result.setdefault("raw_text", "")
            return vision_result
        # Vision failed — fall through to OCR below.

    # ── Path B: digital PDF text, or OCR fallback ──
    try:
        if ext == ".pdf":
            raw_text = _extract_text_from_pdf(file_path)
        else:
            raw_text = _extract_text_from_image(file_path)
    except Exception:
        raw_text = ""

    if raw_text and len(raw_text.strip()) >= settings.OCR_MIN_TEXT_LENGTH:
        try:
            from ai.groq_client import generate_invoice_extraction
            structured = generate_invoice_extraction(raw_text)
            structured["raw_text"] = raw_text
            structured["user_id"] = user_id
            structured["extraction_method"] = "ocr_llm"

            avg_conf = _avg_confidence(structured)
            if avg_conf >= settings.VISION_CONFIDENCE_THRESHOLD:
                return structured

            vision_result = _try_vision_extraction(file_path, user_id)
            if not vision_result.get("error") and not vision_result.get("parse_error"):
                vision_result["raw_text"] = raw_text
                vision_result["ocr_fallback_reason"] = f"OCR confidence {avg_conf:.2f} below threshold"
                return vision_result
            return structured
        except Exception:
            pass

    # ── Path C: last resort — vision (covers scanned PDFs and sparse OCR) ──
    vision_result = _try_vision_extraction(file_path, user_id)
    if not vision_result.get("error"):
        vision_result["raw_text"] = raw_text or ""
        return vision_result

    if raw_text:
        return {"raw_text": raw_text, "error": "Both OCR and vision extraction failed", "user_id": user_id}

    return {"error": "No text could be extracted from the file", "raw_text": "", "user_id": user_id}
