"""Text-to-speech synthesis using gTTS (Google Translate TTS - free, no API key)."""

import os
import tempfile


def synthesize(text: str, lang: str = "hi") -> str:
    """Synthesize text to audio and return the file path."""
    from gtts import gTTS

    tts = gTTS(text=text, lang=lang, slow=False)
    fd, path = tempfile.mkstemp(suffix=".mp3")
    os.close(fd)
    tts.save(path)
    return path
