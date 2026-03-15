from google.adk.agents import LlmAgent

from app.config import config
from app.tools.rag_retrieval import rag_tool

from .prompt import DOC_QA_PROMPT

doc_qa_agent = LlmAgent(
    model=config.worker_model,
    name="doc_qa_agent",
    description=(
        "Answers questions about uploaded documents (PDFs, reports, filings) "
        "using RAG retrieval from the document corpus."
    ),
    instruction=DOC_QA_PROMPT,
    tools=[rag_tool],
    output_key="doc_qa_answer",
)
