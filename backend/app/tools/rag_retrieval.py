from __future__ import annotations

from google.adk.tools import FunctionTool

from app.rag.vector_store import query_documents


def retrieve_from_documents(query: str, top_k: int = 5) -> str:
    """Search the uploaded document corpus for information relevant to the query.

    Use this tool when you need to find information from PDFs or documents
    that the user has previously uploaded. The tool returns relevant text
    snippets with their source references.

    Args:
        query: The search query to find relevant document passages.
        top_k: Number of results to return (default 5).

    Returns:
        Formatted string of relevant document passages with citations.
    """
    results = query_documents(query, top_k=top_k)
    if not results:
        return "No relevant documents found. The document corpus may be empty."

    output_parts: list[str] = []
    for i, r in enumerate(results, 1):
        source = r["metadata"].get("source", "unknown")
        page = r["metadata"].get("page", "?")
        output_parts.append(
            f"[{i}] Source: {source}, Page {page}\n{r['text']}\n"
        )
    return "\n---\n".join(output_parts)


rag_tool = FunctionTool(retrieve_from_documents)
