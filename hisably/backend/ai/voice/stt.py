"""Speech-to-text transcription using Groq Whisper."""

import os
import tempfile

from groq import Groq

from app.config import settings

_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def transcribe(audio_file_path: str) -> dict:
    """Transcribe an audio file to text with language detection."""
    if not os.path.exists(audio_file_path):
        return {"error": f"File not found: {audio_file_path}", "text": ""}

    client = _get_client()
    with open(audio_file_path, "rb") as f:
        result = client.audio.transcriptions.create(
            file=(os.path.basename(audio_file_path), f),
            model="whisper-large-v3",
            response_format="verbose_json",
        )

    return {
        "text": result.text,
        "language": getattr(result, "language", "unknown"),
        "duration": getattr(result, "duration", 0),
    }
