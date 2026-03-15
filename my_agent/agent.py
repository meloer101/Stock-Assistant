from google.adk.agents.llm_agent import Agent
from litellm import LiteLlm
import os

test_model = LiteLlm(
    model=os.getenv("LLM_MODEL"),
    api_key=os.getenv("LLM_MODEL_API_KEY"),
    # model="ollama/qwen3:0.6b",
    api_base=os.getenv('LLM_BASE_URL', {}),
    # api_base="http://192.168.31.130:11434"
    # api_base="http://192.168.31.130:11434/v1/chat/completions"
)

coordinator_agent = Agent(
    model=test_model,
    name='root_agent',
    description='A helpful assistant for user questions.',
    instruction='Answer user questions to the best of your knowledge',
)

# ADK 框架约定：root_agent 是入口智能体
root_agent = coordinator_agent 
