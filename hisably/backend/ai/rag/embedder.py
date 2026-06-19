"""Text embedding generation for RAG pipeline."""

from sentence_transformers import SentenceTransformer

_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    return _model


def embed_text(text: str) -> list[float]:
    """Generate an embedding vector for a single text string."""
    model = _get_model()
    vector = model.encode(text)
    result = vector.tolist()
    assert len(result) == 384, f"Expected 384 dimensions, got {len(result)}"
    return result


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Generate embedding vectors for a batch of text strings."""
    model = _get_model()
    vectors = model.encode(texts)
    result = [v.tolist() for v in vectors]
    for v in result:
        assert len(v) == 384, f"Expected 384 dimensions, got {len(v)}"
    return result
