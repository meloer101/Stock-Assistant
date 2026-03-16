from google.adk.agents import LlmAgent

from app.config import config

from .prompt import THEME_RESEARCH_PROMPT

theme_research_agent = LlmAgent(
    model=config.worker_model,
    name="theme_research_agent",
    description="Time-boxed theme research brief with title-only citations and scenario probabilities.",
    instruction=THEME_RESEARCH_PROMPT,
    output_key="theme_research_output",
)

