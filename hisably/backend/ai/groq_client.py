"""Groq LLM client for invoice extraction and multilingual explanations."""

import json

from groq import Groq

from app.config import settings
from ai.prompts.extraction_prompt import EXTRACTION_PROMPT
from ai.prompts.hindi_explanation_prompt import HINDI_EXPLANATION_PROMPT
from ai.prompts.supplier_recommendation_prompt import SUPPLIER_RECOMMENDATION_PROMPT
from ai.prompts.rag_system_prompt import RAG_SYSTEM_PROMPT

_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def _chat(system_prompt: str, user_message: str, model: str = "llama-3.1-8b-instant", temperature: float = 0.3) -> str:
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
        system_prompt="You are an expert Indian GST invoice data extractor. Return ONLY valid JSON.",
        user_message=prompt,
        model="llama-3.1-70b-versatile",
        temperature=0.1,
    )
    try:
        cleaned = result.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(cleaned)
    except (json.JSONDecodeError, IndexError):
        return {"raw_response": result, "parse_error": True}


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
