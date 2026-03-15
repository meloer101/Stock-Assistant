from __future__ import annotations

import asyncio
import json
import logging
import uuid
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from google.adk.agents.run_config import RunConfig, StreamingMode
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from pydantic import BaseModel

from app.agent import root_agent
from app.rag.document_manager import ingest_pdf
from app.rag.vector_store import delete_document, list_documents

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Vine Investment Research API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

APP_NAME = "vine_research"
session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)

_user_sessions: dict[str, dict[str, str]] = {}


def _get_or_create_session_id(user_id: str) -> str:
    if user_id not in _user_sessions:
        _user_sessions[user_id] = {}
    if "session_id" not in _user_sessions[user_id]:
        _user_sessions[user_id]["session_id"] = str(uuid.uuid4())
    return _user_sessions[user_id]["session_id"]


# ── Chat endpoint (SSE) ─────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    user_id: str = "default_user"


async def _run_agent_stream(request: ChatRequest):
    """Run the agent and yield SSE events."""
    user_id = request.user_id
    session_id = _get_or_create_session_id(user_id)

    existing = await session_service.get_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
    )
    if existing is None:
        await session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id,
        )

    user_message = Content(parts=[Part(text=request.message)])

    try:
        run_config = RunConfig(streaming_mode=StreamingMode.SSE)
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=user_message,
            run_config=run_config,
        ):
            event_data: dict[str, Any] = {
                "author": event.author or "system",
                "type": "progress",
                "partial": bool(event.partial),
            }

            if event.content and event.content.parts:
                text_parts = [
                    p.text for p in event.content.parts if hasattr(p, "text") and p.text
                ]
                if text_parts:
                    event_data["text"] = "\n".join(text_parts)

            if event.actions and event.actions.state_delta:
                event_data["state_update"] = {
                    k: str(v)[:200] for k, v in event.actions.state_delta.items()
                }

            if hasattr(event, "is_final_response") and event.is_final_response():
                event_data["type"] = "final"

            yield f"data: {json.dumps(event_data, ensure_ascii=False)}\n\n"

    except Exception as e:
        logger.exception("Agent run error")
        yield f"data: {json.dumps({'type': 'error', 'text': str(e)})}\n\n"

    yield "data: [DONE]\n\n"


@app.post("/api/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(
        _run_agent_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── Session management ───────────────────────────────────────────────

@app.post("/api/session/new")
async def new_session(user_id: str = "default_user"):
    new_sid = str(uuid.uuid4())
    _user_sessions.setdefault(user_id, {})["session_id"] = new_sid
    await session_service.create_session(
        app_name=APP_NAME, user_id=user_id, session_id=new_sid
    )
    return {"session_id": new_sid}


# ── Document corpus endpoints ────────────────────────────────────────

@app.post("/api/corpus/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    result = ingest_pdf(file.filename, content)
    if result["status"] == "error":
        raise HTTPException(status_code=422, detail=result["message"])
    return result


@app.get("/api/corpus")
async def list_corpus():
    docs = list_documents()
    return {"documents": docs}


@app.delete("/api/corpus/{doc_id}")
async def delete_corpus_doc(doc_id: str):
    count = delete_document(doc_id)
    return {"deleted_chunks": count}


# ── Health ───────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "app": APP_NAME}


@app.get("/")
async def root():
    return {
        "message": "Vine Investment Research API is running",
        "docs": "/docs",
        "health": "/api/health",
    }
