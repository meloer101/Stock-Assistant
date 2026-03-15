from google.adk.agents import LlmAgent

from app.config import config

from ..prompt import CRITIC_PROMPT

critic_agent = LlmAgent(
    model=config.critic_model,
    name="research_critic",
    description="Evaluates research quality and identifies gaps that need additional investigation.",
    instruction=CRITIC_PROMPT,
    output_key="research_evaluation",
)
