"""Groq LLM client for invoice extraction and multilingual explanations."""

import base64
import json

from groq import Groq

from app.config import settings
from ai.prompts.extraction_prompt import EXTRACTION_PROMPT
from ai.prompts.hindi_explanation_prompt import HINDI_EXPLANATION_PROMPT
from ai.prompts.supplier_recommendation_prompt import SUPPLIER_RECOMMENDATION_PROMPT
from ai.prompts.rag_system_prompt import RAG_SYSTEM_PROMPT
from ai.prompts.vision_extraction_prompt import VISION_EXTRACTION_PROMPT
from ai.prompts.voice_assistant_prompt import ARTHA_SYSTEM_PROMPT, VOICE_INVOICE_PROMPT

_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def _chat(system_prompt: str, user_message: str, model: str = "llama-3.3-70b-versatile", temperature: float = 0.3) -> str:
    client = _get_client()
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=temperature,
        max_tokens=2048,
    )
    return response.choices[0].message.content


def generate_invoice_extraction(raw_ocr_text: str) -> dict:
    """Extract structured invoice fields from raw OCR text using Groq LLM."""
    prompt = EXTRACTION_PROMPT.format(ocr_text=raw_ocr_text)
    result = _chat(
        system_prompt="You are an expert Indian GST invoice data extractor. Extract all fields EXACTLY as they appear on the invoice. Never correct or modify GSTIN numbers even if they look invalid. Return ONLY valid JSON.",
        user_message=prompt,
        model="llama-3.3-70b-versatile",
        temperature=0.1,
    )
    try:
        cleaned = result.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(cleaned)
    except (json.JSONDecodeError, IndexError):
        return {"raw_response": result, "parse_error": True}


def generate_vision_extraction(image_path: str) -> dict:
    """Extract structured invoice fields from an image using Groq vision model.

    Sends the preprocessed image directly to a vision-capable LLM so it can
    reason over handwritten/blurry content that defeats plain OCR.
    """
    with open(image_path, "rb") as f:
        img_bytes = f.read()
    b64 = base64.b64encode(img_bytes).decode("utf-8")

    ext = image_path.rsplit(".", 1)[-1].lower()
    mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg",
            "webp": "image/webp", "bmp": "image/bmp"}.get(ext, "image/png")

    client = _get_client()
    response = client.chat.completions.create(
        model=settings.VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": VISION_EXTRACTION_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
                ],
            }
        ],
        temperature=0.1,
        max_tokens=2048,
    )
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, IndexError):
        return {"raw_response": raw, "parse_error": True}


def generate_hindi_explanation(issue_data: dict) -> dict:
    """Generate a Hindi explanation of a GST issue using Groq LLM."""
    prompt = HINDI_EXPLANATION_PROMPT.format(
        issue_type=issue_data.get("issue_type", "unknown"),
        issue_details=json.dumps(issue_data, ensure_ascii=False, default=str),
    )
    explanation = _chat(
        system_prompt="Aap ek GST compliance assistant hain. Simple Hindi mein jawaab dein.",
        user_message=prompt,
    )
    return {"explanation_hi": explanation, "issue_type": issue_data.get("issue_type")}


def generate_supplier_recommendation(issue_data: dict) -> str:
    """Generate a supplier correction recommendation message using Groq LLM."""
    prompt = SUPPLIER_RECOMMENDATION_PROMPT.format(
        supplier_name=issue_data.get("supplier_name", ""),
        issue_type=issue_data.get("issue_type", ""),
        invoice_number=issue_data.get("invoice_number", ""),
        error_details=issue_data.get("error_details", ""),
        suggested_correction=issue_data.get("suggested_correction", ""),
    )
    return _chat(
        system_prompt="You are a professional business communication assistant.",
        user_message=prompt,
    )


def generate_artha_response(
    query: str,
    user_name: str,
    gstin: str,
    language: str,
    rag_context: str,
    faq_context: str,
    history: list,
) -> str:
    """Generate a short conversational voice reply as Artha, grounded in user data + GST FAQ."""
    history_str = "\n".join(
        f"{msg.get('role', 'user')}: {msg.get('content', '')}"
        for msg in (history or [])[-10:]
    )
    system = ARTHA_SYSTEM_PROMPT.format(
        user_name=user_name or "there",
        gstin=gstin or "not set",
        language=language or "English",
        rag_context=rag_context or "No recent activity.",
        faq_context=faq_context or "No specific GST reference.",
        history=history_str or "(start of conversation)",
    )
    return _chat(system_prompt=system, user_message=query, temperature=0.4)


def generate_voice_invoice_extraction(transcript: str, today: str) -> dict:
    """Extract structured invoice fields from a spoken transcript using Groq LLM."""
    prompt = VOICE_INVOICE_PROMPT.format(transcript=transcript, today=today)
    result = _chat(
        system_prompt="You are an expert GST invoice data extractor. Return ONLY valid JSON.",
        user_message=prompt,
        model="llama-3.3-70b-versatile",
        temperature=0.1,
    )
    try:
        cleaned = result.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(cleaned)
    except (json.JSONDecodeError, IndexError):
        return {"raw_response": result, "parse_error": True}


def generate_rag_response(query: str, retrieved_chunks: list, chat_history: list, user_lang: str) -> str:
    """Generate a RAG-grounded response using Groq LLM."""
    context = "\n\n".join(retrieved_chunks) if retrieved_chunks else "No relevant context found."
    history_str = "\n".join(
        f"{msg.get('role', 'user')}: {msg.get('content', '')}"
        for msg in (chat_history or [])[-5:]
    )
    system = RAG_SYSTEM_PROMPT.format(
        context=context,
        user_lang=user_lang,
        chat_history=history_str,
    )
    return _chat(system_prompt=system, user_message=query)
