from __future__ import annotations

import os

from google.adk.tools import FunctionTool
from tavily import TavilyClient

from app.config import config


def tavily_search(query: str, max_results: int = 5) -> str:
    """Search the web for real-time information using Tavily AI Search.

    Use this tool to find up-to-date news, market data, financial reports,
    company information, and any other web-accessible information.

    Args:
        query: The search query string.
        max_results: Maximum number of results to return (default 5).

    Returns:
        Formatted search results with titles, URLs, and content snippets.
    """
    api_key = os.getenv("TAVILY_API_KEY", "")
    if not api_key:
        return "Error: TAVILY_API_KEY not configured. Please set it in .env"

    client = TavilyClient(api_key=api_key)
    k = max_results or config.tavily_max_results
    response = client.search(query=query, max_results=k)

    results = response.get("results", [])
    if not results:
        return f"No search results found for: {query}"

    output_parts: list[str] = []
    for i, r in enumerate(results, 1):
        title = r.get("title", "Untitled")
        url = r.get("url", "")
        content = r.get("content", "")[:500]
        output_parts.append(f"[{i}] {title}\nURL: {url}\n{content}\n")
    return "\n---\n".join(output_parts)


search_tool = FunctionTool(tavily_search)
