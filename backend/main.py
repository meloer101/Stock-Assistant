from __future__ import annotations

import json
import logging
import uuid
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from google.adk.agents.run_config import RunConfig, StreamingMode
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
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

_db_path = Path(__file__).resolve().parent / "sessions.db"
DB_URL = f"sqlite+aiosqlite:///{_db_path}"
session_service = DatabaseSessionService(db_url=DB_URL)

runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)


# ── Helpers ──────────────────────────────────────────────────────────


def _debug_log(run_id: str, hypothesis_id: str, location: str, message: str, data: dict):
    payload = {
        "sessionId": "954828",
        "runId": run_id,
        "hypothesisId": hypothesis_id,
        "location": location,
        "message": message,
        "data": data,
        "timestamp": int(__import__("time").time() * 1000),
    }
    with open("/Users/m/Desktop/Vine-MVP/.cursor/debug-954828.log", "a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")


def _greenlet_available() -> bool:
    try:
        import greenlet  # noqa: F401

        return True
    except Exception:
        return False


def _sqlalchemy_greenlet_state() -> dict[str, Any]:
    try:
        import sqlalchemy.util.concurrency as concurrency

        return {
            "have_greenlet": getattr(concurrency, "have_greenlet", None),
            "greenlet_spawn_module": getattr(concurrency, "__file__", None),
        }
    except Exception as exc:
        return {"error": repr(exc)}


def _extract_messages_from_session(session) -> list[dict]:
    """Convert ADK Session events into a flat list of {role, content, author}."""
    messages: list[dict] = []
    for ev in session.events:
        if not ev.content or not ev.content.parts:
            continue
        text_parts = [
            p.text for p in ev.content.parts if hasattr(p, "text") and p.text
        ]
        if not text_parts:
            continue
        text = "\n".join(text_parts)
        role = "user" if ev.author == "user" else "assistant"
        msg: dict[str, Any] = {"role": role, "content": text}
        if role == "assistant":
            msg["author"] = ev.author
        messages.append(msg)
    return messages


def _session_preview(session) -> str:
    """Read the preview stored in session state (set on first message)."""
    return session.state.get("_preview", "")


# ── Chat endpoint (SSE) ─────────────────────────────────────────────


class ChatRequest(BaseModel):
    message: str
    user_id: str = "default_user"
    session_id: Optional[str] = None


async def _run_agent_stream(request: ChatRequest):
    """Run the agent and yield SSE events."""
    user_id = request.user_id
    session_id = request.session_id

    # #region agent log
    _debug_log(
        "pre-fix",
        "H1",
        "backend/main.py:109",
        "chat stream entered",
        {
            "has_session_id": bool(session_id),
            "greenlet_available": _greenlet_available(),
            "db_url": DB_URL,
        },
    )
    # #endregion

    preview_text = request.message.strip()
    preview = preview_text[:80] + "..." if len(preview_text) > 80 else preview_text

    if session_id:
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
                state={"_preview": preview},
            )
    else:
        session_id = str(uuid.uuid4())
        await session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id,
            state={"_preview": preview},
        )

    # #region agent log
    _debug_log(
        "pre-fix",
        "H1",
        "backend/main.py:142",
        "session ensured for chat stream",
        {"session_id": session_id, "greenlet_available": _greenlet_available()},
    )
    # #endregion

    yield f"data: {json.dumps({'type': 'session_info', 'session_id': session_id})}\n\n"

    user_message = Content(parts=[Part(text=request.message)])

    try:
        run_config = RunConfig(streaming_mode=StreamingMode.SSE, max_llm_calls=30)
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


@app.post("/api/sessions")
async def create_session(user_id: str = "default_user"):
    new_sid = str(uuid.uuid4())
    await session_service.create_session(
        app_name=APP_NAME, user_id=user_id, session_id=new_sid
    )
    return {"session_id": new_sid}


@app.get("/api/sessions")
async def list_sessions(user_id: str = "default_user"):
    # #region agent log
    _debug_log(
        "pre-fix",
        "H1",
        "backend/main.py:212",
        "list sessions entered",
        {
            "user_id": user_id,
            "greenlet_available": _greenlet_available(),
            "db_url": DB_URL,
            "sqlalchemy_state": _sqlalchemy_greenlet_state(),
        },
    )
    # #endregion

    result = await session_service.list_sessions(
        app_name=APP_NAME, user_id=user_id
    )

    # #region agent log
    _debug_log(
        "pre-fix",
        "H3",
        "backend/main.py:223",
        "list sessions completed",
        {"count": len(result.sessions), "greenlet_available": _greenlet_available()},
    )
    # #endregion

    sessions_out = []
    for s in result.sessions:
        sessions_out.append(
            {
                "id": s.id,
                "last_update_time": s.last_update_time,
                "preview": _session_preview(s),
            }
        )
    sessions_out.sort(key=lambda x: x["last_update_time"], reverse=True)
    return {"sessions": sessions_out}


@app.get("/api/sessions/{session_id}")
async def get_session_messages(session_id: str, user_id: str = "default_user"):
    session = await session_service.get_session(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"messages": _extract_messages_from_session(session)}


@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str, user_id: str = "default_user"):
    await session_service.delete_session(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )
    return {"status": "ok"}


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
