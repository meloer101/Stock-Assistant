from __future__ import annotations

import hashlib
import uuid

import fitz  # PyMuPDF

from app.config import config
from app.rag.vector_store import add_documents


def _generate_doc_id(filename: str) -> str:
    return hashlib.md5(filename.encode()).hexdigest()[:12]


def _chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Split text into overlapping chunks by character count."""
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return [c.strip() for c in chunks if c.strip()]


def parse_pdf(file_bytes: bytes) -> list[dict]:
    """Extract text from a PDF, returning a list of {page, text} dicts."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages: list[dict] = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()
        if text.strip():
            pages.append({"page": page_num + 1, "text": text})
    doc.close()
    return pages


def ingest_pdf(filename: str, file_bytes: bytes) -> dict:
    """Parse a PDF, chunk it, and store into ChromaDB. Returns summary info."""
    pages = parse_pdf(file_bytes)
    if not pages:
        return {"status": "error", "message": "No text found in PDF"}

    doc_id = _generate_doc_id(filename)
    all_texts: list[str] = []
    all_metadatas: list[dict] = []
    all_ids: list[str] = []
    total_pages = len(pages)

    for page_info in pages:
        chunks = _chunk_text(
            page_info["text"],
            config.chunk_size,
            config.chunk_overlap,
        )
        for idx, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_{page_info['page']}_{idx}_{uuid.uuid4().hex[:6]}"
            all_texts.append(chunk)
            all_metadatas.append(
                {
                    "source": filename,
                    "page": page_info["page"],
                    "chunk_index": idx,
                    "total_pages": total_pages,
                    "doc_id": doc_id,
                }
            )
            all_ids.append(chunk_id)

    add_documents(texts=all_texts, metadatas=all_metadatas, ids=all_ids)
    return {
        "status": "ok",
        "doc_id": doc_id,
        "filename": filename,
        "pages": total_pages,
        "chunks": len(all_texts),
    }
