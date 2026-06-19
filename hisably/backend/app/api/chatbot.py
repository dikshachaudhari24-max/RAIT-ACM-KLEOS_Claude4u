import os
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.db import queries
from app.deps import verify_jwt
from app.schemas.all_schemas import ChatbotTextRequest, ChatbotTextResponse, ChatbotVoiceResponse

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


@router.post("/query", response_model=ChatbotTextResponse)
async def text_query(request: ChatbotTextRequest, user=Depends(verify_jwt)):
    """Process a text query through the RAG chatbot."""
    queries.insert_chat_message(user["uid"], "user", request.query)

    try:
        from ai.rag.retriever import retrieve_and_respond

        result = retrieve_and_respond(user["uid"], request.query, "invoices")
        response_text = result["response"]
        grounded = True
    except Exception as e:
        response_text = f"I received your question but encountered an error: {e}"
        grounded = False

    queries.insert_chat_message(
        user["uid"], "assistant", response_text,
        namespaces=["invoices", "mismatches"], grounded=grounded,
    )

    return ChatbotTextResponse(
        response_text=response_text,
        retrieved_namespaces=["invoices", "mismatches"],
        grounded=grounded,
    )


@router.post("/voice", response_model=ChatbotVoiceResponse)
async def voice_query(file: UploadFile = File(...), user=Depends(verify_jwt)):
    """Process a voice query through STT, RAG, and TTS."""
    from ai.voice.stt import transcribe
    from ai.voice.tts import synthesize
    from ai.rag.retriever import retrieve_and_respond

    fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(file.filename or ".wav")[1])
    try:
        os.write(fd, await file.read())
        os.close(fd)

        stt_result = transcribe(temp_path)
        if stt_result.get("error"):
            raise HTTPException(status_code=400, detail=stt_result["error"])

        user_text = stt_result["text"]
        queries.insert_chat_message(user["uid"], "user", user_text)

        result = retrieve_and_respond(user["uid"], user_text, "invoices")
        response_text = result["response"]

        audio_path = synthesize(response_text, lang=stt_result.get("language", "hi"))

        queries.insert_chat_message(
            user["uid"], "assistant", response_text,
            namespaces=["invoices", "mismatches"], grounded=True,
        )

        return ChatbotVoiceResponse(
            transcribed_text=user_text,
            response_text=response_text,
            audio_url=audio_path,
        )
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
