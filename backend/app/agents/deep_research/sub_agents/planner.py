from google.adk.agents import LlmAgent

from app.config import config
from app.tools.tavily_search import search_tool

from ..prompt import PLANNER_PROMPT

planner_agent = LlmAgent(
    model=config.worker_model,
    name="interactive_planner",
    description="Generates or refines a research plan, then waits for user approval.",
    instruction=PLANNER_PROMPT,
    tools=[search_tool],
    output_key="research_plan",
)
