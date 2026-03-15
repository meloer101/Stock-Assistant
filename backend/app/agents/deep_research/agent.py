from google.adk.agents import LoopAgent, SequentialAgent

from app.config import config

from .sub_agents.composer import composer_agent
from .sub_agents.critic import critic_agent
from .sub_agents.escalation_checker import escalation_checker
from .sub_agents.planner import planner_agent
from .sub_agents.researcher import researcher_agent

research_loop = LoopAgent(
    name="research_loop",
    sub_agents=[
        researcher_agent,
        critic_agent,
        escalation_checker,
    ],
    max_iterations=config.max_search_iterations,
)

deep_research_pipeline = SequentialAgent(
    name="deep_research_pipeline",
    description=(
        "A two-phase research pipeline: first generates a plan with "
        "human-in-the-loop approval, then autonomously researches and "
        "composes a comprehensive report with citations."
    ),
    sub_agents=[
        planner_agent,
        research_loop,
        composer_agent,
    ],
)
