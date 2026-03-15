from google.adk.agents import LlmAgent
from google.adk.tools.agent_tool import AgentTool

from app.config import config

from .prompt import STOCK_COORDINATOR_PROMPT
from .sub_agents.data_analyst import data_analyst_agent
from .sub_agents.risk_analyst import risk_analyst_agent
from .sub_agents.strategy_analyst import strategy_analyst_agent

stock_coordinator = LlmAgent(
    model=config.worker_model,
    name="stock_coordinator",
    description=(
        "Guides users through stock analysis: market data gathering, "
        "strategy development, and risk evaluation."
    ),
    instruction=STOCK_COORDINATOR_PROMPT,
    output_key="stock_research_output",
    tools=[
        AgentTool(agent=data_analyst_agent),
        AgentTool(agent=strategy_analyst_agent),
        AgentTool(agent=risk_analyst_agent),
    ],
)
