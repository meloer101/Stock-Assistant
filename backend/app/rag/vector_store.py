from __future__ import annotations

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

from app.config import config

_client: chromadb.PersistentClient | None = None
_collection: chromadb.Collection | None = None


def _get_embedding_fn() -> SentenceTransformerEmbeddingFunction:
    return SentenceTransformerEmbeddingFunction(
        model_name=config.embedding_model_name,
    )


def get_collection() -> chromadb.Collection:
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path=config.chroma_db_path)
        _collection = _client.get_or_create_collection(
            name=config.chroma_collection_name,
            embedding_function=_get_embedding_fn(),
        )
    return _collection


def query_documents(query: str, top_k: int | None = None) -> list[dict]:
    """Query the vector store and return ranked results with metadata."""
    collection = get_collection()
    k = top_k or config.rag_top_k
    results = collection.query(query_texts=[query], n_results=k)

    docs: list[dict] = []
    if not results["documents"] or not results["documents"][0]:
        return docs

    for i, doc_text in enumerate(results["documents"][0]):
        meta = results["metadatas"][0][i] if results["metadatas"] else {}
        distance = results["distances"][0][i] if results["distances"] else None
        docs.append(
            {
                "text": doc_text,
                "metadata": meta,
                "distance": distance,
            }
        )
    return docs


def add_documents(
    texts: list[str],
    metadatas: list[dict],
    ids: list[str],
) -> None:
    collection = get_collection()
    collection.add(documents=texts, metadatas=metadatas, ids=ids)


def delete_document(doc_id_prefix: str) -> int:
    """Delete all chunks whose id starts with doc_id_prefix. Returns count deleted."""
    collection = get_collection()
    all_ids = collection.get()["ids"]
    to_delete = [cid for cid in all_ids if cid.startswith(doc_id_prefix)]
    if to_delete:
        collection.delete(ids=to_delete)
    return len(to_delete)


def list_documents() -> list[dict]:
    """Return unique documents (by source filename) currently stored."""
    collection = get_collection()
    data = collection.get(include=["metadatas"])
    seen: dict[str, dict] = {}
    for meta in data["metadatas"] or []:
        src = meta.get("source", "unknown")
        if src not in seen:
            seen[src] = {
                "source": src,
                "page_count": meta.get("total_pages", "?"),
            }
    return list(seen.values())
