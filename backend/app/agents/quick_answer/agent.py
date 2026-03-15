from google.adk.agents import LlmAgent

from app.config import config
from app.tools.tavily_search import search_tool

from .prompt import QUICK_ANSWER_PROMPT

quick_answer_agent = LlmAgent(
    model=config.worker_model,
    name="quick_answer_agent",
    description=(
        "Provides fast, concise answers to market questions, industry summaries, "
        "and general financial queries using a single web search."
    ),
    instruction=QUICK_ANSWER_PROMPT,
    tools=[search_tool],
    output_key="quick_answer_output",
)
