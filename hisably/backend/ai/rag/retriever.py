"""RAG retrieval and response generation."""

from ai.rag.embedder import embed_text
from ai.groq_client import generate_rag_response


def retrieve_and_respond(user_id: str, query_text: str, query_type: str) -> dict:
    """Retrieve relevant chunks from vector store and generate a grounded response."""
    query_vector = embed_text(query_text)

    retrieved_chunks = []
    try:
        from ai.rag.pinecone_client import get_namespace, query_vectors

        namespace = get_namespace(user_id, query_type)
        results = query_vectors(namespace, query_vector, top_k=5)
        retrieved_chunks = [
            match.get("metadata", {}).get("text", "")
            for match in results
            if match.get("metadata", {}).get("text")
        ]
    except Exception:
        pass

    if not retrieved_chunks:
        retrieved_chunks = [
            f"User {user_id} asked about: {query_text}. "
            "No specific records found in vector store. Provide a general GST guidance response."
        ]

    response = generate_rag_response(
        query=query_text,
        retrieved_chunks=retrieved_chunks,
        chat_history=[],
        user_lang="hi" if any(ord(c) > 127 for c in query_text) else "en",
    )

    return {
        "response": response,
        "sources": retrieved_chunks[:3],
        "query_type": query_type,
    }
