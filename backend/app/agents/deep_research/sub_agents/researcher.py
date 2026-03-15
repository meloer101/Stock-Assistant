from google.adk.agents import LlmAgent

from app.config import config
from app.tools.tavily_search import search_tool

from ..prompt import RESEARCHER_PROMPT

researcher_agent = LlmAgent(
    model=config.worker_model,
    name="section_researcher",
    description="Performs web searches to gather information for a research section.",
    instruction=RESEARCHER_PROMPT,
    tools=[search_tool],
    output_key="research_notes",
)
