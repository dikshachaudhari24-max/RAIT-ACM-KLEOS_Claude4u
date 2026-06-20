"""Google Gemini client — handwritten invoice vision + text fallback for Groq.

Gemini Flash is strong at reading messy/handwritten Indian invoices and serves
as a fallback when Groq's daily token limit is exhausted (voice, explanations).
"""

import json

from app.config import settings
from ai.prompts.gemini_vision_prompt import GEMINI_VISION_PROMPT

_configured = False


def _ensure_configured() -> bool:
    """Configure the Gemini SDK once. Returns False if no API key is set."""
    global _configured
    if not settings.GEMINI_API_KEY:
        return False
    if not _configured:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True
    return True


def is_available() -> bool:
    return bool(settings.GEMINI_API_KEY)


def _strip_json(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw
        raw = raw.rsplit("```", 1)[0]
    return raw.strip()


def generate_vision_extraction_gemini(image_path: str) -> dict:
    """Extract invoice fields from an image using Gemini Flash vision.

    Returns the flat {field: {value, confidence}} structure used across the app,
    plus a "corrections" list documenting math/handwriting fixes.
    """
    if not _ensure_configured():
        return {"error": "Gemini API key not configured"}

    import google.generativeai as genai

    ext = image_path.rsplit(".", 1)[-1].lower()
    mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg",
            "webp": "image/webp", "bmp": "image/bmp"}.get(ext, "image/png")

    with open(image_path, "rb") as f:
        img_bytes = f.read()

    model = genai.GenerativeModel(settings.GEMINI_VISION_MODEL)
    response = model.generate_content(
        [
            GEMINI_VISION_PROMPT,
            {"mime_type": mime, "data": img_bytes},
        ],
        generation_config={"temperature": 0.1, "max_output_tokens": 4096},
    )

    raw = _strip_json(response.text or "")
    try:
        data = json.loads(raw)
        data["extraction_method"] = "gemini_vision"
        return data
    except (json.JSONDecodeError, ValueError):
        return {"raw_response": raw, "parse_error": True, "extraction_method": "gemini_vision"}


def gemini_chat(system_prompt: str, user_message: str, temperature: float = 0.3) -> str:
    """Generic text chat via Gemini — used as a Groq fallback."""
    if not _ensure_configured():
        raise RuntimeError("Gemini API key not configured")

    import google.generativeai as genai

    model = genai.GenerativeModel(
        settings.GEMINI_TEXT_MODEL,
        system_instruction=system_prompt,
    )
    response = model.generate_content(
        user_message,
        generation_config={"temperature": temperature, "max_output_tokens": 2048},
    )
    return response.text or ""
