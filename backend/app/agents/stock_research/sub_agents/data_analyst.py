from google.adk.agents import LlmAgent

from app.config import config
from app.tools.tavily_search import search_tool

from ..prompt import DATA_ANALYST_PROMPT

data_analyst_agent = LlmAgent(
    model=config.worker_model,
    name="data_analyst_agent",
    description="Gathers comprehensive market data and news for a stock ticker using web search.",
    instruction=DATA_ANALYST_PROMPT,
    output_key="market_data_output",
    tools=[search_tool],
)
