"""Pinecone vector database client."""

from pinecone import Pinecone

from app.config import settings

_index = None


def _get_index():
    global _index
    if _index is None:
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        _index = pc.Index(settings.PINECONE_INDEX_NAME)
    return _index


def get_namespace(user_id: str, record_type: str) -> str:
    """Build a namespaced key for a user and record type."""
    return f"{user_id}_{record_type}"


def upsert_vector(namespace: str, vector_id: str, vector: list[float], metadata: dict) -> None:
    """Upsert a single vector into the Pinecone index."""
    index = _get_index()
    index.upsert(vectors=[(vector_id, vector, metadata)], namespace=namespace)


def query_vectors(namespace: str, query_vector: list[float], top_k: int = 5) -> list[dict]:
    """Query the Pinecone index for similar vectors."""
    index = _get_index()
    results = index.query(vector=query_vector, top_k=top_k, namespace=namespace, include_metadata=True)
    return [
        {"id": match.id, "score": match.score, "metadata": match.metadata or {}}
        for match in results.matches
    ]


def delete_namespace(namespace: str) -> None:
    """Delete all vectors in a namespace."""
    index = _get_index()
    index.delete(delete_all=True, namespace=namespace)
