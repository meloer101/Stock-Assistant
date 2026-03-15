import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv
from google.adk.models.lite_llm import LiteLlm

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


def get_llm() -> LiteLlm:
    return LiteLlm(
        model=os.getenv("LLM_MODEL", "deepseek/deepseek-chat"),
        api_key=os.getenv("LLM_MODEL_API_KEY", ""),
        api_base=os.getenv("LLM_BASE_URL", ""),
    )


@dataclass
class ResearchConfig:
    worker_model: LiteLlm = field(default_factory=get_llm)
    critic_model: LiteLlm = field(default_factory=get_llm)
    max_search_iterations: int = 5
    chroma_db_path: str = "./chroma_db"
    chroma_collection_name: str = "investment_docs"
    embedding_model_name: str = "all-MiniLM-L6-v2"
    chunk_size: int = 500
    chunk_overlap: int = 50
    rag_top_k: int = 5
    tavily_max_results: int = 5


config = ResearchConfig()
