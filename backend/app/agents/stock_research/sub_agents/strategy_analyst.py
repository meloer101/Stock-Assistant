from google.adk.agents import LlmAgent

from app.config import config

from ..prompt import STRATEGY_ANALYST_PROMPT

strategy_analyst_agent = LlmAgent(
    model=config.worker_model,
    name="strategy_analyst_agent",
    description="Develops trading strategies based on market data and user risk profile.",
    instruction=STRATEGY_ANALYST_PROMPT,
    output_key="strategy_output",
)
