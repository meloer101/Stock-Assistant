from google.adk.agents import LlmAgent

from app.config import config

from ..prompt import COMPOSER_PROMPT

composer_agent = LlmAgent(
    model=config.worker_model,
    name="report_composer",
    description="Synthesizes all research into a comprehensive markdown report with citations.",
    instruction=COMPOSER_PROMPT,
    output_key="final_report",
)
