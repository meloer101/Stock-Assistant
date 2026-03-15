from google.adk.agents import LlmAgent

from app.config import config

from ..prompt import RISK_ANALYST_PROMPT

risk_analyst_agent = LlmAgent(
    model=config.worker_model,
    name="risk_analyst_agent",
    description="Evaluates risks of proposed trading strategies and provides risk mitigation advice.",
    instruction=RISK_ANALYST_PROMPT,
    output_key="risk_output",
)
